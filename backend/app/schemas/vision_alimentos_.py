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
    resumo_nutricional: Optional[Dict[str, Any]] = None # <-- AQUI ESTÁ O PROBLEMA PRINCIPAL
    alertas: Optional[List[str]] = None
    erro: Optional[str] = None

class ScanRapidoResponse(BaseModel):
    status: str
    modalidade: str
    resultado: Dict[str, Any]   # <-- E AQUI, não usa ScanRapidoResultado
    timestamp: str

class ScanRapidoResponse(BaseModel):
    sucesso: bool = Field(description="Indica se a operação foi bem-sucedida")
    erro: Optional[str] = Field(default=None, description="Mensagem de erro, se houver")
    bloqueada: bool = Field(default=False, description="Indica se a requisição foi bloqueada por segurança")
    status: str = Field(description="Status da operação (ex: 'processando', 'concluido')")
    modalidade: str = Field(description="Modalidade do scan (ex: 'rapido')")
    resultado: ScanRapidoResultado = Field(description="Detalhes do resultado do scan") # <-- AGORA USA O SCHEMA DETALHADO
    timestamp: str = Field(description="Timestamp da resposta")

    class Config:
        from_attributes = True

class ScanRapidoResponse(BaseModel):
    status: str
    modalidade: str
    resultado: Dict[str, Any]   # CORRIGIDO: antes era ScanRapidoResultado
    timestamp: str

    class Config:
        from_attributes = True

# Define a estrutura esperada para os macronutrientes estimados
class MacronutrientesEstimados(BaseModel):
    total_proteinas_g: float = Field(default=0.0, description="Total de proteínas em gramas")
    total_carboidratos_g: float = Field(default=0.0, description="Total de carboidratos em gramas")
    total_gorduras_g: float = Field(default=0.0, description="Total de gorduras em gramas")

# Define a estrutura esperada para o resumo nutricional
class ResumoNutricional(BaseModel):
    total_calorias: float = Field(default=0.0, description="Total de calorias estimadas")
    macronutrientes_estimados: MacronutrientesEstimados = Field(default_factory=MacronutrientesEstimados, description="Macronutrientes estimados")
    vitaminas_minerais_estimados: List[str] = Field(default_factory=list, description="Lista de vitaminas e minerais estimados")


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


# ---------------------------------------------------------------
# ANALISE COMPLETA – O SCHEMA DE RESPOSTA FINAL
# ---------------------------------------------------------------

class AlimentoPublic(BaseModel):
    id: int
    alimento: str
    alimento_normalizado: str
    categoria: str
    energia_kcal_100g: Optional[float] = None
    proteina_g_100g: Optional[float] = None
    carboidrato_g_100g: Optional[float] = None
    lipidios_g_100g: Optional[float] = None
    fibra_g_100g: Optional[float] = None
    medida_caseira_unidade: Optional[str] = None
    medida_caseira_gramas_por_unidade: Optional[float] = None

    class Config:
        from_attributes = True # ou orm_mode = True para Pydantic v1