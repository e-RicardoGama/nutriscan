// arquivo: src/services/api.ts
import axios from 'axios';

/// arquivo: src/services/api.ts
const API_BASE_URL = '';

const api = axios.create({
  // 👇 CORREÇÃO: Aponte para a sua API rodando localmente
  baseURL: 'http://localhost:8000', 
});

console.log('🚀 API Configurada para:', API_BASE_URL);

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;