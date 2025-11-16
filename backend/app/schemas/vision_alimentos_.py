# app/schemas/vision_alimentos_.py - DEFINIÇÕES FALTANTES ADICIONADAS

from pydantic import BaseModel, Field 
from typing import Optional, List,Dict, Any
from datetime import datetime 
import enum 

# Importa o Enum do models (ajuste o caminho se necessário)
# Assumindo models/refeicoes.py para RefeicaoStatus
try:
    # Tenta importar do local correto agora
    from app.models.refeicoes import RefeicaoStatus 
except ImportError:
    # Fallback caso a importação falhe 
    class RefeicaoStatus(str, enum.Enum): # type: ignore
        PENDING_ANALYSIS = "pending_analysis"
        ANALYSIS_COMPLETE = "analysis_complete"
        ANALYSIS_FAILED = "analysis_failed"


# ---------------------------------------------------------------
# ✅ SCHEMAS PARA SCAN RÁPIDO (Estavam faltando!)
# ---------------------------------------------------------------

class ScanRapidoAlimento(BaseModel):
    nome: str
    categoria: str # Categoria nutricional
    quantidade_estimada_g: float # Usar float é mais flexível
    confianca: str # ('alta'|'media'|'baixa'|'corrigido') - Validar no endpoint se necessário
    calorias_estimadas: float # Usar float
    medida_caseira_sugerida: Optional[str] = None
    # Campo adicionado dinamicamente no backend, não precisa estar no schema base
    # originCategory: Optional[str] = None 

class ScanRapidoResultado(BaseModel):
    modalidade: Optional[str] = None
    alimentos_extraidos: Optional[List[ScanRapidoAlimento]] = None
    resumo_nutricional: Optional[dict] = None # Manter como dict genérico ou criar schema específico
    alertas: Optional[List[str]] = None
    erro: Optional[str] = None

# ✅ Definição de ScanRapidoResponse que estava faltando
class ScanRapidoResponse(BaseModel):
    status: str
    modalidade: str
    resultado: ScanRapidoResultado
    timestamp: str # Ou datetime, dependendo de como você formata

    class Config:
        from_attributes = True

# ---------------------------------------------------------------
# SCHEMAS EXISTENTES (Análise Detalhada, AlimentoPublic, etc.)
# ---------------------------------------------------------------

class AlimentoDetalhado(BaseModel):
    nome: str
    quantidade_gramas: float
    metodo_preparo: str
    medida_caseira_sugerida: Optional[str] = None
    categoria: Optional[str] = None 

class DetalhesPrato(BaseModel):
    alimentos: List[AlimentoDetalhado]

class Macronutrientes(BaseModel):
    proteinas_g: float
    carboidratos_g: float
    gorduras_g: float

class AnaliseNutricional(BaseModel):
    calorias_totais: float # Mantido int conforme original
    macronutrientes: Macronutrientes
    vitaminas: Optional[List[str]] = None
    minerais: Optional[List[str]] = None
    vitaminas_minerais: Optional[List[str]] = None

class Recomendacoes(BaseModel):
    pontos_positivos: List[str]
    sugestoes_balanceamento: List[str]
    alternativas_saudaveis: List[str]

class AnaliseCompletaResponse(BaseModel):
    # ✅ CORREÇÃO AQUI: Mudar de Dict[str, Any] para o schema DetalhesPrato
    detalhes_prato: DetalhesPrato
    analise_nutricional: AnaliseNutricional
    # ✅ CORREÇÃO AQUI: Mudar de Dict[str, Any] para o schema Recomendacoes
    recomendacoes: Recomendacoes
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

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
        from_attributes = True

class AlimentoReconhecido(BaseModel):
    # (Mantido como no seu arquivo original)
    alimento: str
    quantidade_estimada_g: float
    justificativa_ia: str
    energia_kcal: float
    proteina_g: float
    carboidrato_g: float
    fonte_dados: str

class AlimentoNaoReconhecido(BaseModel):
    # (Mantido como no seu arquivo original)
    nome_sugerido_ia: str
    quantidade_estimada_g: float

# ---------------------------------------------------------------
# NOVOS SCHEMAS (Para Salvar Refeição Editada)
# ---------------------------------------------------------------

class AlimentoSalvoBase(BaseModel):
    nome: str = Field(..., example="Arroz branco cozido")
    quantidade_estimada_g: float = Field(..., example=150.0)
    categoria_nutricional: Optional[str] = Field(None, example="Grão")
    confianca: Optional[str] = Field(None, example="alta")

    # 🔹 CORRIGIDO: Usar 'calorias_estimadas' aqui
    calorias_estimadas: Optional[float] = Field(None, example=195.0) 

    medida_caseira_sugerida: Optional[str] = Field(None, example="1 xícara")

class AlimentoSalvoCreate(AlimentoSalvoBase):
    pass # Herda de AlimentoSalvoBase


class AlimentoSalvo(AlimentoSalvoBase):
    id: int
    refeicao_id: int
    class Config: from_attributes = True 

class RefeicaoSalvaBase(BaseModel):
    status: RefeicaoStatus = RefeicaoStatus.PENDING_ANALYSIS
    imagem_url: Optional[str] = None

class RefeicaoSalvaCreate(RefeicaoSalvaBase):
    alimentos: List[AlimentoSalvoCreate] 

class RefeicaoSalvaCreate(BaseModel):
    alimentos: List[AlimentoSalvoCreate]
    imagem_url: Optional[str] = None  # ✅ DEVE EXISTIR


class RefeicaoSalva(RefeicaoSalvaBase):
    id: int
    owner_id: int 
    created_at: datetime
    updated_at: Optional[datetime] = None 
    alimentos: List[AlimentoSalvo] = [] 
    class Config: from_attributes = True 

class RefeicaoSalvaIdResponse(BaseModel):
    meal_id: int 


# ---------------------------------------------------------------
# ✅ NOVOS SCHEMAS (Para Endpoints de Histórico)
# ---------------------------------------------------------------

class RefeicaoHistoricoItem(BaseModel):
    """
    Schema resumido para cada item da lista de histórico.
    Usado pelo endpoint: GET /api/v1/refeicoes/historico
    """
    id: int
    data_criacao: datetime = Field(..., alias="created_at") # Mapeia 'created_at' para 'data_criacao'
    imagem_url: Optional[str] = None
    total_calorias: Optional[float] = Field(None, description="Total de calorias da análise detalhada, se disponível")

    class Config:
        from_attributes = True
        populate_by_name = True # Permite o uso de 'alias'

class ResumoDiarioResponse(BaseModel):
    """
    Schema da resposta para o resumo diário do dashboard.
    Usado pelo endpoint: GET /api/v1/refeicoes/resumo-diario
    """
    total_calorias: float
    total_proteinas_g: float  # <-- Adicionado _g
    total_carboidratos_g: float # <-- Adicionado _g
    total_gorduras_g: float # <-- Adicionado _g

    class Config:
        from_attributes = True

class RefeicaoResumoHoje(BaseModel):
    """
    Schema para cada refeição exibida no dashboard de hoje.
    Inclui dados enriquecidos da análise.
    """
    id: int
    tipo: Optional[str] = None  # Categoria da refeição (Café, Almoço, etc.)
    kcal_estimadas: Optional[float] = None  # Total de calorias
    imagem_url: Optional[str] = None
    
    # Macronutrientes (extraídos da análise)
    proteinas_g: Optional[float] = None
    carboidratos_g: Optional[float] = None
    gorduras_g: Optional[float] = None
    
    # Nome sugerido (gerado pela IA ou lista de alimentos)
    suggested_name: Optional[str] = None
    
    # Lista de alimentos principais (para gerar nome se necessário)
    alimentos_principais: Optional[List[str]] = None

    class Config:
        from_attributes = True