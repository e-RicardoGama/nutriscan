# arquivo: app/routers/conversoes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import unicodedata
import re

from app.database import get_db
from app.models.alimentos import Alimento

# --- Setup do Router ---
router = APIRouter(
    prefix="/conversoes",
    tags=["Conversões de Medidas"]
)

# --- Schema de Resposta ---
class ConversaoResponse(BaseModel):
    medida_sugerida: str | None

# --- Schema para a nova rota ---
class GramasResponse(BaseModel):
    gramas_calculadas: float | None

# --- Função Auxiliar ---
def normalizar_texto(texto: str) -> str:
    if not texto: return ""
    texto_sem_acentos = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')
    return re.sub(r'[^a-zA-Z\s]', '', texto_sem_acentos).lower()

# --- O Endpoint com a Lógica de Busca por Palavras-Chave (Definitiva) ---
@router.get("/gramas-para-caseira", response_model=ConversaoResponse)
def converter_gramas_para_medida_caseira(
    alimento_nome: str,
    gramas: float,
    db: Session = Depends(get_db)
):
    if not alimento_nome:
        raise HTTPException(status_code=400, detail="O nome do alimento não pode ser vazio.")

    # 1. Normaliza a busca do usuário e a quebra em palavras-chave
    busca_normalizada = normalizar_texto(alimento_nome)
    palavras_chave_busca = busca_normalizada.split()
    
    # 2. Carrega todos os alimentos do banco de dados
    todos_alimentos = db.query(Alimento).all()

    # 3. Filtragem por Palavras-Chave
    candidatos_encontrados = []
    for alimento in todos_alimentos:
        alimento_normalizado_db = normalizar_texto(alimento.alimentos)
        # Verifica se TODAS as palavras-chave da busca estão presentes no nome do alimento
        if all(palavra in alimento_normalizado_db for palavra in palavras_chave_busca):
            candidatos_encontrados.append(alimento)

    print(f"LOG 3: {len(candidatos_encontrados)} candidatos encontrados após a filtragem em Python.")
    
    if not candidatos_encontrados:
        return {"medida_sugerida": None}
    

    # 4. Desempate Inteligente (o mesmo de antes, que já era bom)
    def chave_de_ordenacao(alimento):
        alimento_normalizado = normalizar_texto(alimento.alimentos)
        prioridade = 0 if alimento_normalizado.startswith(busca_normalizada.split()[0]) else 1
        comprimento = len(alimento.alimentos)
        return (prioridade, comprimento)

    melhor_alimento = min(candidatos_encontrados, key=chave_de_ordenacao)
    print(f"LOG 5: Melhor alimento selecionado: '{melhor_alimento.alimentos}'")

    # --- Validações e Cálculo ---
    if not melhor_alimento.peso_aproximado_g or melhor_alimento.peso_aproximado_g == 0 or not melhor_alimento.un_medida_caseira:
        return {"medida_sugerida": None}

    proporcao = gramas / melhor_alimento.peso_aproximado_g
    medida = melhor_alimento.un_medida_caseira.replace(" cheia", "")
    sugestao = f"{proporcao:.1f} {medida}"
    
    return {"medida_sugerida": sugestao}

@router.get("/caseira-para-gramas", response_model=GramasResponse)
def converter_caseira_para_gramas(
    alimento_nome: str,
    quantidade_caseira: float,
    db: Session = Depends(get_db)
):
    """
    Converte uma medida caseira (ex: 1.5 escumadeira) para a sua quantidade em gramas.
    """
    # A lógica de busca do melhor alimento é a mesma da função anterior
    busca_normalizada = normalizar_texto(alimento_nome)
    todos_alimentos = db.query(Alimento).all()

    candidatos_encontrados = []
    for alimento in todos_alimentos:
        alimento_normalizado_db = normalizar_texto(alimento.alimentos)
        if all(palavra in alimento_normalizado_db for palavra in busca_normalizada.split()):
            candidatos_encontrados.append(alimento)
    
    if not candidatos_encontrados:
        return {"gramas_calculadas": None}

    def chave_de_ordenacao(alimento):
        # ... (a função chave_de_ordenacao continua a mesma)
        alimento_normalizado = normalizar_texto(alimento.alimentos)
        prioridade = 0 if alimento_normalizado.startswith(busca_normalizada.split()[0]) else 1
        comprimento = len(alimento.alimentos)
        return (prioridade, comprimento)

    melhor_alimento = min(candidatos_encontrados, key=chave_de_ordenacao)

    # Validações
    if not melhor_alimento.peso_aproximado_g or melhor_alimento.peso_aproximado_g == 0:
        return {"gramas_calculadas": None}

    # --- A Lógica da Conversão Inversa ---
    gramas_finais = quantidade_caseira * melhor_alimento.peso_aproximado_g

    return {"gramas_calculadas": gramas_finais}
