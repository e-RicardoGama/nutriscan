# app/routers/lgpd_consent.py (versão simplificada)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.schemas.lgpd_consent_create import LGPDConsentCreate

router = APIRouter(
    prefix="/lgpd-consent",
    tags=["LGPD Consent"]
)

@router.post("/", status_code=201)
def create_lgpd_consent(
    consent: LGPDConsentCreate,
    db: Session = Depends(get_db)
):
    try:
        # Para teste, crie manualmente o dicionário de dados
        consent_data = {
            "status": consent.status,
            "user_id": None,  # Por enquanto sem usuário
            "timestamp": consent.timestamp or datetime.utcnow()
        }
        
        # Execute SQL raw ou use seu modelo
        from sqlalchemy import text
        result = db.execute(
            text("""
                INSERT INTO lgpd_consents (status, user_id, timestamp)
                VALUES (:status, :user_id, :timestamp)
            """),
            consent_data
        )
        db.commit()
        
        return {"message": "Consentimento registrado com sucesso"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao registrar consentimento: {str(e)}"
        )