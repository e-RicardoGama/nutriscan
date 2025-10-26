import axios from 'axios';

// 1. Lê a URL da API da variável de ambiente
// const baseURL = process.env.NEXT_PUBLIC_API_URL;
const baseURL = 'https://nutriscan-backend-925272362555.southamerica-east1.run.app';

// 2. Cria a instância do Axios
const api = axios.create({
  baseURL: baseURL,
});

// --- Funções para gerenciar o token JWT (Seu código) ---
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('accessToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  return accessToken;
};

// --- Interceptors (Seu código) ---
api.interceptors.request.use(
  (config) => {
    console.log('🔄 Fazendo requisição para:', config.url);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);
// ... (seu interceptor de response) ...

// ==================================================================
// ✅ INÍCIO DA ADIÇÃO: Funções de Ação da API (COM CORREÇÃO)
// ==================================================================

// --- Interfaces de Tipos ---
// (Já tínhamos estas)
interface Nutrients {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
interface ApiItem {
  id: string;
  name: string;
  nutrients: Nutrients;
}

// (Faltava esta no api.ts, ela estava no componente)
interface MealItem extends ApiItem {
  category: string;
}

// ✅ NOVA INTERFACE: Esta é a correção para o erro 'any'
// Ela define exatamente a estrutura do objeto mealData
interface MealPayload {
  items: MealItem[];
  totals: Nutrients;
}

/**
 * Envia uma foto para a API para análise.
 * @param {File} photo - O arquivo da imagem
 */
export const takeAndAnalyzePhoto = async (photo: File): Promise<ApiItem> => {
  const formData = new FormData();
  formData.append('file', photo); 

  console.log("Enviando foto para /analyze-photo...");
  
  const response = await api.post('/analyze-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Agora o TypeScript sabe que a resposta DEVE ser um ApiItem
  return response.data; 
};

/**
 * Salva a refeição completa no banco de dados.
 * @param {MealPayload} mealData - O objeto { items: [...], totals: {...} }
 */
// ✅ CORREÇÃO: Trocamos 'any' por 'MealPayload'
export const saveMealToDatabase = async (mealData: MealPayload) => {
  console.log("Salvando refeição no DB via /meals...");
  
  // Agora o TypeScript sabe exatamente o que é mealData
  const response = await api.post('/meals', mealData);
  
  // Você também pode tipar a resposta se souber o que ela retorna
  // ex: const response = await api.post<SaveResponse>('/meals', mealData);
  return response.data;
};

// ==================================================================
// FIM DA ADIÇÃO
// ==================================================================

// Exporta a instância 'api' como default
export default api;