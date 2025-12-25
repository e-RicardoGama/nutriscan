# app/models/usuario.py - VERSÃO ATUALIZADA COM ENDEREÇO DETALHADO

from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, TIMESTAMP, func, Float, Boolean, Date
from app.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    apelido = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    email_verificado = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    data_nascimento = Column(Date, nullable=True) # Data de nascimento
    cep = Column(String(9), nullable=True) # CEP, ex: "12345-678"

    # ✅ NOVAS COLUNAS DETALHADAS PARA ENDEREÇO
    logradouro = Column(String, nullable=True) # Ex: Rua Exemplo
    numero = Column(String, nullable=True) # Ex: 123
    complemento = Column(String, nullable=True) # Ex: Apto 401
    bairro = Column(String, nullable=True)
    cidade = Column(String, nullable=True)
    estado = Column(String(2), nullable=True) # UF, ex: SP

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    refeicoes_salvas = relationship(
        "RefeicaoSalva",
        back_populates="owner",
        cascade="all, delete-orphan"
    )
    tokens_redefinicao = relationship(
        "TokenRedefinicaoSenha",
        back_populates="usuario",
        cascade="all, delete-orphan"
    )

class TokenRedefinicaoSenha(Base):
    __tablename__ = "tokens_redefinicao_senha"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String, nullable=False, index=True, unique=True)
    expiracao = Column(TIMESTAMP(timezone=True), nullable=False)
    usado = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    usuario = relationship("Usuario", back_populates="tokens_redefinicao")

    def esta_expirado(self) -> bool:
        """
        Retorna True se a data de expiração já passou.
        Usa timezone-aware datetime (UTC).
        """
        try:
            if self.expiracao is None:
                return True
            now_utc = datetime.now(timezone.utc)
            # self.expiracao vem do SQLAlchemy como timezone-aware datetime
            return now_utc > self.expiracao
        except Exception as e:
            # Se algo inesperado ocorrer, trate como expirado por segurança
            import logging
            logging.getLogger(__name__).exception("Erro ao avaliar expiração do token: %s", e)
            return True

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

    kcal_meta = Column(Float, nullable=True)
    proteina_g_meta = Column(Float, nullable=True)
    carboidrato_g_meta = Column(Float, nullable=True)
    lipidios_g_meta = Column(Float, nullable=True)
    fibras_g_meta = Column(Float, nullable=True)

    role = Column(String, default="user", nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    usuario = relationship("Usuario")

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

    kcal_meta = Column(Numeric, nullable=True)
    proteina_g_meta = Column(Numeric, nullable=True)
    carboidrato_g_meta = Column(Numeric, nullable=True)
    lipidios_g_meta = Column(Numeric, nullable=True)
    fibras_g_meta = Column(Numeric, nullable=True)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())

    usuario = relationship("Usuario")
