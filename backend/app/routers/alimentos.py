# app/routers/alimentos.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

# Importa o modelo de Alimento e o schema de resposta
from app.database import get_db
from app.models.alimentos import Alimento
from app.schemas.vision_alimentos_ import AlimentoPublic # Reutilizamos o schema existente

router = APIRouter(
    prefix="/api/v1/alimentos",
    tags=["Alimentos"]
)

@router.get(
    "/buscar",
    response_model=List[AlimentoPublic],
    summary="Busca alimentos na base de dados (TACO + IA) com filtros e paginação."
)
def buscar_alimentos(
    q: str = Query(..., min_length=2, description="Termo de busca pelo nome do alimento (mínimo 2 caracteres)"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoria do alimento (ex: 'Fruta', 'Proteína')"),
    limit: int = Query(10, ge=1, le=50, description="Número máximo de resultados a serem retornados (entre 1 e 50)"),
    db: Session = Depends(get_db),
):
    """
    Este endpoint permite buscar alimentos na sua base de dados.
    Ele procura tanto nos alimentos da TACO quanto nos alimentos que foram
    adicionados pela IA (Gemini) através do processo de auto-aprendizagem.

    **Parâmetros de Query:**
    - `q`: O termo de busca para o nome do alimento. É obrigatório e deve ter no mínimo 2 caracteres.
    - `categoria`: (Opcional) Filtra os resultados por uma categoria específica.
    - `limit`: (Opcional) Define o número máximo de resultados. O padrão é 10, com um máximo de 50.
    """
    termo_busca_normalizado = q.strip().lower()

    # Inicia a query
    query = db.query(Alimento)

    # Aplica o filtro de busca pelo nome (case-insensitive)
    # Usamos ilike para busca parcial e func.lower para case-insensitivity
    query = query.filter(func.lower(Alimento.alimento).ilike(f"%{termo_busca_normalizado}%"))

    # Aplica o filtro por categoria, se fornecido
    if categoria:
        categoria_normalizada = categoria.strip().lower()
        query = query.filter(func.lower(Alimento.categoria).ilike(f"%{categoria_normalizada}%"))

    # Ordena os resultados por nome do alimento em ordem alfabética
    query = query.order_by(Alimento.alimento.asc())

    # Aplica o limite de resultados
    resultados = query.limit(limit).all()

    if not resultados:
        return []

    return resultados
