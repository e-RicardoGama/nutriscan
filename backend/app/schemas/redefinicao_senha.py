# app/schemas/redefinicao_senha.py

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from uuid import UUID

class SolicitarRedefinicao(BaseModel):
    email: EmailStr = Field(
        ..., 
        description="Email do usuário que esqueceu a senha",
        examples=["usuario@exemplo.com"]
    )

class TokenRedefinicaoResponse(BaseModel):
    token: str
    expiracao: datetime
    email: str

class RedefinirSenha(BaseModel):
    token: str = Field(
        ..., 
        description="Token recebido por email",
        examples=["abc123-def456-ghi789"]
    )
    nova_senha: str = Field(
        ..., 
        min_length=8, 
        description="Nova senha (mínimo 8 caracteres)",
        examples=["NovaSenhaSegura123!"]
    )
    confirmar_senha: str = Field(
        ..., 
        description="Confirmação da nova senha",
        examples=["NovaSenhaSegura123!"]
    )

class RedefinicaoConcluida(BaseModel):
    mensagem: str = Field(
        default="Senha redefinida com sucesso",
        examples=["Senha redefinida com sucesso"]
    )
    email: str = Field(..., examples=["usuario@exemplo.com"])