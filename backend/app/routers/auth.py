# app/routers/auth.py — VERSÃO PARA PRODUÇÃO

import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.schemas.login import Token
from app.schemas.registro import UserRegister, UserResponse
from app.schemas.redefinicao_senha import (
    SolicitarRedefinicao,
    RedefinirSenha,
    RedefinicaoConcluida
)

from app.database import get_db
from app.models.usuario import Usuario
from app.utils.validators import validar_senha
from app.utils.email_sender import enviar_email_redefinicao

from app.security import (
    criar_token_redefinicao,
    validar_token_redefinicao,
    gerar_hash_senha,
    verificar_senha,
    criar_access_token
)

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)

# 🔧 Detecta ambiente e pega URL do frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
IS_LOCAL = FRONTEND_URL.startswith("http://localhost")


def get_user_by_email(email: str, db: Session):
    return db.query(Usuario).filter(Usuario.email == email).first()


# ================================================================
# 🔐 REGISTRO
# ================================================================
@router.post("/registrar", response_model=UserResponse)
def registrar(usuario: UserRegister, db: Session = Depends(get_db)):
    senha_valida, mensagem = validar_senha(usuario.password)
    if not senha_valida:
        raise HTTPException(status_code=400, detail=mensagem)

    if get_user_by_email(usuario.email, db):
        raise HTTPException(status_code=400, detail="Email já registrado")

    hashed_password = gerar_hash_senha(usuario.password)

    novo_usuario = Usuario(
        nome=usuario.nome,
        apelido=usuario.apelido,
        email=usuario.email,
        senha_hash=hashed_password,
        data_nascimento=usuario.data_nascimento,
        cep=usuario.cep,
        logradouro=usuario.logradouro,
        numero=usuario.numero,
        complemento=usuario.complemento,
        bairro=usuario.bairro,
        cidade=usuario.cidade,
        estado=usuario.estado
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return novo_usuario


# ================================================================
# 🔐 LOGIN
# ================================================================
@router.post("/login", response_model=Token)
def login_para_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    if len(form_data.password.encode("utf-8")) > 72:
        raise HTTPException(400, "Senha muito longa")

    user = get_user_by_email(form_data.username, db)

    if not user or not verificar_senha(form_data.password, user.senha_hash):
        raise HTTPException(401, "Credenciais incorretas")

    access_token = criar_access_token({"sub": user.email})

    return {"access_token": access_token, "token_type": "bearer"}


# ================================================================
# 🔐 ESQUECI MINHA SENHA (PRODUÇÃO)
# ================================================================
@router.post("/esqueci-senha", response_model=dict)
def solicitar_redefinicao_senha(
    request: SolicitarRedefinicao,
    db: Session = Depends(get_db)
):

    usuario = get_user_by_email(request.email, db)

    # Sempre retornar sucesso para segurança (não revelar emails existentes)
    if not usuario:
        return {
            "mensagem": "Se o email estiver registrado, você receberá instruções para redefinir sua senha."
        }

    try:
        # Cria token temporário
        token = criar_token_redefinicao(usuario, db, expiracao_horas=1)

        # Monta link com base na FRONTEND_URL
        link = f"{FRONTEND_URL}/redefinir-senha?token={token}"

        # Envia email via SENDGRID
        enviar_email_redefinicao(request.email, link)

        return {
            "mensagem": "Se o email estiver registrado, você receberá instruções para redefinir sua senha."
            # ❌ NÃO RETORNAR O TOKEN EM PRODUÇÃO
        }

    except Exception as e:
        db.rollback()
        print("❌ ERRO NO PROCESSO DE ESQUECI-SENHA:", e)
        raise HTTPException(500, "Erro interno ao processar solicitação de redefinição.")


# ================================================================
# 🔐 REDEFINIR SENHA
# ================================================================
@router.post("/redefinir-senha", response_model=RedefinicaoConcluida)
def redefinir_senha(
    request: RedefinirSenha,
    db: Session = Depends(get_db)
):

    if request.nova_senha != request.confirmar_senha:
        raise HTTPException(400, "As senhas não coincidem")

    senha_valida, mensagem = validar_senha(request.nova_senha)
    if not senha_valida:
        raise HTTPException(400, mensagem)

    usuario = validar_token_redefinicao(request.token, db)
    if not usuario:
        raise HTTPException(400, "Token inválido ou expirado")

    try:
        usuario.senha_hash = gerar_hash_senha(request.nova_senha)

        if hasattr(usuario, "updated_at"):
            usuario.updated_at = func.now()

        db.commit()
        db.refresh(usuario)

        return RedefinicaoConcluida(email=usuario.email)

    except Exception as e:
        db.rollback()
        print("❌ ERRO AO REDEFINIR SENHA:", e)
        raise HTTPException(500, "Erro interno ao redefinir senha")
