# app/crud.py - VERSÃO COMPLETA ATUALIZADA
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from typing import Optional, List, Dict, Any
import json
from datetime import datetime,date
from pytz import timezone

# --- Imports Explícitos ---
from app.models.refeicoes import RefeicaoSalva, AlimentoSalvo, RefeicaoStatus
from app.models.usuario import Usuario
from app.models.alimentos import Alimento
from app.schemas.vision_alimentos_ import (
    RefeicaoSalvaCreate, 
    AnaliseCompletaResponse as AnaliseCompletaResponseSchema
)

# --- CRUD para Refeição Salva ---

# app/crud.py - VERSÃO CORRIGIDA
def create_refeicao_salva(db: Session,
                         refeicao_data: RefeicaoSalvaCreate,
                         user_id: int) -> RefeicaoSalva:
    """Cria uma nova refeição salva com seus alimentos."""
    
    # ✅ ADICIONE O CAMPO imagem_url AQUI
    db_refeicao = RefeicaoSalva(
        owner_id=user_id,
        status=RefeicaoStatus.PENDING_ANALYSIS,
        imagem_url=refeicao_data.imagem_url  # ✅ ADICIONAR ESTA LINHA
    )
    
    db.add(db_refeicao)
    db.flush()  # Gera o ID antes de inserir os alimentos

    # Adiciona os alimentos associados
    for alimento_data in refeicao_data.alimentos:
        try:
            db_alimento = AlimentoSalvo(
                **alimento_data.model_dump(),  # Pydantic v2
                refeicao_id=db_refeicao.id
            )
        except AttributeError:  # Fallback para Pydantic v1
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

def get_consumo_macros_hoje(db: Session, user_id: int) -> dict:
    """Soma o total de calorias, proteínas, carboidratos e gorduras de todas as refeições de hoje."""
    hoje = date.today()

    refeicoes_hoje = (
        db.query(RefeicaoSalva)
        .filter(
            RefeicaoSalva.owner_id == user_id,
            func.date(RefeicaoSalva.created_at) == hoje
        )
        .all()
    )

    total_calorias = 0.0
    total_proteinas_g = 0.0
    total_carboidratos_g = 0.0
    total_gorduras_g = 0.0

    for refeicao in refeicoes_hoje:
        if refeicao.analysis_result_json:
            try:
                analise = json.loads(refeicao.analysis_result_json)

                analise_nutricional = analise.get("analise_nutricional", {})
                macros = analise_nutricional.get("macronutrientes", {})

                total_calorias += analise_nutricional.get("calorias_totais", 0)
                total_proteinas_g += macros.get("proteinas_g", 0)
                total_carboidratos_g += macros.get("carboidratos_g", 0)
                total_gorduras_g += macros.get("gorduras_g", 0)

            except Exception as e:
                print(f"Erro ao processar JSON da refeição ID {refeicao.id}: {e}")

    return {
        "total_calorias": round(total_calorias, 1),
        "total_proteinas_g": round(total_proteinas_g, 1),
        "total_carboidratos_g": round(total_carboidratos_g, 1),
        "total_gorduras_g": round(total_gorduras_g, 1)
    }

def get_refeicoes_hoje_por_usuario(db: Session, user_id: int) -> List[RefeicaoSalva]:
    """
    Busca todas as refeições do usuário de hoje
    que já tiveram a análise concluída.
    """
    today = datetime.now(timezone("America/Sao_Paulo")).date()

    return db.query(RefeicaoSalva).filter(
        RefeicaoSalva.owner_id == user_id,
        cast(RefeicaoSalva.created_at, Date) == today,
        RefeicaoSalva.status == RefeicaoStatus.ANALYSIS_COMPLETE
    ).order_by(RefeicaoSalva.created_at.asc()).all()


def enriquecer_refeicao_com_analise(refeicao: RefeicaoSalva) -> dict:
    """
    Extrai dados da análise JSON e dos alimentos salvos
    para enriquecer a resposta do dashboard.
    """
    resultado = {
        "id": refeicao.id,
        "tipo": None,
        "kcal_estimadas": None,
        "imagem_url": refeicao.imagem_url,
        "proteinas_g": None,
        "carboidratos_g": None,
        "gorduras_g": None,
        "suggested_name": None,
        "alimentos_principais": []
    }

    # 1️⃣ Extrair dados da análise JSON (se existir)
    if refeicao.analysis_result_json:
        try:
            analise = json.loads(refeicao.analysis_result_json)
            
            # Extrair calorias
            analise_nutricional = analise.get("analise_nutricional", {})
            resultado["kcal_estimadas"] = analise_nutricional.get("calorias_totais")
            
            # Extrair macros
            macros = analise_nutricional.get("macronutrientes", {})
            resultado["proteinas_g"] = macros.get("proteinas_g")
            resultado["carboidratos_g"] = macros.get("carboidratos_g")
            resultado["gorduras_g"] = macros.get("gorduras_g")
            
        except Exception as e:
            print(f"Erro ao processar JSON da refeição ID {refeicao.id}: {e}")

    # 2️⃣ Extrair lista de alimentos principais
    if refeicao.alimentos:
        # Pega os 3 primeiros alimentos
        alimentos_principais = [
            alimento.nome 
            for alimento in refeicao.alimentos[:3]
        ]
        resultado["alimentos_principais"] = alimentos_principais
        
        # Gera um nome sugerido baseado nos alimentos
        if len(alimentos_principais) > 0:
            if len(alimentos_principais) == 1:
                resultado["suggested_name"] = alimentos_principais[0]
            elif len(alimentos_principais) == 2:
                resultado["suggested_name"] = f"{alimentos_principais[0]} e {alimentos_principais[1]}"
            else:
                resultado["suggested_name"] = f"{alimentos_principais[0]}, {alimentos_principais[1]} e mais"

    # 3️⃣ Inferir tipo de refeição baseado no horário
    hora_criacao = refeicao.created_at.hour
    if 5 <= hora_criacao < 11:
        resultado["tipo"] = "Café da Manhã"
    elif 11 <= hora_criacao < 15:
        resultado["tipo"] = "Almoço"
    elif 15 <= hora_criacao < 18:
        resultado["tipo"] = "Lanche da Tarde"
    elif 18 <= hora_criacao < 23:
        resultado["tipo"] = "Jantar"
    else:
        resultado["tipo"] = "Lanche da Madrugada"

    return resultado
