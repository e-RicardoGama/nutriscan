// Interfaces para histórico e detalhes de refeições salvas
export interface AnaliseDetalhadaResponse {
  id: number;
  usuario_id: number;
  imagem_url: string | null;
  data_criacao: string;
  total_calorias: number | null;
  total_proteinas: number | null;
  total_carboidratos: number | null;
  total_gorduras: number | null;
  alimentos: AlimentoDetectado[];
}

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

// Interfaces para análise completa (usada no scan)
export interface AnaliseCompletaResponse {
  detalhes_prato: { alimentos: AlimentoDetalhado[] };
  analise_nutricional: AnaliseNutricional;
  recomendacoes: Recomendacoes;
  timestamp?: string;
}

export interface AlimentoDetalhado {
  nome: string;
  quantidade_gramas: number;
  metodo_preparo: string;
  medida_caseira_sugerida?: string;
}

export interface AnaliseNutricional {
  calorias_totais: number;
  macronutrientes: Macronutrientes;
  vitaminas_minerais?: string[];
  vitaminas?: string[];
  minerais?: string[];
}

export interface Macronutrientes {
  proteinas_g: number;
  carboidratos_g: number;
  gorduras_g: number;
}

export interface Recomendacoes {
  pontos_positivos: string[];
  sugestoes_balanceamento: string[];
  alternativas_saudaveis: string[];
}
