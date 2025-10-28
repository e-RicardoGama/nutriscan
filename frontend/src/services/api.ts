// /src/services/api.ts
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

// DEBUG - verificar se a URL está correta
console.log('🔧 API Base URL configurada:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 40000,
});

// Token guardado em memória (runtime)
let _accessToken: string | null = null;

/**
 * Define o token em memória e (se estiver no client) em localStorage e headers do axios
 */
export const setAccessToken = (token: string | null) => {
  _accessToken = token;

  // Atualiza header da instância do axios
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }

  // Persiste somente no client
  if (typeof window !== "undefined") {
    try {
      if (token) localStorage.setItem("accessToken", token);
      else localStorage.removeItem("accessToken");
    } catch (err) {
      console.warn("services/api: falha ao acessar localStorage", err);
    }
  }
};

/**
 * Lê o token da memória; se não existir e estivermos no client, tenta do localStorage.
 * Retorna string|null
 */
export const getAccessToken = (): string | null => {
  if (_accessToken) return _accessToken;

  if (typeof window !== "undefined") {
    try {
      const t = localStorage.getItem("accessToken");
      if (t) {
        _accessToken = t;
        api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
        return t;
      }
    } catch (err) {
      console.warn("services/api: erro ao ler token do localStorage", err);
    }
  }

  return null;
};

// Interceptors (logging e tratamento simples)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // opcional: leve logging
      // console.log("🔄 Fazendo requisição para:", config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Tratar 401 / refresh token etc. (placeholder)
    // console.error("API response error:", error);
    return Promise.reject(error);
  }
);

// Exportações
export default api;
