# app/schemas/registro.py - VERSÃO ATUALIZADA COM ENDEREÇO DETALHADO

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime # ✅ Importar datetime para created_at/updated_at

class UserRegister(BaseModel):
    nome: str = Field(..., min_length=2, max_length=50)
    apelido: Optional[str] = Field(None, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

    data_nascimento: Optional[date] = Field(None, description="Data de nascimento do usuário (AAAA-MM-DD)")
    cep: Optional[str] = Field(None, max_length=9, description="CEP do usuário (ex: 12345-678)")

    # ✅ NOVAS COLUNAS DETALHADAS PARA ENDEREÇO
    logradouro: Optional[str] = Field(None, description="Nome da rua/avenida")
    numero: Optional[str] = Field(None, max_length=10, description="Número do imóvel")
    complemento: Optional[str] = Field(None, max_length=100, description="Complemento do endereço (ex: Apto 101)")
    bairro: Optional[str] = Field(None, description="Bairro")
    cidade: Optional[str] = Field(None, description="Cidade")
    estado: Optional[str] = Field(None, max_length=2, description="Estado (UF, ex: SP)")

    class Config:
        schema_extra = {
            "example": {
                "nome": "João",
                "apelido": "Jão",
                "email": "joao.silva@example.com",
                "password": "SenhaSegura123!",
                "data_nascimento": "1990-01-15",
                "cep": "12345-678",
                "logradouro": "Rua Exemplo",
                "numero": "123",
                "complemento": "Apto 401",
                "bairro": "Centro",
                "cidade": "São Paulo",
                "estado": "SP"
            }
        }

class UserResponse(BaseModel):
    id: int
    nome: str
    apelido: Optional[str]
    email: EmailStr
    email_verificado: bool
    is_active: bool

    data_nascimento: Optional[date]
    cep: Optional[str]

    # ✅ NOVAS COLUNAS DETALHADAS PARA ENDEREÇO
    logradouro: Optional[str]
    numero: Optional[str]
    complemento: Optional[str]
    bairro: Optional[str]
    cidade: Optional[str]
    estado: Optional[str]

    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
