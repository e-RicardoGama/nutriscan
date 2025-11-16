# app/models/refeicoes.py - VERSÃO FINAL

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum, Float, func, text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import TIMESTAMP
from app.database import Base
from app.models.alimentos import Alimento  # 🔹 IMPORTANTE: Import para relacionamento com Alimento
import enum
from datetime import datetime, timezone

class RefeicaoStatus(str, enum.Enum):
    PENDING_ANALYSIS = "pending_analysis"
    ANALYSIS_COMPLETE = "analysis_complete"
    ANALYSIS_FAILED = "analysis_failed"

class RefeicaoSalva(Base):
    __tablename__ = "refeicoes_salvas"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    status = Column(SQLEnum(RefeicaoStatus), default=RefeicaoStatus.PENDING_ANALYSIS)

    imagem_url = Column(String(512), nullable=True)  # Guarda a URL pública do GCS
    analysis_result_json = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True),
                       default=text("TIMEZONE('America/Sao_Paulo', CURRENT_TIMESTAMP)"))
    updated_at = Column(DateTime(timezone=True),
                       default=text("TIMEZONE('America/Sao_Paulo', CURRENT_TIMESTAMP)"),
                       onupdate=text("TIMEZONE('America/Sao_Paulo', CURRENT_TIMESTAMP)"))

    # Relacionamentos
    alimentos = relationship("AlimentoSalvo", back_populates="refeicao", cascade="all, delete-orphan")
    owner = relationship("Usuario", back_populates="refeicoes_salvas")

class AlimentoSalvo(Base):
    __tablename__ = "alimentos_salvos"

    id = Column(Integer, primary_key=True, index=True)
    refeicao_id = Column(Integer, ForeignKey("refeicoes_salvas.id"))
    alimento_id = Column(Integer, ForeignKey("alimentos.id"), nullable=True)
    nome = Column(String(255))
    quantidade_estimada_g = Column(Float) # 🔹 Confirmar este nome
    categoria_nutricional = Column(String(255), nullable=True)
    confianca = Column(String(50), nullable=True)

    # 🔹 IMPORTANTE: A coluna DEVE ser 'calorias_estimadas'
    calorias_estimadas = Column(Float, nullable=True) 

    medida_caseira_sugerida = Column(String(255), nullable=True)

    refeicao = relationship("RefeicaoSalva", back_populates="alimentos_salvos")
    alimento_detalhes = relationship("Alimento", back_populates="alimentos_salvos")
