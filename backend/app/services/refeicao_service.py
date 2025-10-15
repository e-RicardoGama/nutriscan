# app/services/refeicao_service.py

import base64
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any
from thefuzz import process

from ..models.alimentos import Alimento
from ..vision import analisar_imagem_do_prato

def _buscar_melhor_correspondencia(db: Session, nome_alimento_ia: str) -> Alimento | None:
    """
    Busca no banco a melhor correspondência usando uma lógica aprimorada com as colunas existentes.
    """
    # ETAPA 1: Busca na coluna normalizada (alta precisão)
    termo_normalizado = nome_alimento_ia.replace(" ", "-")
    match_normalizado = db.query(Alimento).filter(Alimento.alimento_normalizado.contains(termo_normalizado)).first()
    if match_normalizado:
        print(f"-> Match encontrado para '{nome_alimento_ia}': '{match_normalizado.alimento}' (Busca Normalizada)")
        return match_normalizado

    # ETAPA 2: Busca por similaridade (fuzzy matching) na coluna de nome original
    palavras = [p for p in nome_alimento_ia.split() if len(p) >= 3]
    if not palavras:
        return None

    query_filters_or = [Alimento.alimento.ilike(f"%{p}%") for p in palavras]
    candidatos_db = db.query(Alimento).filter(or_(*query_filters_or)).limit(50).all()

    if not candidatos_db:
        return None

    nomes_candidatos = {c.alimento: c for c in candidatos_db}
    melhor_match = process.extractOne(nome_alimento_ia, nomes_candidatos.keys())
    
    # Mantemos um limiar alto para garantir a qualidade da correspondência
    if melhor_match and melhor_match[1] >= 80:
        print(f"-> Match encontrado para '{nome_alimento_ia}': '{melhor_match[0]}' (Pontuação Fuzzy: {melhor_match[1]})")
        return nomes_candidatos[melhor_match[0]]
        
    print(f"-> Nenhum match bom o suficiente para '{nome_alimento_ia}'. Melhor tentativa: '{melhor_match[0]}' ({melhor_match[1]})")
    return None


def analisar_e_buscar_alimentos_por_imagem(db: Session, conteudo_imagem: bytes) -> Dict[str, List[Any]]:
    """
    Orquestra o processo completo:
    1. Analisa a imagem com Gemini para obter nomes e quantidades.
    2. Busca os alimentos no banco de dados.
    3. Calcula os nutrientes com base na quantidade estimada.
    4. Separa os alimentos encontrados dos não encontrados.
    """
    # --- CORREÇÃO AQUI ---
    # Removemos a conversão para Base64. A nova biblioteca do Google prefere os bytes originais.
    # linha removida: imagem_em_base64 = base64.b64encode(conteudo_imagem).decode("utf-8")

    # Agora passamos o 'conteudo_imagem' (em bytes) diretamente para a função de análise
    resposta_ia = analisar_imagem_do_prato(conteudo_imagem)
    # --------------------

    alimentos_da_ia = resposta_ia.get("foods", [])

    if not alimentos_da_ia:
        return {"reconhecidos": [], "nao_reconhecidos": []}

    alimentos_reconhecidos = []
    alimentos_nao_reconhecidos = []

    for alimento_ia in alimentos_da_ia:
        nome_alimento = alimento_ia.get("name")
        quantidade_str = alimento_ia.get("quantity_g")

        if not nome_alimento or not quantidade_str:
            continue

        try:
            quantidade_estimada_g = int(quantidade_str)
        except (ValueError, TypeError):
            continue

        alimento_db = _buscar_melhor_correspondencia(db, nome_alimento)

        if alimento_db:
            fator = quantidade_estimada_g / 100.0
            info_nutricional_ajustada = {
                "alimento": alimento_db.alimento,
                "quantidade_estimada_g": quantidade_estimada_g,
                "justificativa_ia": alimento_ia.get("justification", ""),
                "energia_kcal": round((alimento_db.energia_kcal_100g or 0) * fator, 2),
                "proteina_g": round((alimento_db.proteina_g_100g or 0) * fator, 2),
                "carboidrato_g": round((alimento_db.carboidrato_g_100g or 0) * fator, 2),
                "fonte_dados": "Banco de Dados Local (TACO)"
            }
            alimentos_reconhecidos.append(info_nutricional_ajustada)
        else:
            alimento_para_consulta = {
                "nome_sugerido_ia": nome_alimento,
                "quantidade_estimada_g": quantidade_estimada_g
            }
            alimentos_nao_reconhecidos.append(alimento_para_consulta)

    return {"reconhecidos": alimentos_reconhecidos, "nao_reconhecidos": alimentos_nao_reconhecidos}