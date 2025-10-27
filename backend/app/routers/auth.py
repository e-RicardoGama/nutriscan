# app/routers/auth.py - VERSÃO COMPLETA E CORRIGIDA

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Importações dos seus schemas
from app.schemas.login import UserPublic, UserCreate, Token
from app.schemas.registro import UserRegister, UserResponse

# Importações do banco, modelos e segurança
from app.database import get_db
from app.models.usuario import Usuario 
from app import security

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)

# ✅ CORREÇÃO: Remover 'async' pois operações no banco são síncronas
def get_user_by_email(email: str, db: Session):
    return db.query(Usuario).filter(Usuario.email == email).first()


# ✅ ROTA DE REGISTRO (CORRETA)
@router.post("/registrar", response_model=UserResponse)
def registrar(usuario: UserRegister, db: Session = Depends(get_db)):
    # Verificar se usuário já existe
    db_user = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já registrado")
    
    # ✅ CORREÇÃO: Usar ambos os campos
    hashed_password = security.gerar_hash_senha(usuario.password)
    novo_usuario = Usuario(
        nome=usuario.nome,        # ✅ Usar o nome do formulário
        apelido=usuario.apelido,  # ✅ Adicionar o apelido
        email=usuario.email, 
        senha_hash=hashed_password
    )
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    return novo_usuario


# ✅ ROTA DE LOGIN (CORRIGIDA E COMPLETA)
@router.post("/login", response_model=Token)
def login_para_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)  # ✅ CORREÇÃO: Adicionar dependência do banco
):
    # Validar comprimento da senha antes da verificação
    if len(form_data.password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=400,
            detail="Senha muito longa. Use no máximo 72 caracteres."
        )
    
    # ✅ CORREÇÃO: Passar o db para a função
    user = get_user_by_email(form_data.username, db)
    if not user or not security.verificar_senha(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais incorretas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # ✅ ADICIONAR: Criar token de acesso (implemente conforme sua lógica)
    access_token = security.criar_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }