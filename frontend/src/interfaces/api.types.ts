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
  categoria: string;
  confianca: 'alta' | 'media' | 'baixa' | 'corrigido';
  medida_caseira_sugerida?: string; // Adicionado para consistência
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
  status: string;
  modalidade: string;
  resultado: ScanRapidoResultado;
  timestamp: string;
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
  // Adicione as propriedades abaixo para que o modal e o handleSaveEdit funcionem corretamente
  quantidade_estimada_g: number; // Adicionado
  calorias_estimadas: number;   // Adicionado
  categoria: string;            // Adicionado
  confianca: 'alta' | 'media' | 'baixa' | 'corrigido'; // Adicionado
  peso_g: number;               // Adicionado (usado no modal para a quantidade em gramas)
  kcal: number;                 // Adicionado (usado no modal para as calorias)
  protein: number;              // Adicionado (mesmo que seja 0 inicialmente)
  carbs: number;                // Adicionado (mesmo que seja 0 inicialmente)
  fats: number;                 // Adicionado (mesmo que seja 0 inicialmente)
  medida_caseira_sugerida?: string; // Adicionado
  // Se você tiver outras propriedades que o modal ou o fluxo de edição/adição usam, adicione-as aqui.
}