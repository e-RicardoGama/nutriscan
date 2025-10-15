from pydantic import BaseModel
from typing import Optional, List

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id: int
    nome: str  # ✅ Adicionar este campo
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None