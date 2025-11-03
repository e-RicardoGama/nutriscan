# app/crud.py - VERSÃO COMPLETA ATUALIZADA
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from typing import Optional, List, Dict, Any
import json
from datetime import datetime

# --- Imports Explícitos ---
from app.models.refeicoes import RefeicaoSalva, AlimentoSalvo, RefeicaoStatus
from app.models.usuario import Usuario
from app.models.alimentos import Alimento
from app.schemas.vision_alimentos_ import (
    RefeicaoSalvaCreate, 
    AnaliseCompletaResponse as AnaliseCompletaResponseSchema
)

# --- CRUD para Refeição Salva ---

def create_refeicao_salva(db: Session, refeicao_data: RefeicaoSalvaCreate, user_id: int) -> RefeicaoSalva:
    """Cria uma nova refeição salva com seus alimentos."""
    db_refeicao = RefeicaoSalva(owner_id=user_id, status=RefeicaoStatus.PENDING_ANALYSIS)
    db.add(db_refeicao)
    db.flush() 

    for alimento_data in refeicao_data.alimentos:
        try:
            db_alimento = AlimentoSalvo(
                **alimento_data.model_dump(), # Pydantic V2
                refeicao_id=db_refeicao.id 
            )
        except AttributeError: # Fallback para Pydantic V1
             db_alimento = AlimentoSalvo(
                **alimento_data.dict(), 
                refeicao_id=db_refeicao.id 
            )
        db.add(db_alimento)
        
    db.commit()
    db.refresh(db_refeicao) 
    return db_refeicao

def get_refeicao_salva(db: Session, meal_id: int, user_id: int) -> Optional[RefeicaoSalva]:
    """Busca uma refeição salva pelo ID, garantindo que pertence ao usuário."""
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.id == meal_id, 
        RefeicaoSalva.owner_id == user_id
    ).first()

def update_refeicao_status(db: Session, db_refeicao: RefeicaoSalva, status: RefeicaoStatus) -> RefeicaoSalva:
    """Atualiza o status de uma refeição salva."""
    db_refeicao.status = status
    db_refeicao.updated_at = datetime.now()
    db.commit()
    db.refresh(db_refeicao)
    return db_refeicao

# --- NOVAS FUNÇÕES ADICIONADAS ---

def get_historico_refeicoes_por_usuario(db: Session, user_id: int) -> List[RefeicaoSalva]:
    """Busca todas as refeições de um usuário para a lista de histórico."""
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.owner_id == user_id
    ).order_by(RefeicaoSalva.created_at.desc()).all()

def get_detalhe_refeicao_por_id(db: Session, meal_id: int, user_id: int) -> Optional[RefeicaoSalva]:
    """Busca uma refeição específica e garante que ela pertence ao usuário."""
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.id == meal_id,
        RefeicaoSalva.owner_id == user_id
    ).first()

def get_consumo_macros_hoje(db: Session, user_id: int) -> Dict[str, float]:
    """
    Calcula a soma de calorias e macros para todas as refeições 
    completas do usuário no dia de hoje.
    """
    today = datetime.now().date()

    # Buscar todas as refeições de hoje com análise completa
    refeicoes_hoje = db.query(RefeicaoSalva).filter(
        RefeicaoSalva.owner_id == user_id,
        cast(RefeicaoSalva.created_at, Date) == today,
        RefeicaoSalva.status == RefeicaoStatus.ANALYSIS_COMPLETE
    ).all()

    total_calorias = 0.0
    total_proteinas = 0.0
    total_carboidratos = 0.0
    total_gorduras = 0.0

    for refeicao in refeicoes_hoje:
        # Calcular baseado nos alimentos salvos (versão simplificada)
        for alimento in refeicao.alimentos:
            total_calorias += alimento.calorias_estimadas or 0
            # Se tiver campos de macros, adicione aqui

    return {
        "total_calorias": total_calorias,
        "total_proteinas_g": total_proteinas,
        "total_carboidratos_g": total_carboidratos,
        "total_gorduras_g": total_gorduras
    }

def get_refeicoes_hoje_por_usuario(db: Session, user_id: int) -> List[RefeicaoSalva]:
    """
    Busca todas as refeições do usuário de hoje
    que já tiveram a análise concluída.
    """
    today = datetime.now().date()

    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.owner_id == user_id,
        cast(RefeicaoSalva.created_at, Date) == today,
        RefeicaoSalva.status == RefeicaoStatus.ANALYSIS_COMPLETE
    ).order_by(RefeicaoSalva.created_at.asc()).all()