# app/security.py - VERSÃO CORRIGIDA E COMPLETA

import os
import logging
import secrets # ✅ Adicionado para gerar tokens de redefinição
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt
from dotenv import load_dotenv
from sqlalchemy import func # ✅ Adicionado para func.now() em TokenRedefinicaoSenha
from sqlalchemy.orm import Session

# Complementos de autenticação
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.database import get_db
from app.models.usuario import Usuario, TokenRedefinicaoSenha # ✅ TokenRedefinicaoSenha importado

load_dotenv()

# Configurar logger
logger = logging.getLogger(__name__)

# --- CONFIGURAÇÕES (do .env) ---
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY não definido no .env (adicione uma string segura).")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
RESET_TOKEN_EXPIRE_HOURS = int(os.getenv("RESET_TOKEN_EXPIRE_HOURS", 1)) # ✅ Nova configuração para expiração do token de redefinição

# --- Funções de Hash e Verificação de Senha ---
def gerar_hash_senha(senha: str) -> str:
    """
    Gera hash da senha usando bcrypt.
    Rejeita senhas muito longas.
    """
    try:
        senha_bytes = senha.encode('utf-8')

        if len(senha_bytes) > 72:
            raise ValueError(
                "Senha muito longa. O bcrypt suporta no máximo 72 bytes UTF-8. "
                f"Sua senha tem {len(senha_bytes)} bytes."
            )

        salt = bcrypt.gensalt(rounds=12)
        hashed_bytes = bcrypt.hashpw(senha_bytes, salt)
        return hashed_bytes.decode('utf-8')

    except ValueError as ve:
        raise
    except Exception as e:
        logger.error(f"Erro ao gerar hash de senha: {e}")
        raise RuntimeError("Erro interno ao processar senha")

def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """
    Verifica se a senha plana corresponde ao hash armazenado.
    Rejeita senhas muito longas.
    """
    try:
        senha_bytes = senha_plana.encode('utf-8')

        if len(senha_bytes) > 72:
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

    to_encode.update({"exp": int(expire.timestamp())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decodificar_token(token: str) -> dict:
    """
    Decodifica um token JWT e retorna seu payload.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise e

# --- Autenticação OAuth2 ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    """
    Obtém o usuário atualmente autenticado a partir do token JWT.
    """
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

# --- Funções de Redefinição de Senha ---
def gerar_token_redefinicao() -> str:
    """
    Gera um token único e seguro para redefinição de senha.
    Usa 32 bytes (256 bits) de entropia, codificado em base64url.
    """
    return secrets.token_urlsafe(32)

def criar_token_redefinicao(usuario: Usuario, db: Session, expiracao_horas: int = RESET_TOKEN_EXPIRE_HOURS) -> str:
    """
    Cria e salva um token de redefinição de senha no banco.
    Remove tokens antigos do mesmo usuário antes de criar um novo.
    """
    # Remover tokens antigos do mesmo usuário
    db.query(TokenRedefinicaoSenha).filter(
        TokenRedefinicaoSenha.usuario_id == usuario.id
    ).delete()
    db.commit()

    # Gerar novo token
    token = gerar_token_redefinicao()
    # Usar datetime.now(timezone.utc) para consistência com TIMESTAMP(timezone=True)
    expiracao = datetime.now(timezone.utc) + timedelta(hours=expiracao_horas)

    # Criar e salvar o token
    token_obj = TokenRedefinicaoSenha(
        usuario_id=usuario.id,
        token=token,
        expiracao=expiracao,
        usado=False
    )
    db.add(token_obj)
    db.commit()
    db.refresh(token_obj)
    return token


def validar_token_redefinicao(token: str, db: Session) -> Optional[Usuario]:
    """
    Valida um token de redefinição e retorna o usuário associado se válido.
    Marca o token como usado após validação bem-sucedida.
    """
    token_obj = db.query(TokenRedefinicaoSenha).filter(
        TokenRedefinicaoSenha.token == token,
        TokenRedefinicaoSenha.usado == False
    ).first()

    if not token_obj:
        logger.info("validar_token_redefinicao: token não encontrado (possível inválido).")
        return None

    # Comparação em Python usando timezone-aware datetimes
    try:
        if token_obj.expiracao is None:
            logger.info("validar_token_redefinicao: token sem data de expiração (inválido). token_id=%s", token_obj.id)
            return None

        if datetime.now(timezone.utc) > token_obj.expiracao:
            logger.info("validar_token_redefinicao: token expirado. token_id=%s", token_obj.id)
            return None

        # Marcar como usado (transação simples)
        token_obj.usado = True
        db.commit()
        db.refresh(token_obj)

        return token_obj.usuario

    except Exception as e:
        logger.exception("Erro ao validar token de redefinição: %s", e)
        db.rollback()
        return None

