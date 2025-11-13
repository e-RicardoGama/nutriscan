# app/models/refeicoes.py
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum,Float, func
from sqlalchemy.orm import relationship
from app.database import Base
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
    
    # --- ADICIONE ESTA LINHA ---
    imagem_url = Column(String(512), nullable=True) # Guarda a URL pública do GCS
    # --- FIM DA ADIÇÃO ---
    
    analysis_result_json = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now())  # Só na criação
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())  # Sempre que atualizar
    
    # Relacionamentos
    alimentos = relationship("AlimentoSalvo", back_populates="refeicao", cascade="all, delete-orphan")
    owner = relationship("Usuario", back_populates="refeicoes_salvas")

class AlimentoSalvo(Base):
    __tablename__ = "alimentos_salvos"
    
    id = Column(Integer, primary_key=True, index=True)
    refeicao_id = Column(Integer, ForeignKey("refeicoes_salvas.id"), nullable=False)
    
    nome = Column(String(255), nullable=False)
    quantidade_estimada_g = Column(Float)  # Usar Float se preferir
    categoria_nutricional = Column(String(100))
    confianca = Column(String(50))  # 'alta', 'media', 'baixa', 'corrigido'
    calorias_estimadas = Column(Float)  # Usar Float se preferir
    medida_caseira_sugerida = Column(String(100))
    
    # Relacionamentos
    refeicao = relationship("RefeicaoSalva", back_populates="alimentos")