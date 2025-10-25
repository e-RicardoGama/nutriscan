# app/vision.py - VERSÃO COM FUNÇÃO PARA ANALISAR LISTA

import os
import json
import re
import logging
from typing import Dict, Any, List # Adicionado List
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
    # Considerar levantar o erro ou ter um fallback
    # raise e

# Função auxiliar para extrair JSON (sem alterações)
def extrair_json_da_resposta(texto_resposta: str) -> Dict[str, Any]:
    # ... (código da função extrair_json_da_resposta) ...
    if not texto_resposta:
        logger.error("Resposta vazia recebida do modelo de IA.")
        return {"erro": "Resposta vazia do modelo de IA"}
    try:
        # Tenta remover ```json ``` e espaços extras
        cleaned = re.sub(r'^```json\s*|\s*```$', '', texto_resposta.strip(), flags=re.IGNORECASE | re.DOTALL)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Falha ao parsear JSON diretamente. Tentando extrair de texto.")
        # Tenta extrair o primeiro JSON válido encontrado no texto
        json_match = re.search(r'\{[^{}]*\}', texto_resposta, re.DOTALL) # Simplificado para JSON simples, ajuste se precisar de aninhamento complexo
        if json_match:
            try:
                # Tenta novamente limpar possíveis ```json ``` ao redor do JSON encontrado
                json_str = json_match.group()
                cleaned_match = re.sub(r'^```json\s*|\s*```$', '', json_str.strip(), flags=re.IGNORECASE | re.DOTALL)
                return json.loads(cleaned_match)
            except json.JSONDecodeError as e_inner:
                logger.error(f"Falha ao parsear JSON extraído: {e_inner}\nTexto original:\n{texto_resposta}")
                return {"erro": "Resposta não contém JSON válido."}
        logger.error(f"Nenhum JSON encontrado na resposta.\nTexto original:\n{texto_resposta}")
        return {"erro": "Nenhum JSON válido encontrado na resposta."}


# Função para análise detalhada DE IMAGEM (sem alterações)
def analisar_imagem_do_prato_detalhado(conteudo_imagem: bytes) -> dict:
    # ... (código da função analisar_imagem_do_prato_detalhado) ...
    model = genai.GenerativeModel('models/gemini-2.5-flash') # Ou gemini-1.5-flash
    prompt_detalhado = """Você é um nutricionista especialista. Analise esta foto de comida e forneça um relatório estruturado em JSON com as seguintes seções:
{
  "detalhes_prato": { "alimentos": [ { "nome": "string", "quantidade_gramas": "number", "metodo_preparo": "string", "categoria": "string (ex: Fruta, Grão, Carne Vermelha)" } ] },
  "analise_nutricional": { "calorias_totais": "number", "macronutrientes": { "proteinas_g": "number", "carboidratos_g": "number", "gorduras_g": "number" }, "vitaminas_minerais": ["string"] },
  "recomendacoes": { "pontos_positivos": ["string"], "sugestoes_balanceamento": ["string"], "alternativas_saudaveis": ["string"] }
} Forneça APENAS o JSON, sem texto adicional."""
    try:
        logger.info("-> Enviando imagem para análise detalhada...")
        img = Image.open(BytesIO(conteudo_imagem))
        response = model.generate_content([prompt_detalhado, img])
        logger.info(f"Resposta bruta Gemini (detalhada img): {response.text}")
        resultado = extrair_json_da_resposta(response.text)
        logger.info(f"Resultado processado (detalhada img): {resultado}")
        return resultado
    except Exception as e:
        logger.error(f"ERRO Gemini (detalhada img): {e}")
        return {"erro": "Falha na análise detalhada da imagem."}


# Função para análise simples DE IMAGEM (sem alterações)
def analisar_imagem_do_prato(conteudo_imagem: bytes) -> dict:
    # ... (código da função analisar_imagem_do_prato) ...
    model = genai.GenerativeModel('models/gemini-2.5-flash')
    prompt = """Analise a imagem. Identifique cada alimento, estime a quantidade em gramas (g) e justifique. Retorne JSON: { "foods": [ { "name", "quantity_g", "justification" } ] }"""
    try:
        logger.info("-> Enviando imagem para análise simples...")
        img = Image.open(BytesIO(conteudo_imagem))
        response = model.generate_content([prompt, img])
        logger.info(f"Resposta bruta Gemini (simples img): {response.text}")
        resultado = extrair_json_da_resposta(response.text)
        logger.info(f"Resultado processado (simples img): {resultado}")
        return resultado
    except Exception as e:
        logger.error(f"ERRO Gemini (simples img): {e}")
        return {"erro": "Falha ao analisar imagem (simples)."}

# Função para SCAN RÁPIDO DE IMAGEM (sem alterações)
def escanear_prato_extrair_alimentos(conteudo_imagem: bytes) -> Dict[str, Any]:
    # ... (código da função escanear_prato_extrair_alimentos) ...
    try:
        if not conteudo_imagem: return {"erro": "Imagem vazia"}
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        prompt_scan = """SCAN RÁPIDO. Retorne APENAS JSON: {"alimentos_extraidos": [{"nome", "categoria" (nutricional), "quantidade_estimada_g", "confianca" ('alta'|'media'|'baixa'), "calorias_estimadas"}], "resumo_nutricional": {"total_calorias", "total_proteinas_g", "total_carboidratos_g", "total_gorduras_g"}, "alertas": []}"""
        logger.info("Processando SCAN rápido...")
        img = Image.open(BytesIO(conteudo_imagem))
        response = model.generate_content([prompt_scan, img], generation_config=genai.types.GenerationConfig(temperature=0.1))
        if not response.text: return {"erro": "Resposta vazia da API"}
        logger.info(f"Resposta bruta Gemini (scan rápido): {response.text}")
        resultado = extrair_json_da_resposta(response.text)
        logger.info(f"Resultado processado (scan rápido): {resultado}")
        return resultado
    except Exception as e:
        logger.error(f"Erro no scan rápido: {e}")
        return {"erro": f"Falha no scan rápido: {str(e)}"}


# ==========================================================
# ✅ NOVA FUNÇÃO: Analisar LISTA de Alimentos Detalhadamente
# ==========================================================
def analisar_lista_alimentos_detalhadamente(lista_alimentos: List[Dict[str, Any]]) -> dict:
    """
    Recebe uma lista de alimentos (nome, quantidade_gramas) e usa o Gemini
    para gerar a análise nutricional detalhada e recomendações.
    Retorna um dicionário no formato AnaliseCompletaResponseSchema.
    """
    if not lista_alimentos:
        logger.error("Tentativa de analisar lista de alimentos vazia.")
        return {"erro": "A lista de alimentos para análise está vazia."}

    # Prepara o prompt para o Gemini
    # Converte a lista de dicionários Python em uma string formatada
    alimentos_str = "\n".join([f"- {item['nome']}: {item['quantidade_gramas']}g" for item in lista_alimentos])

    prompt_lista = f"""Você é um nutricionista especialista. Analise esta lista de alimentos de uma refeição:
{alimentos_str}

Forneça um relatório nutricional completo e estruturado em JSON com as seguintes seções:
{{
  "detalhes_prato": {{ 
    "alimentos": [ 
      {{ 
        "nome": "string (nome original da lista)", 
        "quantidade_gramas": "number (quantidade original da lista)", 
        "metodo_preparo": "string (inferido ou 'Não especificado')",
        "categoria": "string (categoria nutricional, ex: Fruta, Grão, Carne Vermelha)" 
      }} 
      // Repetir para cada alimento da lista original
    ] 
  }},
  "analise_nutricional": {{ 
    "calorias_totais": "number (soma total)", 
    "macronutrientes": {{ 
      "proteinas_g": "number (soma total)", 
      "carboidratos_g": "number (soma total)", 
      "gorduras_g": "number (soma total)" 
    }}, 
    "vitaminas_minerais": ["string (principais presentes na refeição)"] 
  }},
  "recomendacoes": {{ 
    "pontos_positivos": ["string (aspectos bons da combinação)"], 
    "sugestoes_balanceamento": ["string (o que poderia melhorar)"], 
    "alternativas_saudaveis": ["string (sugestões de trocas)"] 
  }}
}}

Forneça APENAS o JSON como resposta, sem nenhum texto introdutório ou final."""

    model = genai.GenerativeModel('models/gemini-2.5-flash') # Ou gemini-1.5-flash

    try:
        logger.info(f"-> Enviando lista de alimentos para análise detalhada: {alimentos_str}")
        # Envia apenas o prompt de texto
        response = model.generate_content(prompt_lista) 
        
        logger.info(f"Resposta bruta Gemini (detalhada lista): {response.text}")
        
        # Usa a função auxiliar para extrair e validar o JSON
        resultado = extrair_json_da_resposta(response.text)
        
        logger.info(f"Resultado processado (detalhada lista): {resultado}")

        # Validação extra (opcional): Verificar se as chaves principais existem
        if "detalhes_prato" not in resultado or "analise_nutricional" not in resultado or "recomendacoes" not in resultado:
             logger.warning("JSON retornado não possui a estrutura esperada.")
             # Poderia retornar um erro aqui ou tentar usar o que veio
             # return {"erro": "Estrutura JSON inválida retornada pela IA."}

        return resultado
        
    except Exception as e:
        logger.error(f"ERRO: Falha na comunicação com a API do Gemini (análise de lista): {e}")
        return {"erro": "Desculpe, não foi possível realizar a análise detalhada no momento."}
# ==========================================================
# FIM DA NOVA FUNÇÃO
# ==========================================================
