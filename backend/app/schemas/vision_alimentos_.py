# app/schemas/vision_alimentos_.py - DEFINIÇÕES FALTANTES ADICIONADAS

from pydantic import BaseModel, Field 
from typing import Optional, List
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
    vitaminas_minerais: List[str]

class Recomendacoes(BaseModel):
    pontos_positivos: List[str]
    sugestoes_balanceamento: List[str]
    alternativas_saudaveis: List[str]

class AnaliseCompletaResponse(BaseModel):
    detalhes_prato: DetalhesPrato
    analise_nutricional: AnaliseNutricional
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
    quantidade_estimada_g: int
    justificativa_ia: str
    energia_kcal: float
    proteina_g: float
    carboidrato_g: float
    fonte_dados: str

class AlimentoNaoReconhecido(BaseModel):
    # (Mantido como no seu arquivo original)
    nome_sugerido_ia: str
    quantidade_estimada_g: int

# ---------------------------------------------------------------
# NOVOS SCHEMAS (Para Salvar Refeição Editada)
# ---------------------------------------------------------------

class AlimentoSalvoBase(BaseModel):
    nome: str = Field(..., example="Arroz branco")
    quantidade_estimada_g: Optional[float] = Field(None, example=100.0) 
    categoria_nutricional: Optional[str] = Field(None, example="Grão") 
    confianca: Optional[str] = Field(None, example="corrigido") 
    calorias_estimadas: Optional[float] = Field(None, example=130.0) 
    medida_caseira_sugerida: Optional[str] = Field(None, example="4 colheres de sopa") 
    origin_category: Optional[str] = Field(None, example="Prato Principal") 

class AlimentoSalvoCreate(AlimentoSalvoBase):
    pass

class AlimentoSalvo(AlimentoSalvoBase):
    id: int
    refeicao_id: int
    class Config: from_attributes = True 

class RefeicaoSalvaBase(BaseModel):
    status: RefeicaoStatus = RefeicaoStatus.PENDING_ANALYSIS

class RefeicaoSalvaCreate(RefeicaoSalvaBase):
    alimentos: List[AlimentoSalvoCreate] 

class RefeicaoSalva(RefeicaoSalvaBase):
    id: int
    owner_id: int 
    created_at: datetime
    updated_at: Optional[datetime] = None 
    alimentos: List[AlimentoSalvo] = [] 
    class Config: from_attributes = True 

class RefeicaoSalvaIdResponse(BaseModel):
    meal_id: int 

