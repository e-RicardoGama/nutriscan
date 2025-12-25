# app/schemas/vision_alimentos_.py
# VERSÃO CORRIGIDA E OTIMIZADA

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import enum

# Enum RefeicaoStatus
try:
    from app.models.refeicoes import RefeicaoStatus
except ImportError: # Usar ImportError para módulos, não exceções genéricas
    class RefeicaoStatus(str, enum.Enum):
        PENDING_ANALYSIS = "pending_analysis"
        ANALYSIS_COMPLETE = "analysis_complete"
        ANALYSIS_FAILED = "analysis_failed"

# ---------------------------------------------------------------
# SCHEMAS BASE (MOVIDOS PARA CIMA PARA SEREM USADOS ANTES)
# ---------------------------------------------------------------

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
# SCAN RÁPIDO
# ---------------------------------------------------------------

class ScanRapidoAlimento(BaseModel):
    nome: str
    categoria: str = "Não classificado"  # Se a IA não enviar, assume esse texto
    quantidade_estimada_g: float = 0.0    # Se a IA não enviar, assume 0.0
    confianca: str = "baixa"              # Valor padrão de segurança
    calorias_estimadas: float = 0.0       # Valor padrão de segurança
    medida_caseira_sugerida: Optional[str] = None

class ScanRapidoResultado(BaseModel):
    modalidade: Optional[str] = None
    alimentos_extraidos: List[ScanRapidoAlimento] = Field(default_factory=list, description="Lista de alimentos extraídos") # ✅ CORRIGIDO: default_factory para lista vazia
    resumo_nutricional: ResumoNutricional = Field(default_factory=ResumoNutricional, description="Resumo nutricional do scan") # ✅ CORRIGIDO: Usando ResumoNutricional e default_factory
    alertas: List[str] = Field(default_factory=list, description="Alertas ou observações") # ✅ CORRIGIDO: default_factory para lista vazia
    erro: Optional[str] = None

class ScanRapidoResponse(BaseModel):
    status: str
    modalidade: str
    resultado: ScanRapidoResultado = Field(description="Detalhes do resultado do scan") # ✅ CORRIGIDO: Usando ScanRapidoResultado
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
    alimentos: List[AlimentoDetalhado] = Field(default_factory=list) # Adicionado default_factory

class Macronutrientes(BaseModel):
    proteinas_g: float = Field(default=0.0) # Adicionado default
    carboidratos_g: float = Field(default=0.0) # Adicionado default
    gorduras_g: float = Field(default=0.0) # Adicionado default

class AnaliseNutricional(BaseModel):
    calorias_totais: float = Field(default=0.0) # Adicionado default
    macronutrientes: Macronutrientes = Field(default_factory=Macronutrientes) # Adicionado default_factory
    vitaminas: List[str] = Field(default_factory=list) # Adicionado default_factory
    minerais: List[str] = Field(default_factory=list) # Adicionado default_factory

class Recomendacoes(BaseModel):
    pontos_positivos: List[str] = Field(default_factory=list) # Adicionado default_factory
    sugestoes_balanceamento: List[str] = Field(default_factory=list) # Adicionado default_factory
    alternativas_saudaveis: List[str] = Field(default_factory=list) # Adicionado default_factory

class AnaliseCompletaResponse(BaseModel):
    detalhes_prato: DetalhesPrato = Field(default_factory=DetalhesPrato) # Adicionado default_factory
    analise_nutricional: AnaliseNutricional = Field(default_factory=AnaliseNutricional) # Adicionado default_factory
    recomendacoes: Recomendacoes = Field(default_factory=Recomendacoes) # Adicionado default_factory
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
    total_calorias: float = Field(default=0.0) # Adicionado default
    total_proteinas_g: float = Field(default=0.0) # Adicionado default
    total_carboidratos_g: float = Field(default=0.0) # Adicionado default
    total_gorduras_g: float = Field(default=0.0) # Adicionado default

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
