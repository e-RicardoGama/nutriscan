# app/crud.py - Imports Explícitos Corrigidos
from sqlalchemy.orm import Session
from typing import Optional 

# --- Imports Explícitos ---
# Importa modelos específicos dos seus respectivos arquivos
from app.models.refeicoes import RefeicaoSalva, AlimentoSalvo 
from app.models.usuario import Usuario # Importa Usuario se precisar (ex: para type hints)
# Importa schemas específicos
from app.schemas.vision_alimentos_ import RefeicaoSalvaCreate, AlimentoSalvoCreate, RefeicaoStatus

# --- CRUD para Refeição Salva ---

def create_refeicao_salva(db: Session, refeicao_data: RefeicaoSalvaCreate, user_id: int) -> RefeicaoSalva:
    """Cria uma nova refeição salva com seus alimentos."""
    # Usa o Model RefeicaoSalva importado diretamente
    db_refeicao = RefeicaoSalva(owner_id=user_id, status=RefeicaoStatus.PENDING_ANALYSIS)
    db.add(db_refeicao)
    db.flush() 

    for alimento_data in refeicao_data.alimentos:
        try:
             # Usa o Model AlimentoSalvo importado diretamente
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
    # Usa o Model RefeicaoSalva importado diretamente
    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.id == meal_id, 
        RefeicaoSalva.owner_id == user_id
    ).first()

def update_refeicao_status(db: Session, db_refeicao: RefeicaoSalva, status: RefeicaoStatus) -> RefeicaoSalva:
    """Atualiza o status de uma refeição salva."""
    # Usa o Model RefeicaoSalva e o Enum RefeicaoStatus importados diretamente
    db_refeicao.status = status
    db.commit()
    db.refresh(db_refeicao)
    return db_refeicao

