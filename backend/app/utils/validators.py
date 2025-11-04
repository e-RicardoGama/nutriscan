# ✅ CRIAR VALIDADOR DE SENHA
# app/utils/validators.py (NOVO ARQUIVO)

import re
from typing import Tuple

def validar_senha(senha: str) -> Tuple[bool, str]:
    """
    Valida força da senha.
    
    Requisitos:
    - Mínimo 8 caracteres
    - Máximo 72 caracteres (limite bcrypt)
    - Pelo menos 1 letra maiúscula
    - Pelo menos 1 letra minúscula
    - Pelo menos 1 número
    - Pelo menos 1 caractere especial
    
    Returns:
        Tuple[bool, str]: (é_válida, mensagem_erro)
    """
    if len(senha) < 8:
        return False, "Senha deve ter no mínimo 8 caracteres"
    
    if len(senha.encode('utf-8')) > 72:
        return False, "Senha muito longa (máximo 72 bytes UTF-8)"
    
    if not re.search(r"[A-Z]", senha):
        return False, "Senha deve conter pelo menos uma letra maiúscula"
    
    if not re.search(r"[a-z]", senha):
        return False, "Senha deve conter pelo menos uma letra minúscula"
    
    if not re.search(r"\d", senha):
        return False, "Senha deve conter pelo menos um número"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", senha):
        return False, "Senha deve conter pelo menos um caractere especial"
    
    return True, "Senha válida"
