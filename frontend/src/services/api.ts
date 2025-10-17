import axios from 'axios';

// 1. Lê a URL da API da variável de ambiente que configuramos
//    - Em desenvolvimento (local), será 'http://127.0.0.1:8000'
//    - Em produção (Firebase), será 'https://nutriscan-backend-...'
const baseURL = process.env.NEXT_PUBLIC_API_URL;

// 2. Cria a instância do Axios com a URL correta
const api = axios.create({
  baseURL: baseURL,
});

// --- Funções para gerenciar o token JWT ---

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    // Adiciona o token a todos os cabeçalhos de requisições futuras
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Opcional: Salvar no localStorage para persistir o login
    localStorage.setItem('accessToken', token);
  } else {
    // Remove o token dos cabeçalhos
    delete api.defaults.headers.common['Authorization'];
    // Opcional: Remover do localStorage
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    // Tenta carregar do localStorage se a página foi recarregada
    accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  return accessToken;
};

// ✅ ADICIONE interceptors para debug
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

api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);


export default api;
