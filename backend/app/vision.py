# app/vision.py - VERSÃO COMPLETA E CORRIGIDA

import os
import json
import re
import logging
from typing import Dict, Any
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
except Exception as e:
    logger.error(f"Erro ao configurar a API do Gemini: {e}")

def extrair_json_da_resposta(texto_resposta: str) -> Dict[str, Any]:
    """
    Extrai e valida JSON da resposta do Gemini, lidando com markdown e texto extra.
    """
    if not texto_resposta:
        logger.error("Resposta vazia recebida do modelo de IA.")
        return {"erro": "Resposta vazia do modelo de IA"}

    try:
        cleaned = re.sub(r'^```json\s*|\s*```$', '', texto_resposta.strip(), flags=re.IGNORECASE | re.DOTALL)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Falha ao parsear JSON diretamente. Tentando extrair de um texto maior.")
        json_match = re.search(r'\{.*\}', texto_resposta, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError as e_inner:
                logger.error(f"Falha ao parsear o JSON extraído: {e_inner}")
                return {"erro": f"Resposta não está em formato JSON válido."}
        
        logger.error("Nenhum objeto JSON válido foi encontrado na resposta.")
        return {"erro": "Nenhum objeto JSON válido foi encontrado na resposta."}

def analisar_imagem_do_prato_detalhado(conteudo_imagem: bytes) -> dict:
    """
    Retorna análise detalhada em formato JSON estruturado
    """
    model = genai.GenerativeModel('models/gemini-2.5-flash')

    prompt_detalhado = """Você é um nutricionista especialista. Analise esta foto de comida e forneça um relatório estruturado em JSON com as seguintes seções:

{
  "detalhes_prato": {
    "alimentos": [
      {
        "nome": "string",
        "quantidade_gramas": "number",
        "metodo_preparo": "string"
      }
    ]
  },
  "analise_nutricional": {
    "calorias_totais": "number",
    "macronutrientes": {
      "proteinas_g": "number",
      "carboidratos_g": "number",
      "gorduras_g": "number"
    },
    "vitaminas_minerais": ["string"]
  },
  "recomendacoes": {
    "pontos_positivos": ["string"],
    "sugestoes_balanceamento": ["string"],
    "alternativas_saudaveis": ["string"]
  }
}

Forneça APENAS o JSON, sem texto adicional."""

    try:
        logger.info("-> Enviando imagem para análise detalhada com o Gemini 2.5 Flash...")
        img = Image.open(BytesIO(conteudo_imagem))
        
        response = model.generate_content([prompt_detalhado, img])
        
        # 🔍 DEBUG: Log da resposta bruta
        logger.info(f"Resposta bruta do Gemini: {response.text}")
        
        # Usa a nova função auxiliar para extrair JSON
        resultado = extrair_json_da_resposta(response.text)
        
        # 🔍 DEBUG: Log do resultado processado
        logger.info(f"Resultado processado: {resultado}")
        
        return resultado
        
    except Exception as e:
        logger.error(f"ERRO: Falha na comunicação com a API do Gemini: {e}")
        return {"erro": "Desculpe, não foi possível analisar a imagem no momento."}

# ======================================================================
# ✅ FUNÇÃO ADICIONADA DE VOLTA PARA CORRIGIR O IMPORT ERROR
# ======================================================================
def analisar_imagem_do_prato(conteudo_imagem: bytes) -> dict:
    """
    Usa o Gemini para analisar a imagem de um prato e retornar os alimentos em JSON.
    Esta é uma versão mais simples para uso em serviços legados.
    """
    model = genai.GenerativeModel('models/gemini-2.5-flash')
    prompt = """
    Analise a imagem deste prato. Identifique cada alimento visível.
    Estime a quantidade em gramas (g). Forneça uma breve justificativa.
    A resposta DEVE ser um objeto JSON com uma chave "foods", contendo uma lista de objetos com "name", "quantity_g" e "justification".
    Exemplo: { "foods": [ { "name": "Arroz branco", "quantity_g": 150, "justification": "4 colheres de sopa" } ] }
    """
    try:
        logger.info("-> Enviando imagem para o Gemini (análise simples)...")
        img = Image.open(BytesIO(conteudo_imagem))
        response = model.generate_content([prompt, img])
        return extrair_json_da_resposta(response.text)
    except Exception as e:
        logger.error(f"ERRO: Falha na comunicação com a API do Gemini (análise simples): {e}")
        return {"erro": "Falha ao analisar imagem."}
# ======================================================================

def escanear_prato_extrair_alimentos(conteudo_imagem: bytes) -> Dict[str, Any]:
    """
    Modalidade SCAN: Extração rápida e estruturada de alimentos.
    """
    try:
        if not conteudo_imagem:
            return {"erro": "Imagem vazia ou inválida"}
        
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        prompt_scan = """SCAN RÁPIDO. Retorne APENAS JSON com a estrutura: {"alimentos_extraidos": [{"nome", "categoria", "quantidade_estimada_g", "confianca", "calorias_estimadas"}], "resumo_nutricional": {"total_calorias", "total_proteinas_g", "total_carboidratos_g", "total_gorduras_g"}, "alertas": []}"""
        logger.info("Processando SCAN para extração rápida...")
        img = Image.open(BytesIO(conteudo_imagem))
        
        response = model.generate_content([prompt_scan, img], generation_config=genai.types.GenerationConfig(temperature=0.1))
        
        if not response.text:
            return {"erro": "Resposta vazia da API"}
            
        return extrair_json_da_resposta(response.text)
    except Exception as e:
        logger.error(f"Erro no scan: {e}")
        return {"erro": f"Falha no scan: {str(e)}"}
    
