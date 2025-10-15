// arquivo: src/services/api.ts

import axios from 'axios';

// ✅ CORREÇÃO AQUI
// O Axios usará a variável de ambiente NEXT_PUBLIC_API_URL.
// Se ela não existir, ele usará http://127.0.0.1:8000 como padrão (para desenvolvimento local).
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
});

// O resto do seu arquivo continua o mesmo...
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export function setAccessToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') localStorage.setItem('authToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') localStorage.removeItem('authToken');
  }
}

const initialToken = getAccessToken();
if (initialToken) {
  setAccessToken(initialToken);
}

console.log('🚀 API Configurada para:', api.defaults.baseURL); // Ajuda a depurar

export default api;