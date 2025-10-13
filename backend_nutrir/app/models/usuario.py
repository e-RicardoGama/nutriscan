# app/models/usuario.py
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, TIMESTAMP, func, Float, Boolean
from app.database import Base
from sqlalchemy.orm import relationship

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    email_verificado = Column(Boolean, default=False)
    
    # ✅ Adicionado o campo 'is_active'
    is_active = Column(Boolean, default=True)

class DadosUsuario(Base):
    __tablename__ = "dados_usuarios"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)

    
    altura_cm = Column(Numeric, nullable=True)
    peso_kg = Column(Numeric, nullable=True)
    idade = Column(Integer, nullable=True)
    sexo = Column(String, nullable=True)
    nivel_atividade = Column(String, nullable=True)
    dieta_preferida = Column(String, nullable=True)
    objetivo = Column(String, nullable=True)
#    refeicoes_diarias = Column(String, nullable=True)

    # Metas nutricionais
    kcal_meta = Column(Float, nullable=True)
    proteina_g_meta = Column(Float, nullable=True)
    carboidrato_g_meta = Column(Float, nullable=True)
    lipidios_g_meta = Column(Float, nullable=True)
    fibras_g_meta = Column(Float, nullable=True)

    role = Column(String, default="user", nullable=False) # Valores: "user" ou "admin"

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    # Relacionamento de volta para o usuário
    usuario = relationship("Usuario")

    # Relacionamentos
#    refeicao = relationship("Refeicao", back_populates="usuario", cascade="all, delete-orphan")
    # ✅ Removido o relacionamento com PlanejamentoRefeicao, pois ainda não existe.


class HistoricoUsuario(Base):
    __tablename__ = "historico_usuarios"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)

    altura_cm = Column(Numeric, nullable=True)
    peso_kg = Column(Numeric, nullable=True)
    idade = Column(Integer, nullable=True)
    sexo = Column(String, nullable=True)
    nivel_atividade = Column(String, nullable=True)
    dieta_preferida = Column(String, nullable=True)
    objetivo = Column(String, nullable=True)
#    refeicoes_diarias = Column(String, nullable=True)

    kcal_meta = Column(Numeric, nullable=True)
    proteina_g_meta = Column(Numeric, nullable=True)
    carboidrato_g_meta = Column(Numeric, nullable=True)
    lipidios_g_meta = Column(Numeric, nullable=True)
    fibras_g_meta = Column(Numeric, nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    # Relacionamento de volta para o usuário
    usuario = relationship("Usuario")

    