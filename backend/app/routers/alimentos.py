# app/routers/alimentos.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import requests
import os
import json

# Importa o modelo de Alimento e o schema de resposta
from app.database import get_db
from app.models.alimentos import Alimento
from app.schemas.vision_alimentos_ import AlimentoPublic

router = APIRouter(
    prefix="/api/v1/alimentos",
    tags=["Alimentos"]
)

async def consultar_ia_para_alimento(nome_alimento: str) -> Optional[dict]:
    """
    Consulta a IA (Gemini) para obter informações nutricionais de um alimento
    que não está no banco de dados.
    """
    try:
        # Configuração da API do Gemini
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if not GEMINI_API_KEY:
            return None
            
        GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"
        
        prompt = f"""
        Forneça informações nutricionais aproximadas para o alimento: {nome_alimento}
        Responda APENAS com um JSON no seguinte formato, sem nenhum texto adicional:
        {{
            "alimento": "{nome_alimento}",
            "categoria": "categoria_apropriada",
            "energia_kcal_100g": valor_numérico,
            "proteina_g_100g": valor_numérico,
            "carboidrato_g_100g": valor_numérico,
            "lipidios_g_100g": valor_numérico,
            "fibra_g_100g": valor_numérico,
            "medida_caseira_unidade": "unidade_apropriada",
            "medida_caseira_gramas_por_unidade": valor_numérico
        }}
        
        Se não souber informações precisas, forneça valores aproximados baseados em alimentos similares.
        """
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        response = requests.post(GEMINI_API_URL, json=payload, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        text_response = data['candidates'][0]['content']['parts'][0]['text']
        
        # Extrai o JSON da resposta
        start_idx = text_response.find('{')
        end_idx = text_response.rfind('}') + 1
        if start_idx != -1 and end_idx != -1:
            json_str = text_response[start_idx:end_idx]
            alimento_ia = json.loads(json_str)
            return alimento_ia
            
    except Exception as e:
        print(f"Erro ao consultar IA para alimento {nome_alimento}: {e}")
    
    return None

@router.get(
    "/buscar-completo",
    response_model=List[AlimentoPublic],
    summary="Busca alimentos no banco e consulta IA se não encontrar"
)
async def buscar_alimentos_completo(
    q: str = Query(..., min_length=2, description="Termo de busca pelo nome do alimento"),
    incluir_ia: bool = Query(True, description="Incluir resultados da IA se não encontrar no banco"),
    limit: int = Query(10, ge=1, le=50, description="Número máximo de resultados"),
    db: Session = Depends(get_db),
):
    """
    Busca alimentos no banco de dados e, se não encontrar e 'incluir_ia' for True,
    consulta a IA para obter informações nutricionais.
    """
    termo_busca_normalizado = q.strip().lower()
    resultados = []

    # 1. Busca no banco de dados
    query = db.query(Alimento).filter(
        func.lower(Alimento.alimento).ilike(f"%{termo_busca_normalizado}%")
    ).order_by(Alimento.alimento.asc())
    
    resultados_banco = query.limit(limit).all()
    resultados.extend(resultados_banco)

    # 2. Se não encontrou no banco e deve incluir IA, consulta a IA
    if not resultados_banco and incluir_ia:
        alimento_ia = await consultar_ia_para_alimento(termo_busca_normalizado)
        if alimento_ia:
            # Converte o resultado da IA para o formato AlimentoPublic
            alimento_public = AlimentoPublic(
                id=0,  # ID 0 indica que veio da IA
                alimento=alimento_ia["alimento"],
                alimento_normalizado=alimento_ia["alimento"].lower(),
                categoria=alimento_ia["categoria"],
                energia_kcal_100g=alimento_ia["energia_kcal_100g"],
                proteina_g_100g=alimento_ia["proteina_g_100g"],
                carboidrato_g_100g=alimento_ia["carboidrato_g_100g"],
                lipidios_g_100g=alimento_ia["lipidios_g_100g"],
                fibra_g_100g=alimento_ia.get("fibra_g_100g", 0),
                medida_caseira_unidade=alimento_ia["medida_caseira_unidade"],
                medida_caseira_gramas_por_unidade=alimento_ia["medida_caseira_gramas_por_unidade"]
            )
            resultados.append(alimento_public)

    return resultados

# Mantém o endpoint original para compatibilidade
@router.get(
    "/buscar",
    response_model=List[AlimentoPublic],
    summary="Busca alimentos apenas no banco de dados"
)
def buscar_alimentos(
    q: str = Query(..., min_length=2, description="Termo de busca pelo nome do alimento"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoria"),
    limit: int = Query(10, ge=1, le=50, description="Número máximo de resultados"),
    db: Session = Depends(get_db),
):
    """Busca alimentos apenas no banco de dados (compatibilidade)"""
    termo_busca_normalizado = q.strip().lower()
    
    query = db.query(Alimento).filter(
        func.lower(Alimento.alimento).ilike(f"%{termo_busca_normalizado}%")
    )
    
    if categoria:
        categoria_normalizada = categoria.strip().lower()
        query = query.filter(func.lower(Alimento.categoria).ilike(f"%{categoria_normalizada}%"))
    
    resultados = query.order_by(Alimento.alimento.asc()).limit(limit).all()
    
    return resultados