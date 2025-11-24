# app/routers/auth.py - VERSÃO CORRIGIDA E COMPLETA

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func # ✅ IMPORTAÇÃO ADICIONADA: Para func.now()

# Importações dos seus schemas
from app.schemas.login import UserPublic, UserCreate, Token
from app.schemas.registro import UserRegister, UserResponse

# Importações dos schemas de redefinição de senha
from app.schemas.redefinicao_senha import (
    SolicitarRedefinicao,
    TokenRedefinicaoResponse, # Embora não usado diretamente nas rotas, é bom ter
    RedefinirSenha,
    RedefinicaoConcluida
)

# Importações do banco, modelos e segurança
from app.database import get_db
from app.models.usuario import Usuario, TokenRedefinicaoSenha # ✅ TokenRedefinicaoSenha importado
from app import security
from app.security import ( # ✅ Importações específicas para redefinição de senha
    criar_token_redefinicao,
    validar_token_redefinicao,
    gerar_hash_senha # Já existe em app.security, mas para clareza
)
from app.utils.validators import validar_senha
from app.utils.email_sender import enviar_email_redefinicao # ✅ Importação única


router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)

# ✅ CORREÇÃO: Remover 'async' pois operações no banco são síncronas
def get_user_by_email(email: str, db: Session):
    return db.query(Usuario).filter(Usuario.email == email).first()

@router.post("/registrar", response_model=UserResponse)
def registrar(usuario: UserRegister, db: Session = Depends(get_db)):
    # ✅ VALIDAR SENHA
    senha_valida, mensagem = validar_senha(usuario.password)
    if not senha_valida:
        raise HTTPException(status_code=400, detail=mensagem)

    # Verificar se usuário já existe
    db_user = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já registrado")

    hashed_password = security.gerar_hash_senha(usuario.password)
    novo_usuario = Usuario(
        nome=usuario.nome,
        apelido=usuario.apelido,
        email=usuario.email,
        senha_hash=hashed_password,
        data_nascimento=usuario.data_nascimento,
        cep=usuario.cep,
        # ✅ NOVAS COLUNAS DETALHADAS PARA ENDEREÇO
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


# ✅ ROTA DE LOGIN (CORRIGIDA E COMPLETA)
@router.post("/login", response_model=Token)
def login_para_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Validar comprimento da senha antes da verificação
    if len(form_data.password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=400,
            detail="Senha muito longa. Use no máximo 72 caracteres."
        )

    user = get_user_by_email(form_data.username, db)

    print(f"🔐 [LOGIN DEBUG] Usuário encontrado: {bool(user)}")

    if not user or not security.verificar_senha(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais incorretas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = security.criar_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# Rotas de Redefinição de Senha - ✅ AGORA DEPOIS DA DEFINIÇÃO DO ROUTER
@router.post("/esqueci-senha", response_model=dict)
def solicitar_redefinicao_senha(
    request: SolicitarRedefinicao,
    db: Session = Depends(get_db)
):
    """
    Solicita redefinição de senha. Envia email com link de redefinição.
    """
    # Buscar usuário pelo email
    usuario = get_user_by_email(request.email, db)
    if not usuario:
        # Não revelar se o email existe ou não (segurança)
        return {
            "mensagem": "Se o email estiver registrado, você receberá instruções para redefinir sua senha."
        }

    try:
        # Gerar token de redefinição
        token = criar_token_redefinicao(usuario, db, expiracao_horas=1)

        FRONTEND_URL = "http://localhost:3000"

        link_redefinicao = f"http://localhost:3000/redefinir-senha?token={token}"

        enviar_email_redefinicao(request.email, link_redefinicao)

        return {
            "mensagem": "Se o email estiver registrado, você receberá instruções para redefinir sua senha.",
            "debug_token": token  # ❌ REMOVER EM PRODUÇÃO
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro interno ao processar solicitação"
        )

@router.post("/redefinir-senha", response_model=RedefinicaoConcluida)
def redefinir_senha(
    request: RedefinirSenha,
    db: Session = Depends(get_db)
):
    """
    Redefine a senha do usuário usando um token válido.
    """
    # Validar se as senhas coincidem
    if request.nova_senha != request.confirmar_senha:
        raise HTTPException(
            status_code=400,
            detail="As senhas não coincidem"
        )

    # Validar força da nova senha
    senha_valida, mensagem = validar_senha(request.nova_senha)
    if not senha_valida:
        raise HTTPException(status_code=400, detail=mensagem)

    # Validar token e obter usuário
    usuario = validar_token_redefinicao(request.token, db)
    if not usuario:
        raise HTTPException(
            status_code=400,
            detail="Token inválido ou expirado. Solicite uma nova redefinição."
        )

    try:
        # Atualizar senha
        usuario.senha_hash = gerar_hash_senha(request.nova_senha)
        # Verifica se o campo updated_at existe no modelo Usuario antes de tentar atualizá-lo
        if hasattr(usuario, 'updated_at'):
            usuario.updated_at = func.now()
        else:
            print("⚠️ Aviso: Campo 'updated_at' não encontrado no modelo Usuario. Não foi atualizado.")

        db.commit()
        db.refresh(usuario)

        return RedefinicaoConcluida(email=usuario.email)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao redefinir senha"
        )
