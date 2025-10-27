# app/models.py
from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.sql import func
from app.database import Base

class LGPDConsent(Base):
    __tablename__ = "lgpd_consent"

    id = Column(Integer, primary_key=True, index=True)
    # Se você prefere UUID para id, substitua Integer por PGUUID & ajuste migrations.
    user_id = Column(PGUUID(as_uuid=True), nullable=True)  # vincular ao usuário quando disponível
    status = Column(String(20), nullable=False)  # "accepted" ou "rejected"
    timestamp = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
