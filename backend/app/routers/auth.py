# app/routers/auth.py - VERSÃO COMPLETA E CORRIGIDA

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Importações dos seus schemas
from app.schemas.login import UserPublic, UserCreate, Token

# Importações do banco, modelos e segurança
from app.database import get_db
from app.models.usuario import Usuario 
from app import security

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)


# ✅ ROTA DE REGISTRO (ESTAVA FALTANDO)
@router.post("/registrar", response_model=UserPublic) 
def registrar_usuario(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já registrado."
        )
    
    # O modelo 'Usuario' precisa ter o campo 'nome', que é obrigatório
    # Adicionamos um nome padrão extraído do email.
    nome_padrao = user.email.split('@')[0]
    
    hashed_password = security.gerar_hash_senha(user.password)
    novo_usuario = Usuario(
        nome=nome_padrao, 
        email=user.email, 
        senha_hash=hashed_password
    )
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    return novo_usuario


# ✅ ROTA DE LOGIN (JÁ EXISTENTE, MAS RENOMEADA PARA /login)
@router.post("/login", response_model=Token)
def login_para_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    
    if not user or not security.verificar_senha(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.criar_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}