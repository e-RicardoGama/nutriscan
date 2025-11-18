// Interfaces completas e consolidadas
export interface AnaliseCompletaResponse {
  id?: number;
  usuario_id?: number;
  imagem_url?: string | null;
  data_criacao?: string;
  total_calorias?: number | null;
  total_proteinas?: number | null;
  total_carboidratos?: number | null;
  total_gorduras?: number | null;
  alimentos?: AlimentoDetectado[];
  detalhes_prato: { alimentos: AlimentoDetalhado[] };
  analise_nutricional: AnaliseNutricional;
  recomendacoes: Recomendacoes;
  timestamp?: string;
}

// Alimento detectado (para histórico)
export interface AlimentoDetectado {
  id: number;
  nome: string;
  quantidade_estimada: string | null;
  calorias: number | null;
  proteinas: number | null;
  carboidratos: number | null;
  gorduras: number | null;
  confianca: number | null;
}

// Alimento detalhado (para análise completa)
export interface AlimentoDetalhado {
  nome: string;
  quantidade_gramas: number;
  metodo_preparo: string;
  medida_caseira_sugerida?: string;
}

export interface Macronutrientes {
  proteinas_g: number;
  carboidratos_g: number;
  gorduras_g: number;
}

export interface AnaliseNutricional {
  calorias_totais: number;
  macronutrientes: Macronutrientes;
  vitaminas_minerais?: string[];
  vitaminas?: string[];
  minerais?: string[];
}

export interface Recomendacoes {
  pontos_positivos: string[];
  sugestoes_balanceamento: string[];
  alternativas_saudaveis: string[];
}

// Interfaces do Scan Rápido
export interface ScanRapidoAlimento {
  nome: string;
  quantidade_estimada_g: number;
  calorias_estimadas: number;
  confianca: 'alta' | 'media' | 'baixa' | 'corrigido';
  categoria?: string;
  medida_caseira_sugerida?: string;
}

export interface ScanRapidoResultado {
  modalidade?: string;
  alimentos_extraidos?: ScanRapidoAlimento[];
  resumo_nutricional?: {
    total_calorias: number;
    total_proteinas_g: number;
    total_carboidratos_g: number;
    total_gorduras_g: number;
  };
  alertas?: string[];
  erro?: string;
}

export interface ScanRapidoResponse {
  status: string; // Obrigatório agora
  modalidade?: string;
  timestamp?: string;
  resultado: {
    modalidade?: string;
    alimentos_extraidos: ScanRapidoAlimento[];
    resumo_nutricional?: {
      total_calorias: number;
      total_proteinas_g: number;
      total_carboidratos_g: number;
      total_gorduras_g: number;
    };
    alertas?: string[];
    erro?: string;
  };
}

// Interface para food_database.json
export interface FoodDatabaseItem {
  alimento: string;
  un_medida_caseira: string;
  peso_aproximado_g: number;
  energia_kcal_100g: number;
  proteina_g_100g: number;
  carboidrato_g_100g: number;
  lipidios_g_100g: number;
}

// Interface para o modal de edição
export interface ModalAlimentoData {
  nome: string;
  peso_g: number;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  categoria?: string; // ← Mude para opcional adicionando "?"
  confianca: 'alta' | 'media' | 'baixa' | 'corrigido';
  medida_caseira_sugerida?: string;
  quantidade_estimada_g?: number;
  calorias_estimadas?: number;
}