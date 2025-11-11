# app/security.py - VERSÃO HÍBRIDA CORRIGIDA E OTIMIZADA
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import logging

import bcrypt
from jose import JWTError, jwt
from dotenv import load_dotenv

# Complementos de autenticação
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario

load_dotenv()

# Configurar logger
logger = logging.getLogger(__name__)

# --- CONFIGURAÇÕES (do .env) ---
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY não definido no .env (adicione uma string segura).")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# ✅ SOLUÇÃO SEGURA para gerar hash de senha
def gerar_hash_senha(senha: str) -> str:
    """
    Gera hash da senha usando bcrypt diretamente.
    Rejeita senhas muito longas em vez de truncar silenciosamente.
    """
    try:
        senha_bytes = senha.encode('utf-8')

        # ✅ REJEITAR em vez de truncar
        if len(senha_bytes) > 72:
            raise ValueError(
                "Senha muito longa. O bcrypt suporta no máximo 72 bytes UTF-8. "
                f"Sua senha tem {len(senha_bytes)} bytes."
            )

        salt = bcrypt.gensalt(rounds=12)  # ✅ Aumentar rounds para mais segurança
        hashed_bytes = bcrypt.hashpw(senha_bytes, salt)
        return hashed_bytes.decode('utf-8')

    except ValueError as ve:
        # Re-lançar erros de validação
        raise
    except Exception as e:
        logger.error(f"Erro ao gerar hash de senha: {e}")
        raise RuntimeError("Erro interno ao processar senha")

# ✅ SOLUÇÃO SEGURA para verificar senha (mantida a primeira versão)
def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """
    Verifica se a senha plana corresponde ao hash armazenado.
    Rejeita senhas muito longas.
    """
    try:
        senha_bytes = senha_plana.encode('utf-8')

        # ✅ REJEITAR em vez de truncar
        if len(senha_bytes) > 72:
            # Senha inválida por ser muito longa
            return False

        if isinstance(senha_hash, str):
            senha_hash = senha_hash.encode('utf-8')

        return bcrypt.checkpw(senha_bytes, senha_hash)

    except Exception as e:
        logger.error(f"Erro ao verificar senha: {e}")
        return False

# --- JWT helpers ---
def criar_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Cria um token JWT contendo os dados passados em 'data' e o exp como timestamp inteiro.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # usar timestamp inteiro (compatível)
    to_encode.update({"exp": int(expire.timestamp())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decodificar_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise e

# --- Autenticação OAuth2 ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    try:
        payload = decodificar_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    user = db.query(Usuario).filter(Usuario.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user
