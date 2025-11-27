# app/vision.py
# Versão revisada, robusta e tolerante a falhas para comunicação com Gemini (Google Generative AI).
# Principais características:
# - Fallbacks múltiplos para extrair texto/JSON das respostas do Gemini
# - Tratamento detalhado de erros (incluindo falta de chave 'conteudo')
# - Otimização de imagens antes do upload / envio ao modelo
# - Upload opcional para GCS (se GOOGLE_APPLICATION_CREDENTIALS configurado)
# - Rate limiting simples entre chamadas ao Gemini
# - Logs informativos (debug/info/warn/error)
# - Designed to degrade gracefully: returns structured error objects instead of raising

import os
import io
import json
import re
import logging
import time
import traceback
from typing import Any, Dict, List, Optional
from concurrent.futures import ThreadPoolExecutor

from PIL import Image
from io import BytesIO

# Google libraries (já estavam sendo usados)
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# GCS (opcional — não quebra se credenciais faltarem)
try:
    from google.cloud import storage
except Exception:
    storage = None  # fallback se não houver lib/credenciais

# ---------- Logging ----------
logger = logging.getLogger("app.vision")
logger.setLevel(logging.INFO)
if not logger.handlers:
    h = logging.StreamHandler()
    fmt = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    h.setFormatter(fmt)
    logger.addHandler(h)

logger.info("🔧 Carregando app/vision.py")

# ---------- Configs ----------
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "nutriscan-images")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PROMPT_SCAN_RAPIDO = os.getenv("PROMPT_SCAN_RAPIDO", """
(seu prompt aqui sem alterações)
""").strip()  # substitua por prompt real em produção

# Rate limit (segundos) entre chamadas ao Gemini
GEMINI_RATE_LIMIT = float(os.getenv("GEMINI_RATE_LIMIT_S", "0.3"))
_last_gemini_call = 0.0

# ThreadPool para operações de I/O (requests bloqueantes)
executor = ThreadPoolExecutor(max_workers=4)

# Inicializar GCS client (opcional)
gcs_client = None
gcs_bucket = None
if storage and os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    try:
        gcs_client = storage.Client()
        gcs_bucket = gcs_client.bucket(GCS_BUCKET_NAME)
        logger.info(f"✅ GCS client inicializado, bucket: {GCS_BUCKET_NAME}")
    except Exception as e:
        logger.warning(f"⚠️ Não foi possível inicializar GCS: {e}")

# Inicializar Gemini
gemini_model = None
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # instância reutilizável
        gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")
        logger.info("✅ Gemini configurado (models/gemini-2.5-flash)")
    except Exception as e:
        logger.error(f"❌ Falha ao configurar Gemini: {e}", exc_info=True)
else:
    logger.warning("⚠️ GEMINI_API_KEY não definida; chamadas ao Gemini irão falhar")

# ---------- Utilitários ----------

def _rate_limit_sleep():
    """Simples rate limiter entre chamadas ao Gemini."""
    global _last_gemini_call
    now = time.time()
    elapsed = now - _last_gemini_call
    if elapsed < GEMINI_RATE_LIMIT:
        to_sleep = GEMINI_RATE_LIMIT - elapsed
        time.sleep(to_sleep)
    _last_gemini_call = time.time()

def optimize_image(image_bytes: bytes, max_size=(1024, 1024), quality: int = 80) -> bytes:
    """Redimensiona e comprime a imagem, retornando bytes JPEG."""
    try:
        img = Image.open(BytesIO(image_bytes))
        img.convert("RGB")
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        out = BytesIO()
        img.save(out, format="JPEG", quality=int(quality), optimize=True)
        out.seek(0)
        return out.read()
    except Exception as e:
        logger.warning(f"⚠️ Falha na otimização de imagem: {e}")
        return image_bytes

def upload_image_to_gcs(image_bytes: bytes, filename: str) -> Optional[str]:
    """Faz upload para GCS e retorna URL pública (se possível)."""
    if not gcs_bucket:
        logger.debug("GCS não configurado — pulando upload")
        return None
    try:
        blob = gcs_bucket.blob(filename)
        blob.upload_from_string(image_bytes, content_type="image/jpeg")
        try:
            blob.make_public()
            return blob.public_url
        except Exception:
            return f"gs://{GCS_BUCKET_NAME}/{filename}"
    except Exception as e:
        logger.warning(f"⚠️ Erro no upload para GCS: {e}")
        return None

def _extract_text_from_response(response: Any) -> Optional[str]:
    """
    Extrai texto de uma resposta Gemini com múltiplos fallbacks.
    Trabalha com:
     - response.text
     - response.candidates[0].content.parts[...] (vários formatos)
     - response.candidates[0].content (strings ou dicts)
    """
    try:
        # fallback 1: atributo .text (comum nos snippets)
        text = getattr(response, "text", None)
        if text:
            return text if isinstance(text, str) else str(text)

        # fallback 2: candidates -> content -> parts
        candidates = getattr(response, "candidates", None)
        if candidates and len(candidates) > 0:
            cand0 = candidates[0]
            # many SDK shapes
            content = getattr(cand0, "content", None) or getattr(cand0, "message", None) or cand0
            # If content has 'parts' (for multi-part responses)
            if hasattr(content, "parts"):
                try:
                    parts = content.parts
                    # parts may be list-like; join text
                    joined = ""
                    for p in parts:
                        if isinstance(p, dict):
                            joined += p.get("text", "") or p.get("content", "") or ""
                        else:
                            joined += str(getattr(p, "text", p))
                    if joined:
                        return joined
                except Exception:
                    pass
            # If content is dict-like str
            if isinstance(content, dict):
                # attempt to stringify relevant fields
                for k in ("text", "content", "message"):
                    if k in content:
                        return content[k] if isinstance(content[k], str) else json.dumps(content[k])
                return json.dumps(content)
            # If content is string-like
            if isinstance(content, str):
                return content
            # last resort: stringify candidate
            return str(cand0)
    except Exception as e:
        logger.debug(f"_extract_text_from_response fallback error: {e}")
    return None

def _clean_json_text(maybe: str) -> Optional[str]:
    """Remove fences ```json``` e tenta isolar o objeto JSON."""
    if not maybe:
        return None
    s = maybe.strip()
    # remove code fences
    s = re.sub(r"^```(?:json)?\s*", "", s, flags=re.I)
    s = re.sub(r"\s*```$", "", s, flags=re.I)
    # try to find first { ... } block
    m = re.search(r"\{.*\}", s, flags=re.S)
    if m:
        return m.group()
    return s

def extrair_json_da_resposta(texto_resposta: Optional[str]) -> Dict[str, Any]:
    """Tenta extrair/parsear JSON de uma string de resposta do modelo com vários fallbacks."""
    if not texto_resposta:
        return {"erro": "Resposta vazia do modelo."}
    cleaned = _clean_json_text(texto_resposta)
    if not cleaned:
        return {"erro": "Não foi possível limpar/identificar JSON na resposta do modelo.", "raw": texto_resposta[:1000]}
    try:
        return json.loads(cleaned)
    except Exception as e:
        # Tenta correções simples: vírgulas finais, aspas simples para aspas duplas
        try:
            attempt = cleaned.strip()
            attempt = re.sub(r",\s*}", "}", attempt)
            attempt = re.sub(r",\s*]", "]", attempt)
            attempt = attempt.replace("'", '"')
            return json.loads(attempt)
        except Exception as e2:
            logger.debug(f"extrair_json_da_resposta parse failed: {e2}")
            return {"erro": "JSON inválido do modelo.", "raw_cleaned": cleaned[:200], "parse_error": str(e2)}

# ---------- Funções principais (exportadas para uso no router) ----------

def escanear_prato_extrair_alimentos(imagem_bytes: bytes) -> Dict[str, Any]:
    """
    Função resiliente para scan rápido do prato.
    Retorna um dicionário com chaves previsíveis:
      - sucesso (bool)
      - conteudo (dict)  <-- quando OK
      - erro (str)       <-- quando falha
    """
    if not gemini_model:
        return {"sucesso": False, "erro": "Gemini não configurado."}

    start = time.time()
    try:
        # valida imagem
        try:
            _ = Image.open(BytesIO(imagem_bytes))
        except Exception:
            return {"sucesso": False, "erro": "Arquivo não é uma imagem válida."}

        # Otimiza (não obrigatório, previne payloads enormes)
        optimized = optimize_image(imagem_bytes)

        # opcional: upload para GCS (apenas para debugging/links)
        uploaded_url = None
        try:
            timestamp = int(time.time())
            filename = f"scan_{timestamp}.jpg"
            uploaded_url = upload_image_to_gcs(optimized, filename)
        except Exception:
            uploaded_url = None

        # Prepare prompt: usa PROMPT_SCAN_RAPIDO que pode ser placeholder
        prompt_text = PROMPT_SCAN_RAPIDO or """
        Analise a imagem e retorne um JSON com a chave 'conteudo' contendo:
          - modalidade
          - alimentos_extraidos (lista de objetos com nome, quantidade_estimada_g, confianca)
        Se não conseguir identificar, retorne conteudo = {} ou {"erro": "..."}
        """

        # Rate limit
        _rate_limit_sleep()

        logger.debug("Chamando Gemini (scan rápido)...")
        # Chamada robusta ao Gemini: enviamos prompt + imagem (o SDK aceita imagem como objeto PIL)
        # Aceitamos várias formas de resposta, depois fazemos parsing
        response = gemini_model.generate_content(
            [prompt_text, Image.open(BytesIO(optimized))],
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=1024,
            ),
            safety_settings=[
                {"category": HarmCategory.HARM_CATEGORY_HARASSMENT, "threshold": HarmBlockThreshold.BLOCK_NONE},
                {"category": HarmCategory.HARM_CATEGORY_HATE_SPEECH, "threshold": HarmBlockThreshold.BLOCK_NONE},
                {"category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, "threshold": HarmBlockThreshold.BLOCK_NONE},
                {"category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, "threshold": HarmBlockThreshold.BLOCK_NONE},
            ],
            stream=False,
        )

        # Extrair texto via fallback
        texto = _extract_text_from_response(response)
        logger.debug(f"Raw text from Gemini (truncated): { (texto[:500] + '...') if texto and len(texto)>500 else texto }")

        conteudo = None
        if texto:
            conteudo = extrair_json_da_resposta(texto)
        else:
            # Se não há texto, inspeciona candidatos/via repr
            try:
                # última tentativa: stringify inteiro
                texto2 = str(response)
                conteudo = extrair_json_da_resposta(texto2)
            except Exception:
                conteudo = {"erro": "Sem texto na resposta do modelo."}

        # Validar resultado esperado: chave 'conteudo' ou estrutura padrão
        if isinstance(conteudo, dict) and "erro" not in conteudo:
            # Se o prompt real retornou um objeto já com 'conteudo', aceita-o
            if "conteudo" in conteudo:
                # proteção: garantir que conteudo seja dict
                if not isinstance(conteudo["conteudo"], dict):
                    # tenta parsear se string
                    if isinstance(conteudo["conteudo"], str):
                        parsed = extrair_json_da_resposta(conteudo["conteudo"])
                        if "erro" not in parsed:
                            conteudo["conteudo"] = parsed
                # agora validado (ou não)
                final = {"sucesso": True, "conteudo": conteudo["conteudo"]}
                if uploaded_url:
                    final["_debug_image_url"] = uploaded_url
                return final

            # Se o prompt foi diferente e devolveu já um JSON com campos esperados:
            expected_keys = ("modalidade", "resultado", "alimentos", "alimentos_extraidos", "foods", "detalhes_prato")
            if any(k in conteudo for k in expected_keys):
                final = {"sucesso": True, "conteudo": conteudo}
                if uploaded_url:
                    final["_debug_image_url"] = uploaded_url
                return final

        # Se chegar aqui: conteúdo inválido ou erro
        logger.error("❌ [ENDPOINT] Chave ausente em resultado_scan: conteudo ou estrutura inesperada")
        logger.debug(f"Conteudo parseado: {conteudo}")
        return {
            "sucesso": False,
            "erro": "Resposta do modelo não contém a chave 'conteudo' ou estrutura esperada.",
            "conteudo_bruto_parseado": (conteudo if isinstance(conteudo, dict) else str(conteudo))[:2000],
            "_raw_text": (texto or "")[:2000],
            "_debug_image_url": uploaded_url
        }

    except Exception as e:
        logger.error(f"💥 Erro em escanear_prato_extrair_alimentos: {e}", exc_info=True)
        return {"sucesso": False, "erro": "Erro interno ao processar a imagem."}
    finally:
        elapsed = time.time() - start
        logger.debug(f"escanear_prato_extrair_alimentos tempo: {elapsed:.3f}s")

# =================================================================
# ✅ FUNÇÃO 3: Obter APENAS recomendações
# =================================================================
def gerar_recomendacoes_detalhadas_ia(
    lista_alimentos: List[Dict[str, Any]], 
    totais: Dict[str, float]
) -> Dict[str, Any]:
    """
    Recebe a lista de alimentos e os TOTAIS CALCULADOS (pelo Python).
    Usa o Gemini para gerar APENAS as recomendações e vitaminas.
    """
    if not gemini_model: return {"erro": "API do Gemini não configurada."}

    if not lista_alimentos:
        logger.error("Tentativa de analisar lista de alimentos vazia.")
        return {"erro": "A lista de alimentos para análise está vazia."}

    alimentos_str = "\n".join([f"- {item['nome']}: {item['quantidade_gramas']}g" for item in lista_alimentos])
    totais_str = f"""
    - Calorias Totais: {totais.get('kcal', 0):.0f} kcal
    - Proteínas Totais: {totais.get('protein', 0):.1f} g
    - Carboidratos Totais: {totais.get('carbs', 0):.1f} g
    - Gorduras Totais: {totais.get('fats', 0):.1f} g
    """

    prompt_lista = f"""Você é um nutricionista especialista. Analise esta refeição com base nos alimentos e nos seus totais nutricionais.
    
Lista de Alimentos:
{alimentos_str}

Totais Nutricionais da Refeição:
{totais_str}

Forneça APENAS um objeto JSON com as seguintes chaves:
{{
  "vitaminas_minerais": ["string (principais vitaminas e minerais inferidos da lista de alimentos)"], 
  "recomendacoes": {{ 
    "pontos_positivos": ["string (aspectos bons da combinação)"], 
    "sugestoes_balanceamento": ["string (o que poderia melhorar com base nos totais e alimentos)"], 
    "alternativas_saudaveis": ["string (sugestões de trocas)"] 
  }}
}}
"""
    try:
        logger.info(f"-> Enviando lista de alimentos para obter RECOMENDAÇÕES...")
        response = gemini_model.generate_content(prompt_lista)
        
        logger.info(f"Resposta bruta Gemini (recomendações): {response.text}")
        resultado = extrair_json_da_resposta(response.text)
        logger.info(f"Resultado processado (recomendações): {resultado}")

        return resultado
        
    except Exception as e:
        logger.error(f"ERRO: Falha na comunicação com a API do Gemini (recomendações): {e}")
        return {"erro": "Desculpe, não foi possível gerar as recomendações no momento."}


def analisar_imagem_do_prato_detalhado(conteudo_imagem: bytes) -> Dict[str, Any]:
    """Versão mais completa / detalhada — retorna JSON com 'detalhes_prato' etc."""
    if not gemini_model:
        return {"erro": "Gemini não configurado."}
    start = time.time()
    try:
        optimized = optimize_image(conteudo_imagem, max_size=(1280, 1280), quality=85)
        prompt = """
        Você é um nutricionista especialista. Analise a foto e RETORNE APENAS UM JSON com as chaves:
        {
          "detalhes_prato": {"alimentos":[{"nome":"", "quantidade_gramas":0, "metodo_preparo":"", "categoria":""}]},
          "analise_nutricional": {"calorias_totais":0, "macronutrientes": {"proteinas_g":0,"carboidratos_g":0,"gorduras_g":0}, "vitaminas_minerais":[""]},
          "recomendacoes": {"pontos_positivos":[""], "sugestoes_balanceamento":[""], "alternativas_saudaveis":[""]}
        }
        """
        _rate_limit_sleep()
        response = gemini_model.generate_content(
            [prompt, Image.open(BytesIO(optimized))],
            generation_config=genai.types.GenerationConfig(
                temperature=0.08,
                max_output_tokens=1200,
                response_mime_type="application/json"
            ),
            stream=False
        )
        texto = _extract_text_from_response(response)
        resultado = extrair_json_da_resposta(texto)
        # Garantir retorno válido
        if isinstance(resultado, dict) and "erro" not in resultado:
            return resultado
        else:
            return {"erro": "Resposta do modelo inválida/inalcançável.", "raw_parse": resultado}
    except Exception as e:
        logger.error(f"💥 Erro analisar_imagem_do_prato_detalhado: {e}", exc_info=True)
        return {"erro": "Erro interno na análise detalhada."}
    finally:
        logger.debug(f"analisar_imagem_do_prato_detalhado tempo: {time.time()-start:.3f}s")

# Funções auxiliares assíncronas (para uso pelo router se necessário)
async def fetch_gemini_nutritional_data_parallel(alimento_nome: str) -> Dict[str, Any]:
    loop = None
    try:
        import asyncio
        loop = asyncio.get_event_loop()
    except Exception:
        loop = None
    if loop:
        return await loop.run_in_executor(executor, fetch_gemini_nutritional_data, alimento_nome)
    else:
        return fetch_gemini_nutritional_data(alimento_nome)

def fetch_gemini_nutritional_data(alimento_nome: str) -> Dict[str, Any]:
    """Consulta Gemini para dados nutricionais (100g) — retorna dict com valores ou erro."""
    if not gemini_model:
        return {"erro": "Gemini não configurado."}
    start = time.time()
    prompt = f"""
    Você é um assistente de banco de dados nutricional.
    Para o alimento "{alimento_nome}", forneça os dados nutricionais para 100g em formato JSON puro:
    {{
      "alimento": "{alimento_nome}",
      "energia_kcal_100g": 0,
      "proteina_g_100g": 0,
      "carboidrato_g_100g": 0,
      "lipidios_g_100g": 0,
      "fibra_g_100g": 0,
      "un_medida_caseira": "",
      "peso_aproximado_g": 0
    }}
    """
    try:
        _rate_limit_sleep()
        resp = gemini_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.05,
                max_output_tokens=300,
                response_mime_type="application/json"
            ),
            stream=False
        )
        text = _extract_text_from_response(resp)
        parsed = extrair_json_da_resposta(text)
        return parsed
    except Exception as e:
        logger.error(f"Erro fetch_gemini_nutritional_data({alimento_nome}): {e}")
        return {"erro": "Falha ao obter dados nutricionais."}
    finally:
        logger.debug(f"fetch_gemini_nutritional_data tempo: {time.time()-start:.3f}s")


# Cleanup helper (pode ser chamado no shutdown do app)
def cleanup():
    try:
        executor.shutdown(wait=False)
        logger.info("🧹 vision executor shutdown")
    except Exception:
        pass

# Se o arquivo for executado diretamente (para testes locais)
if __name__ == "__main__":
    logger.info("Modo de teste local para vision.py")
    # exemplo de teste local breve:
    try:
        sample_path = "example.jpg"
        if os.path.exists(sample_path):
            with open(sample_path, "rb") as f:
                out = escanear_prato_extrair_alimentos(f.read())
                print(json.dumps(out, indent=2, ensure_ascii=False))
        else:
            logger.info("Arquivo example.jpg não encontrado — coloque uma imagem para teste.")
    except Exception:
        logger.exception("Erro no teste local")
