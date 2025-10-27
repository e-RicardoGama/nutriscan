# app/schemas/lgpd_consent_create.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class LGPDConsentCreate(BaseModel):
    status: str  # "accepted" or "rejected"
    timestamp: Optional[datetime] = None
    user_id: Optional[UUID] = None