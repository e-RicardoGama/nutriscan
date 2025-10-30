# app/vision.py - VERSÃO FINAL E LIMPA
# Este ficheiro APENAS fala com a API do Gemini.
# Ele NÃO importa 'sqlalchemy', 'Session', 'crud' ou 'models'.

import os
import json
import re
import logging
from typing import Dict, Any, List
import google.generativeai as genai
from PIL import Image
from io import BytesIO

# Configuração do logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuração da API Key
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("A variável de ambiente GEMINI_API_KEY não está definida.")
    genai.configure(api_key=api_key)
    # Use o nome do seu modelo (ex: 'models/gemini-1.5-flash' ou 'models/gemini-2.5-flash')
    gemini_model = genai.GenerativeModel('models/gemini-1.5-flash') 
except Exception as e:
    logger.error(f"Erro ao configurar a API do Gemini: {e}")
    gemini_model = None

# Função auxiliar para extrair JSON
def extrair_json_da_resposta(texto_resposta: str) -> Dict[str, Any]:
    """ Extrai um objeto JSON de uma resposta de texto, limpando ```json e outros. """
    if not texto_resposta:
        logger.error("Resposta vazia recebida do modelo de IA.")
        return {"erro": "Resposta vazia do modelo de IA"}
    try:
        cleaned = re.sub(r'^```json\s*|\s*```$', '', texto_resposta.strip(), flags=re.IGNORECASE | re.DOTALL)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Falha ao parsear JSON diretamente. Tentando extrair de texto.")
        json_match = re.search(r'\{.*\}', texto_resposta, re.DOTALL)
        if json_match:
            try:
                json_str = json_match.group()
                cleaned_match = re.sub(r'^```json\s*|\s*```$', '', json_str.strip(), flags=re.IGNORECASE | re.DOTALL)
                return json.loads(cleaned_match)
            except json.JSONDecodeError as e_inner:
                logger.error(f"Falha ao parsear JSON extraído: {e_inner}\nTexto original:\n{texto_resposta}")
                return {"erro": "Resposta não contém JSON válido."}
        logger.error(f"Nenhum JSON encontrado na resposta.\nTexto original:\n{texto_resposta}")
        return {"erro": "Nenhum JSON válido encontrado na resposta."}


# Função 1: Scan Rápido (A sua função original, mantida)
def escanear_prato_extrair_alimentos(conteudo_imagem: bytes) -> Dict[str, Any]:
    if not gemini_model: return {"erro": "API do Gemini não configurada."}
    try:
        if not conteudo_imagem: return {"erro": "Imagem vazia"}
        prompt_scan = """SCAN RÁPIDO. Retorne APENAS JSON: {"alimentos_extraidos": [{"nome", "categoria" (nutricional), "quantidade_estimada_g", "confianca" ('alta'|'media'|'baixa'), "calorias_estimadas"}], "resumo_nutricional": {"total_calorias", "total_proteinas_g", "total_carboidratos_g", "total_gorduras_g"}, "alertas": []}"""
        logger.info("Processando SCAN rápido...")
        img = Image.open(BytesIO(conteudo_imagem))
        response = gemini_model.generate_content([prompt_scan, img], generation_config=genai.types.GenerationConfig(temperature=0.1))
        if not response.text: return {"erro": "Resposta vazia da API"}
        logger.info(f"Resposta bruta Gemini (scan rápido): {response.text}")
        resultado = extrair_json_da_resposta(response.text)
        logger.info(f"Resultado processado (scan rápido): {resultado}")
        return resultado
    except Exception as e:
        logger.error(f"Erro no scan rápido: {e}")
        return {"erro": f"Falha no scan rápido: {str(e)}"}


# =================================================================
# ✅ FUNÇÃO 2: Obter dados nutricionais de 1 alimento (para auto-aprendizagem)
# =================================================================
def fetch_gemini_nutritional_data(alimento_nome: str) -> Dict[str, Any]:
    """
    Chama o Gemini para obter dados nutricionais de um NOVO alimento.
    """
    if not gemini_model: return {"erro": "API do Gemini não configurada."}

    logger.info(f"-> Consultando Gemini para novos dados de: '{alimento_nome}'")

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
        config = genai.GenerationConfig(response_mime_type="application/json")
        response = gemini_model.generate_content(prompt, generation_config=config)
        dados_nutricionais = json.loads(response.text)
        logger.info(f"INFO: Gemini respondeu com dados para '{alimento_nome}'.")
        return dados_nutricionais
        
    except Exception as e:
        logger.error(f"ERRO: Falha ao consultar o Gemini para dados nutricionais: {e}")
        return {"erro": f"Falha ao obter dados para {alimento_nome}."}

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