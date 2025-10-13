# arquivo: app/routers/usuarios.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.schemas.login import UserPublic
from app.security import get_current_user

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)

@router.get("/me", response_model=UserPublic)
def read_users_me(current_user: Usuario = Depends(get_current_user)):
    """
    Retorna os dados do usuário atualmente autenticado.
    O token JWT é lido do header Authorization e validado pela dependência get_current_user.
    """
    return current_user