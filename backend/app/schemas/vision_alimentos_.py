# app/schemas/vision_alimentos_.py
# VERSÃO CORRIGIDA E COMPLETA - SEM IMPORT CIRCULAR

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import enum

# ---------------------------------------------------------------
# ENUMS LOCAIS (EVITA IMPORT CIRCULAR)
# ---------------------------------------------------------------

class RefeicaoStatus(str, enum.Enum):
    PENDING_ANALYSIS = "pending_analysis"
    ANALYSIS_COMPLETE = "analysis_complete"
    ANALYSIS_FAILED = "analysis_failed"

# ---------------------------------------------------------------
# SCHEMAS BASE
# ---------------------------------------------------------------

class AlimentoExtraido(BaseModel):
    nome: str
    quantidade_estimada_g: Optional[float] = None
    categoria: Optional[str] = None
    confianca: Optional[str] = None
    calorias_estimadas: Optional[float] = None
    medida_caseira_sugerida: Optional[str] = None

class MacronutrientesEstimados(BaseModel):
    total_proteinas_g: float = Field(default=0.0, description="Total de proteínas em gramas")
    total_carboidratos_g: float = Field(default=0.0, description="Total de carboidratos em gramas")
    total_gorduras_g: float = Field(default=0.0, description="Total de gorduras em gramas")

class ResumoNutricional(BaseModel):
    total_calorias: float = Field(default=0.0, description="Total de calorias estimadas")
    macronutrientes_estimados: MacronutrientesEstimados = Field(
        default_factory=MacronutrientesEstimados,
        description="Macronutrientes estimados"
    )
    vitaminas_minerais_estimados: List[str] = Field(default_factory=list, description="Lista de vitaminas e minerais estimados")

# ---------------------------------------------------------------
# SCAN RÁPIDO
# ---------------------------------------------------------------

class ScanRapidoAlimento(BaseModel):
    nome: str = "Alimento"
    categoria: str = "Outros"
    quantidade_estimada_g: float = 0.0
    confianca: str = "baixa"
    calorias_estimadas: float = 0.0
    medida_caseira_sugerida: Optional[str] = None

class ScanRapidoResultado(BaseModel):
    modalidade: Optional[str] = None
    alimentos_extraidos: List[ScanRapidoAlimento] = Field(
        default_factory=list,
        description="Lista de alimentos extraídos"
    )
    resumo_nutricional: Optional[ResumoNutricional] = None
    alertas: List[str] = Field(
        default_factory=list,
        description="Alertas ou observações"
    )
    erro: Optional[str] = None

class ScanRapidoResponse(BaseModel):
    status: str
    modalidade: str
    resultado: ScanRapidoResultado = Field(
        description="Detalhes do resultado do scan"
    )
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
    alimentos: List[AlimentoDetalhado] = Field(default_factory=list)

class Macronutrientes(BaseModel):
    proteinas_g: float = Field(default=0.0)
    carboidratos_g: float = Field(default=0.0)
    gorduras_g: float = Field(default=0.0)

class AnaliseNutricional(BaseModel):
    calorias_totais: float = Field(default=0.0)
    macronutrientes: Macronutrientes = Field(default_factory=Macronutrientes)
    vitaminas: List[str] = Field(default_factory=list)
    minerais: List[str] = Field(default_factory=list)

class Recomendacoes(BaseModel):
    pontos_positivos: List[str] = Field(default_factory=list)
    sugestoes_balanceamento: List[str] = Field(default_factory=list)
    alternativas_saudaveis: List[str] = Field(default_factory=list)

class AnaliseCompletaResponse(BaseModel):
    detalhes_prato: DetalhesPrato = Field(default_factory=DetalhesPrato)
    analise_nutricional: AnaliseNutricional = Field(default_factory=AnaliseNutricional)
    recomendacoes: Recomendacoes = Field(default_factory=Recomendacoes)
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

class RefeicaoSalvaCreate(BaseModel):
    alimentos: List[AlimentoSalvoCreate]
    imagem_url: Optional[str] = None

class RefeicaoSalvaIdResponse(BaseModel):
    meal_id: int

# ---------------------------------------------------------------
# SCHEMAS DE RESPOSTA PARA CONSULTA
# ---------------------------------------------------------------

class AlimentoSalvoResponse(BaseModel):
    id: int
    nome: str
    quantidade_estimada_g: float
    categoria_nutricional: Optional[str] = None
    confianca: Optional[str] = None
    calorias_estimadas: Optional[float] = None
    medida_caseira_sugerida: Optional[str] = None
    alimento_id: Optional[int] = None

    class Config:
        from_attributes = True

class RefeicaoSalvaResponse(BaseModel):
    id: int
    owner_id: int
    status: RefeicaoStatus
    imagem_url: Optional[str] = None
    analysis_result_json: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    alimentos: List[AlimentoSalvoResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

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
    total_calorias: float = Field(default=0.0)
    total_proteinas_g: float = Field(default=0.0)
    total_carboidratos_g: float = Field(default=0.0)
    total_gorduras_g: float = Field(default=0.0)

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
        from_attributes = True
