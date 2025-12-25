# arquivo: app/routers/usuarios.py

# ✅ IMPORTAR 'Response'
from fastapi import APIRouter, Depends, Response 
from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.schemas.login import UserPublic
from app.security import get_current_user

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)

@router.get("/me", response_model=UserPublic)
def read_users_me(
    # ✅ INJETAR O OBJETO 'Response'
    response: Response,
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna os dados do usuário atualmente autenticado.
    O token JWT é lido do header Authorization e validado pela dependência get_current_user.
    """
    
    # ✅ ADICIONAR OS CABEÇALHOS ANTI-CACHE
    # Força o navegador a sempre verificar com o servidor (sem cache)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    return current_user