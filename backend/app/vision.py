# app/vision.py - VERSÃO COM LOGS GARANTIDOS
# Este ficheiro APENAS fala com a API do Gemini.

import os
import json
import re
import logging
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, List, Optional
from google.cloud import storage
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from PIL import Image
from io import BytesIO

# 🔥 CONFIGURAÇÃO ROBUSTA DE LOGGING
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Configuração do Google Cloud Storage
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "nutriscan-images") # Substitua pelo nome real do seu bucket
storage_client = storage.Client()
bucket = storage_client.bucket(GCS_BUCKET_NAME)

# Se não tiver handlers, adiciona um
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

logger.info("🔧 vision.py carregado - logging configurado")

# Configuração da API Key
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("A variável de ambiente GEMINI_API_KEY não está definida.")
    genai.configure(api_key=api_key)
    # Definimos o modelo padrão aqui para ser usado em todas as chamadas
    # Usando gemini-2.5-flash para velocidade
    gemini_model = genai.GenerativeModel('models/gemini-2.5-flash') 
    logger.info("✅ API Gemini configurada com sucesso com 'gemini-2.5-flash'")
except Exception as e:
    logger.error(f"❌ Erro ao configurar a API do Gemini: {e}")
    gemini_model = None


# Executor para operações de I/O
executor = ThreadPoolExecutor(max_workers=3)
logger.info(f"🔄 ThreadPoolExecutor iniciado com {executor._max_workers} workers")

# Rate limiting para Gemini
_last_gemini_call = 0
GEMINI_RATE_LIMIT = 0.3

def get_text_from_response(response):
    if hasattr(response, "text") and response.text:
        return response.text
    
    try:
        return response.candidates[0].content.parts[0].text
    except Exception:
        logger.error("❌ Não foi possível extrair texto da resposta Gemini.")
        return None


# --- FUNÇÃO DE OTIMIZAÇÃO DE IMAGEM ---
def optimize_image(image_bytes: bytes, max_size: tuple = (1024, 1024), quality: int = 85) -> bytes:
    """
    Otimiza uma imagem redimensionando-a e comprimindo-a.

    Args:
        image_bytes: Os bytes da imagem original.
        max_size: Uma tupla (largura, altura) para o tamanho máximo da imagem.
                  A imagem será redimensionada mantendo a proporção.
        quality: Qualidade da compressão JPEG (0-100).

    Returns:
        Os bytes da imagem otimizada.
    """
    try:
        img = Image.open(BytesIO(image_bytes))

        # Redimensionar a imagem mantendo a proporção
        img.thumbnail(max_size, Image.Resampling.LANCZOS) # Use Image.Resampling.LANCZOS para melhor qualidade

        # Salvar a imagem otimizada em um buffer de bytes
        output_buffer = BytesIO()
        # Salva como JPEG para melhor compressão em fotos
        img.save(output_buffer, format="JPEG", quality=quality, optimize=True)
        output_buffer.seek(0)
        return output_buffer.getvalue()
    except Exception as e:
        logger.error(f"Erro ao otimizar imagem: {e}")
        return image_bytes # Retorna a imagem original em caso de erro

# --- FUNÇÃO DE UPLOAD PARA GCS (EXEMPLO - adapte à sua) ---
def upload_image_to_gcs(image_bytes: bytes, filename: str) -> str:
    """
    Faz o upload de uma imagem para o Google Cloud Storage.
    Retorna a URL pública da imagem.
    """
    try:
        # Otimiza a imagem antes de fazer o upload
        optimized_image_bytes = optimize_image(image_bytes)

        blob = bucket.blob(filename)
        blob.upload_from_string(optimized_image_bytes, content_type="image/jpeg")
        blob.make_public() # Torna a imagem publicamente acessível

        public_url = blob.public_url
        logger.info(f"✅ Imagem '{filename}' otimizada e enviada para GCS: {public_url}")
        return public_url
    except Exception as e:
        logger.error(f"❌ Erro ao fazer upload da imagem para GCS: {e}")
        raise # Re-lança a exceção para que o chamador possa lidar com ela

def rate_limited_gemini_call():
    global _last_gemini_call
    now = time.time()
    elapsed = now - _last_gemini_call
    if elapsed < GEMINI_RATE_LIMIT:
        time.sleep(GEMINI_RATE_LIMIT - elapsed)
    _last_gemini_call = time.time()

def extrair_json_da_resposta(texto_resposta: str) -> Dict[str, Any]:
    if not texto_resposta:
        logger.error("❌ Resposta vazia recebida do modelo de IA.")
        return {"erro": "Resposta vazia do modelo de IA"}
    try:
        cleaned = re.sub(r'^```json\s*|\s*```$', '', texto_resposta.strip(), flags=re.IGNORECASE | re.DOTALL)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("⚠️ Falha ao parsear JSON diretamente. Tentando extrair de texto.")
        json_match = re.search(r'\{.*\}', texto_resposta, re.DOTALL)
        if json_match:
            try:
                json_str = json_match.group()
                cleaned_match = re.sub(r'^```json\s*|\s*```$', '', json_str.strip(), flags=re.IGNORECASE | re.DOTALL)
                return json.loads(cleaned_match)
            except json.JSONDecodeError as e_inner:
                logger.error(f"❌ Falha ao parsear JSON extraído: {e_inner}")
                return {"erro": "Resposta não contém JSON válido."}
        logger.error("❌ Nenhum JSON encontrado na resposta.")
        return {"erro": "Nenhum JSON válido encontrado na resposta."}

# =================================================================
# ✅ FUNÇÃO 1: Scan Rápido (COM LOGS GARANTIDOS)
# =================================================================
def escanear_prato_extrair_alimentos(conteudo_imagem: bytes) -> Dict[str, Any]:
    """Scan rápido com métricas detalhadas de tempo"""
    if not gemini_model: 
        logger.error("🚫 Gemini não configurado")
        return {"erro": "API do Gemini não configurada."}
    start_time = time.time()
    logger.info("⏱️ [SCAN RÁPIDO] === INICIANDO ===")
    try:
        if not conteudo_imagem: 
            logger.error("🚫 Imagem vazia")
            return {"erro": "Imagem vazia"}
        # Fase 1: Carregar imagem
        load_start = time.time()
        img = Image.open(BytesIO(conteudo_imagem))
        load_time = time.time() - load_start
        logger.info(f"📸 [SCAN RÁPIDO] Imagem carregada: {load_time:.3f}s")
        # Fase 2: Chamar API Gemini
        api_start = time.time()
        prompt_scan = """SCAN RÁPIDO. Retorne APENAS JSON: {"alimentos_extraidos": [{"nome", "categoria" (nutricional), "quantidade_estimada_g", "confianca" ('alta'|'media'|'baixa'), "calorias_estimadas"}], "resumo_nutricional": {"total_calorias", "total_proteinas_g", "total_carboidratos_g", "total_gorduras_g"}, "alertas": []}"""
        response = gemini_model.generate_content(
            [prompt_scan, img], 
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=1000,
            )
        )
        api_time = time.time() - api_start
        logger.info(f"🤖 [SCAN RÁPIDO] Gemini respondeu: {api_time:.3f}s")
        if not response.text: 
            total_time = time.time() - start_time
            logger.error(f"🚫 [SCAN RÁPIDO] Resposta vazia - Total: {total_time:.3f}s")
            return {"erro": "Resposta vazia da API"}
        # Fase 3: Processar resposta
        json_start = time.time()
        resultado = extrair_json_da_resposta(response.text)
        json_time = time.time() - json_start
        total_time = time.time() - start_time
        # 🔥 RELATÓRIO DE PERFORMANCE (SEMPRE MOSTRA)
        alimentos_count = len(resultado.get('alimentos_extraidos', []))
        logger.info("📊 [SCAN RÁPIDO] === RELATÓRIO ===")
        logger.info(f"   ⏳ Carregamento: {load_time:.3f}s")
        logger.info(f"   ⏳ API Gemini: {api_time:.3f}s")
        logger.info(f"   ⏳ Processamento: {json_time:.3f}s")
        logger.info(f"   🎯 TOTAL: {total_time:.3f}s")
        logger.info(f"   🍽️ Alimentos: {alimentos_count}")
        logger.info("✅ [SCAN RÁPIDO] === CONCLUÍDO ===")
        return resultado
    except Exception as e:
        total_time = time.time() - start_time
        logger.error(f"💥 [SCAN RÁPIDO] ERRO em {total_time:.3f}s: {str(e)}")
        return {"erro": f"Falha no scan rápido: {str(e)}"}

# =================================================================
# ✅ FUNÇÃO 2: Dados nutricionais (COM LOGS GARANTIDOS)
# =================================================================
def fetch_gemini_nutritional_data(alimento_nome: str) -> Dict[str, Any]:
    if not gemini_model: 
        logger.error("🚫 Gemini não configurado")
        return {"erro": "API do Gemini não configurada."}
    start_time = time.time()
    logger.info(f"⏱️ [DADOS NUTRI] Consultando: '{alimento_nome}'")
    prompt = f"""
    Você é um assistente de banco de dados nutricional.
    Para o alimento "{alimento_nome}", forneça os dados nutricionais para 100g.
    Estime também uma "unidade", "un_medida_caseira" e "peso_aproximado_g" comuns para este alimento.
    Responda APENAS com um objeto JSON. O objeto deve ter as seguintes chaves (use 0 se não souber um valor):
    {{
      "alimento": "{alimento_nome}",
      "energia_kcal_100g": "<valor_numerico>",
      "proteina_g_100g": "<valor_numerico>",
      "carboidrato_g_100g": "<valor_numerico>",
      "lipidios_g_100g": "<valor_numerico>",
      "fibra_g_100g": "<valor_numerico>",
      "unidades": "<valor_numerico_ex: 1>",
      "un_medida_caseira": "<string_ex: 'espiga média'>",
      "peso_aproximado_g": "<valor_numerico_ex: 150>"
    }}
    """
    try:
        # Rate limiting
        rate_start = time.time()
        rate_limited_gemini_call()
        rate_time = time.time() - rate_start
        logger.info(f"⏳ [DADOS NUTRI] Rate limiting: {rate_time:.3f}s")
        # Chamada API
        api_start = time.time()
        config = genai.types.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.1,
            max_output_tokens=500,
        )
        response = gemini_model.generate_content(prompt, generation_config=config)

        api_time = time.time() - api_start
        logger.info(f"🤖 [DADOS NUTRI] Gemini respondeu: {api_time:.3f}s")
        # Processar resposta
        json_start = time.time()
        dados_nutricionais = json.loads(response.text)
        json_time = time.time() - json_start
        total_time = time.time() - start_time
        # 🔥 RELATÓRIO DE PERFORMANCE
        logger.info(f"📊 [DADOS NUTRI] '{alimento_nome}':")
        logger.info(f"   ⏳ Rate limit: {rate_time:.3f}s")
        logger.info(f"   ⏳ API: {api_time:.3f}s")
        logger.info(f"   ⏳ JSON: {json_time:.3f}s")
        logger.info(f"   🎯 TOTAL: {total_time:.3f}s")
        logger.info("✅ [DADOS NUTRI] === CONCLUÍDO ===")
        return dados_nutricionais
    except Exception as e:
        total_time = time.time() - start_time
        logger.error(f"💥 [DADOS NUTRI] ERRO em {total_time:.3f}s: {str(e)}")
        return {"erro": f"Falha ao obter dados nutricionais: {str(e)}"}

# =================================================================
# ✅ FUNÇÃO 3: Gerar Recomendações Detalhadas (COM LOGS GARANTIDOS)
# =================================================================
def gerar_recomendacoes_detalhadas_ia(lista_alimentos: List[Dict[str, Any]], totais: Dict[str, float]) -> Dict[str, Any]:
    if not gemini_model:
        logger.error("🚫 Gemini não configurado")
        return {"erro": "API do Gemini não configurada."}
    start_time = time.time()
    logger.info("⏱️ [RECOMENDAÇÕES] === INICIANDO ===")
    num_alimentos = len(lista_alimentos)
    if num_alimentos == 0:
        logger.warning("⚠️ [RECOMENDAÇÕES] Lista de alimentos vazia.")
        return {"erro": "A lista de alimentos para análise está vazia."}
    # Preparar dados
    prep_start = time.time()
    alimentos_str = "\n".join([f"- {item['nome']}: {item['quantidade_gramas']}g" for item in lista_alimentos])
    totais_str = f"""
    - Calorias Totais: {totais.get('kcal', 0):.0f} kcal
    - Proteínas Totais: {totais.get('protein', 0):.1f} g
    - Carboidratos Totais: {totais.get('carbs', 0):.1f} g
    - Gorduras Totais: {totais.get('fats', 0):.1f} g
    """
    prep_time = time.time() - prep_start
    logger.info(f"📋 [RECOMENDAÇÕES] Dados preparados: {prep_time:.3f}s")
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
        # Rate limiting
        rate_start = time.time()
        rate_limited_gemini_call()
        rate_time = time.time() - rate_start
        # Chamada API
        api_start = time.time()
        response = gemini_model.generate_content( # Usar o gemini_model já configurado globalmente
            prompt_lista,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=800,
            )
        )
        api_time = time.time() - api_start
        logger.info(f"🤖 [RECOMENDAÇÕES] Gemini respondeu: {api_time:.3f}s")
        # Processar resposta
        json_start = time.time()
        resultado = extrair_json_da_resposta(response.text)
        json_time = time.time() - json_start
        total_time = time.time() - start_time
        # 🔥 RELATÓRIO DE PERFORMANCE
        logger.info("📊 [RECOMENDAÇÕES] == RELATÓRIO ==")
        logger.info(f"   ⏳ Preparação: {prep_time:.3f}s")
        logger.info(f"   ⏳ Rate limit: {rate_time:.3f}s")
        logger.info(f"   ⏳ API: {api_time:.3f}s")
        logger.info(f"   ⏳ JSON: {json_time:.3f}s")
        logger.info(f"   🎯 TOTAL: {total_time:.3f}s")
        logger.info(f"   🍽️ Alimentos: {num_alimentos}")
        logger.info(f"   🔥 Calorias: {totais.get('kcal', 0):.0f}")
        logger.info("✅ [RECOMENDAÇÕES] == CONCLUÍDO ==")
        return resultado
    except Exception as e:
        total_time = time.time() - start_time
        logger.error(f"💥 [RECOMENDAÇÕES] ERRO em {total_time:.3f}s: {str(e)}")
        return {"erro": "Desculpe, não foi possível gerar as recomendações no momento."}

# =================================================================
# ✅ FUNÇÃO 4: Análise detalhada (COM LOGS GARANTIDOS)
# =================================================================
def analisar_imagem_do_prato_detalhado(conteudo_imagem: bytes) -> dict:
    if not gemini_model:
        logger.error("🚫 Gemini não configurado")
        return {"erro": "API do Gemini não configurada."}
    start_time = time.time()
    logger.info("⏱️ [ANÁLISE DETALHADA] === INICIANDO ===")
    # Removido: model = genai.GenerativeModel('models/gemini-2.5-flash')
    # Usaremos o gemini_model já configurado globalmente
    prompt_detalhado = """Você é um nutricionista especialista. Analise esta foto de comida e forneça um relatório estruturado em JSON com as seguintes seções:
{
  "detalhes_prato": { "alimentos": [ { "nome": "string", "quantidade_gramas": "number", "metodo_preparo": "string", "categoria": "string (ex: Fruta, Grão, Carne Vermelha)" } ] },
  "analise_nutricional": { "calorias_totais": "number", "macronutrientes": { "proteinas_g": "number", "carboidratos_g": "number", "gorduras_g": "number" }, "vitaminas_minerais": ["string"] },
  "recomendacoes": { "pontos_positivos": ["string"], "sugestoes_balanceamento": ["string"], "alternativas_saudaveis": ["string"] }
} Forneça APENAS o JSON, sem texto adicional."""
    try:
        # Carregar imagem
        load_start = time.time()
        img = Image.open(BytesIO(conteudo_imagem))
        load_time = time.time() - load_start
        logger.info(f"📸 [ANÁLISE DETALHADA] Imagem carregada: {load_time:.3f}s")
        # Chamada API
        api_start = time.time()
        response = gemini_model.generate_content( # Usar o gemini_model já configurado globalmente
            [prompt_detalhado, img],
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=1500,
            )
        )
        api_time = time.time() - api_start
        logger.info(f"🤖 [ANÁLISE DETALHADA] Gemini respondeu: {api_time:.3f}s")
        # Processar resposta
        json_start = time.time()
        resultado = extrair_json_da_resposta(response.text)
        json_time = time.time() - json_start
        total_time = time.time() - start_time
        # 🔥 RELATÓRIO DE PERFORMANCE
        alimentos_count = len(resultado.get('detalhes_prato', {}).get('alimentos', []))
        logger.info("📊 [ANÁLISE DETALHADA] == RELATÓRIO ==")
        logger.info(f"   ⏳ Carregamento: {load_time:.3f}s")
        logger.info(f"   ⏳ API Gemini: {api_time:.3f}s")
        logger.info(f"   ⏳ Processamento: {json_time:.3f}s")
        logger.info(f"   🎯 TOTAL: {total_time:.3f}s")
        logger.info(f"   🍽️ Alimentos: {alimentos_count}")
        logger.info("✅ [ANÁLISE DETALHADA] == CONCLUÍDO ==")
        return resultado
    except Exception as e:
        total_time = time.time() - start_time
        logger.error(f"💥 [ANÁLISE DETALHADA] ERRO em {total_time:.3f}s: {str(e)}")
        return {"erro": "Falha na análise detalhada da imagem."}

# =================================================================
# FUNÇÕES ASSÍNCRONAS (mantidas da versão anterior)
# =================================================================

async def fetch_gemini_nutritional_data_parallel(alimento_nome: str) -> Dict[str, Any]:
    start_time = time.time()
    loop = asyncio.get_event_loop()
    try:
        # A função fetch_gemini_nutritional_data já usa o gemini_model global 
        resultado = await loop.run_in_executor(executor, fetch_gemini_nutritional_data, alimento_nome)
        total_time = time.time() - start_time
        logger.info(f"✅ [PARALELO] '{alimento_nome}' em {total_time:.3f}s")
        return resultado
    except Exception as e:
        total_time = time.time() - start_time
        logger.error(f"❌ [PARALELO] '{alimento_nome}' ERRO em {total_time:.3f}s: {e}")
        return {"erro": f"Falha na consulta paralela: {str(e)}"}

async def processar_alimentos_em_parallel(nomes_alimentos: List[str]) -> List[Dict[str, Any]]:
    if not nomes_alimentos:
        return []
    
    start_time = time.time()
    logger.info(f"🔄 [PARALELO] Iniciando {len(nomes_alimentos)} alimentos")
    
    max_concurrent = min(3, len(nomes_alimentos))
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def bounded_fetch(nome):
        async with semaphore:
            return await fetch_gemini_nutritional_data_parallel(nome)
    
    parallel_start = time.time()
    tasks = [bounded_fetch(nome) for nome in nomes_alimentos]
    resultados = await asyncio.gather(*tasks, return_exceptions=True)
    parallel_time = time.time() - parallel_start
    
    total_time = time.time() - start_time
    
    resultados_validos = [r for r in resultados if isinstance(r, dict) and "erro" not in r]
    
    logger.info(f"📊 [PARALELO] RELATÓRIO:")
    logger.info(f"   ⏳ Tempo paralelo: {parallel_time:.3f}s")
    logger.info(f"   🎯 Tempo total: {total_time:.3f}s")
    logger.info(f"   ✅ Sucessos: {len(resultados_validos)}/{len(nomes_alimentos)}")
    logger.info(f"   🚀 Speedup: ~{(len(nomes_alimentos)/max_concurrent):.1f}x")
    
    return resultados_validos

# Funções restantes mantidas da versão anterior...
def analisar_imagem_do_prato(conteudo_imagem: bytes) -> dict:
    if not gemini_model:
        return {"erro": "API do Gemini não configurada."}
    start_time = time.time()
    logger.info("⏱️ [ANÁLISE SIMPLES] Iniciando...")
    # Removido: model = genai.GenerativeModel('models/gemini-2.5-flash')
    # Usaremos o gemini_model já configurado globalmente
    prompt = """Analise a imagem. Identifique cada alimento, estime a quantidade em gramas (g) e justifique. Retorne JSON: { "foods": [ { "name", "quantity_g", "justification" } ] }"""
    try:
        load_start = time.time()
        img = Image.open(BytesIO(conteudo_imagem))
        load_time = time.time() - load_start
        api_start = time.time()
        response = gemini_model.generate_content( # Usar o gemini_model já configurado globalmente
            [prompt, img],
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=800,
            )
        )
        api_time = time.time() - api_start
        json_start = time.time()
        resultado = extrair_json_da_resposta(response.text)
        json_time = time.time() - json_start
        total_time = time.time() - start_time
        alimentos_count = len(resultado.get('foods', []))
        logger.info("📊 [ANÁLISE SIMPLES] RELATÓRIO:")
        logger.info(f"   ⏳ Carregamento: {load_time:.3f}s")
        logger.info(f"   ⏳ API: {api_time:.3f}s")
        logger.info(f"   ⏳ JSON: {json_time:.3f}s")
        logger.info(f"   🎯 TOTAL: {total_time:.3f}s")
        logger.info(f"   🍽️ Alimentos: {alimentos_count}")
        return resultado
    except Exception as e:
        total_time = time.time() - start_time
        logger.error(f"💥 [ANÁLISE SIMPLES] ERRO em {total_time:.3f}s: {str(e)}")
        return {"erro": "Falha ao analisar imagem (simples)."}

async def processar_multiplas_imagens_parallel(conteudos_imagens: List[bytes]) -> List[Dict[str, Any]]:
    if not gemini_model:
        return [{"erro": "API do Gemini não configurada."} for _ in conteudos_imagens]
    
    start_time = time.time()
    logger.info(f"🔄 [BATCH IMAGENS] Iniciando {len(conteudos_imagens)} imagens")
    
    async def processar_imagem(conteudo):
        loop = asyncio.get_event_loop()
        try:
            return await loop.run_in_executor(executor, escanear_prato_extrair_alimentos, conteudo)
        except Exception as e:
            logger.error(f"💥 Erro no processamento de imagem: {e}")
            return {"erro": f"Falha no processamento: {str(e)}"}
    
    semaphore = asyncio.Semaphore(2)
    
    async def bounded_process(conteudo):
        async with semaphore:
            return await processar_imagem(conteudo)
    
    batch_start = time.time()
    tasks = [bounded_process(conteudo) for conteudo in conteudos_imagens]
    resultados = await asyncio.gather(*tasks, return_exceptions=True)
    batch_time = time.time() - batch_start
    
    total_time = time.time() - start_time
    
    sucessos = sum(1 for r in resultados if isinstance(r, dict) and "erro" not in r)
    logger.info(f"📊 [BATCH IMAGENS] RELATÓRIO:")
    logger.info(f"   ⏳ Tempo batch: {batch_time:.3f}s")
    logger.info(f"   🎯 Tempo total: {total_time:.3f}s")
    logger.info(f"   ✅ Sucessos: {sucessos}/{len(conteudos_imagens)}")
    logger.info(f"   📈 Throughput: {len(conteudos_imagens)/total_time:.2f} img/s")
    
    return resultados

def cleanup():
    executor.shutdown(wait=False)
    logger.info("🧹 Recursos do vision.py liberados")