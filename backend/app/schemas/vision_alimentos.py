# app/schemas/vision_alimentos.py

from pydantic import BaseModel
from typing import Optional, List

# ---------------------------------------------------------------
# SCHEMAS PARA A ANÁLISE DETALHADA (ENDPOINT: /analisar-imagem-detalhado)
# ---------------------------------------------------------------

class AlimentoDetalhado(BaseModel):
    nome: str
    quantidade_gramas: float  # Usar float é mais seguro para a resposta da IA
    metodo_preparo: str

class DetalhesPrato(BaseModel):
    alimentos: List[AlimentoDetalhado]

class Macronutrientes(BaseModel):
    proteinas_g: float
    carboidratos_g: float
    gorduras_g: float

class AnaliseNutricional(BaseModel):
    calorias_totais: int
    macronutrientes: Macronutrientes
    vitaminas_minerais: List[str]

class Recomendacoes(BaseModel):
    pontos_positivos: List[str]
    sugestoes_balanceamento: List[str]
    alternativas_saudaveis: List[str]

# ESTA É A DEFINIÇÃO CORRETA E ÚNICA PARA A ANÁLISE COMPLETA
class AnaliseCompletaResponse(BaseModel):
    detalhes_prato: DetalhesPrato
    analise_nutricional: AnaliseNutricional
    recomendacoes: Recomendacoes

# ---------------------------------------------------------------
# OUTROS SCHEMAS (para outras funcionalidades da sua API)
# ---------------------------------------------------------------

class AlimentoPublic(BaseModel):
    id: int
    alimento: str
    categoria: str
    un_medida_caseira: Optional[str] = None
    peso_aproximado_g: Optional[float] = None
    energia_kcal_100g: Optional[float] = None
    proteina_g_100g: Optional[float] = None
    carboidrato_g_100g: Optional[float] = None

    class Config:
        from_attributes = True # Em versões mais novas do Pydantic, use `orm_mode = True`

class AlimentoReconhecido(BaseModel):
    alimento: str
    quantidade_estimada_g: int
    justificativa_ia: str
    energia_kcal: float
    proteina_g: float
    carboidrato_g: float
    fonte_dados: str

class AlimentoNaoReconhecido(BaseModel):
    nome_sugerido_ia: str
    quantidade_estimada_g: int

# RENOMEADO PARA NÃO CAUSAR CONFLITO
class AnaliseSimplesResponse(BaseModel):
    reconhecidos: List[AlimentoReconhecido]
    nao_reconhecidos: List[AlimentoNaoReconhecido]


class AlimentoPayload(BaseModel):
    nome: str
    quantidade_gramas: float # Ou int

class AnaliseListaPayload(BaseModel):
    alimentos: List[AlimentoPayload]

class AlimentoDetalhadoResponse(BaseModel):
    nome: str
    quantidade_gramas: float
    metodo_preparo: str = "N/A" # Default se não puder determinar

class MacronutrientesResponse(BaseModel):
    proteinas_g: float
    carboidratos_g: float
    gorduras_g: float

class RecomendacoesResponse(BaseModel):
    pontos_positivos: List[str] = []
    sugestoes_balanceamento: List[str] = []
    alternativas_saudaveis: List[str] = []
