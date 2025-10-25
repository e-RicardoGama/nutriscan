import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Text, JSON, Numeric, Boolean, TIMESTAMP, func
from sqlalchemy.orm import relationship
from app.database import Base

class RefeicaoStatus(str, enum.Enum):
    PENDING_ANALYSIS = "pending_analysis"
    ANALYSIS_COMPLETE = "analysis_complete"
    ANALYSIS_FAILED = "analysis_failed"

class RefeicaoSalva(Base):
    __tablename__ = "refeicoes_salvas"

    id = Column(Integer, primary_key=True, index=True)
    # ✅ Chave estrangeira aponta para a tabela 'usuarios' e o id do Usuario
    owner_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False) 
    status = Column(Enum(RefeicaoStatus), default=RefeicaoStatus.PENDING_ANALYSIS, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Opcional: analysis_result_json = Column(Text, nullable=True) 

    # ✅ Relacionamento de volta para o Usuario
    owner = relationship("Usuario", back_populates="refeicoes_salvas") 
    alimentos = relationship("AlimentoSalvo", back_populates="refeicao", cascade="all, delete-orphan")

class AlimentoSalvo(Base):
    __tablename__ = "alimentos_salvos"

    id = Column(Integer, primary_key=True, index=True)
    # ✅ Chave estrangeira aponta para a tabela 'refeicoes_salvas'
    refeicao_id = Column(Integer, ForeignKey("refeicoes_salvas.id"), nullable=False) 
    
    nome = Column(String, index=True, nullable=False)
    quantidade_estimada_g = Column(Float, nullable=True) 
    categoria_nutricional = Column(String, nullable=True) # Ex: 'Fruta', 'Grão' (vem do scan)
    confianca = Column(String, nullable=True) # Ex: 'alta', 'media', 'corrigido'
    calorias_estimadas = Column(Float, nullable=True) 
    medida_caseira_sugerida = Column(String, nullable=True)
    origin_category = Column(String, nullable=True) # Ex: 'Entrada', 'Prato Principal' (vem do frontend)
    
    refeicao = relationship("RefeicaoSalva", back_populates="alimentos")