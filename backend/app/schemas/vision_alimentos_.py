# app/schemas/vision_alimentos_.py
# VERSÃO CORRIGIDA E OTIMIZADA

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import enum

# Enum RefeicaoStatus
try:
    from app.models.refeicoes import RefeicaoStatus
except:
    class RefeicaoStatus(str, enum.Enum):
        PENDING_ANALYSIS = "pending_analysis"
        ANALYSIS_COMPLETE = "analysis_complete"
        ANALYSIS_FAILED = "analysis_failed"


# ---------------------------------------------------------------
# SCAN RÁPIDO
# ---------------------------------------------------------------

class ScanRapidoAlimento(BaseModel):
    nome: str
    categoria: str
    quantidade_estimada_g: float
    confianca: str
    calorias_estimadas: float
    medida_caseira_sugerida: Optional[str] = None

class ScanRapidoResultado(BaseModel):
    modalidade: Optional[str] = None
    alimentos_extraidos: Optional[List[ScanRapidoAlimento]] = None
    resumo_nutricional: Optional[Dict[str, Any]] = None
    alertas: Optional[List[str]] = None
    erro: Optional[str] = None

class ScanRapidoResponse(BaseModel):
    status: str
    modalidade: str
    resultado: Dict[str, Any]   # CORRIGIDO: antes era ScanRapidoResultado
    timestamp: str

    class Config:
        from_attributes = True


# ---------------------------------------------------------------
# ANÁLISE DETALHADA
# ---------------------------------------------------------------

class AlimentoDetalhado(BaseModel):
    nome: str
    quantidade_gramas: float
    metodo_preparo: str
    medida_caseira_sugerida: Optional[str] = None

class DetalhesPrato(BaseModel):
    alimentos: List[AlimentoDetalhado]

class Macronutrientes(BaseModel):
    proteinas_g: float
    carboidratos_g: float
    gorduras_g: float

class AnaliseNutricional(BaseModel):
    calorias_totais: float
    macronutrientes: Macronutrientes
    vitaminas: Optional[List[str]] = None
    minerais: Optional[List[str]] = None

class Recomendacoes(BaseModel):
    pontos_positivos: List[str]
    sugestoes_balanceamento: List[str]
    alternativas_saudaveis: List[str]

class AnaliseCompletaResponse(BaseModel):
    detalhes_prato: DetalhesPrato
    analise_nutricional: AnaliseNutricional
    recomendacoes: Recomendacoes
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True


# ---------------------------------------------------------------
# SALVAR SCAN EDITADO
# ---------------------------------------------------------------

class AlimentoSalvoBase(BaseModel):
    nome: str
    quantidade_estimada_g: float
    categoria_nutricional: Optional[str] = None
    confianca: Optional[str] = None
    calorias_estimadas: Optional[float] = None
    medida_caseira_sugerida: Optional[str] = None

class AlimentoSalvoCreate(AlimentoSalvoBase):
    pass

class RefeicaoSalvaCreate(BaseModel):   # DEFINIÇÃO CORRETA, ÚNICA
    alimentos: List[AlimentoSalvoCreate]
    imagem_url: Optional[str] = None


class RefeicaoSalvaIdResponse(BaseModel):
    meal_id: int


# ---------------------------------------------------------------
# HISTÓRICO / LISTA DE HOJE
# ---------------------------------------------------------------

class RefeicaoHistoricoItem(BaseModel):
    id: int
    data_criacao: datetime = Field(..., alias="created_at")
    imagem_url: Optional[str] = None
    total_calorias: Optional[float] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class ResumoDiarioResponse(BaseModel):
    total_calorias: float
    total_proteinas_g: float
    total_carboidratos_g: float
    total_gorduras_g: float

class RefeicaoResumoHoje(BaseModel):
    id: int
    tipo: Optional[str] = None
    kcal_estimadas: Optional[float] = None
    imagem_url: Optional[str] = None
    proteinas_g: Optional[float] = None
    carboidratos_g: Optional[float] = None
    gorduras_g: Optional[float] = None
    suggested_name: Optional[str] = None
    alimentos_principais: Optional[List[str]] = None

    class Config:
        from_attributes = True
