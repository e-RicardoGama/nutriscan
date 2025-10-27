# app/schemas/auth.py (ou onde estiver seu schema de registro)
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    nome: str
    apelido: str  # ✅ Adicionar este campo
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    nome: str
    apelido: str  # ✅ Adicionar este campo
    email: str
    is_active: bool

    class Config:
        from_attributes = True