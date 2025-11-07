// src/services/api.ts
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

// DEBUG - verificar se a URL está correta
console.log('🔧 API Base URL configurada:', baseURL);

const api = axios.create({
  baseURL,
  // timeout: 60000, // Mantido comentado, pode ser útil em redes lentas
});

/**
 * Define o token no localStorage e no cabeçalho padrão do Axios.
 * Esta função deve ser chamada após o login bem-sucedido.
 *
 * NOTA: A função getAccessToken e a variável _accessToken foram removidas.
 * O token agora é lido diretamente do localStorage no interceptor de requisição
 * para garantir que esteja sempre atualizado e evitar problemas de sincronização.
 */
export const setAccessToken = (token: string | null) => {
  if (typeof window !== "undefined") {
    try {
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }
    } catch (err) {
      console.warn("services/api: falha ao acessar localStorage para setAccessToken", err);
    }
  }
  // Opcional: Atualiza o cabeçalho padrão para futuras requisições *imediatas*.
  // O interceptor abaixo garante que o token do localStorage seja usado em cada requisição.
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Interceptor de Requisição: Adiciona o token de autenticação a cada requisição
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") { // Garante que o localStorage só é acessado no lado do cliente
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Opcional: logging para depuração
        // console.log("🔄 Fazendo requisição para:", config.url, "com token:", !!token);
      } catch (err) {
        console.warn("services/api: erro ao ler token do localStorage no interceptor", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta: Trata erros comuns, como 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ ESTA É A LINHA CRÍTICA: Certifique-se de que é '&&' e não '&amp;amp;&amp;amp;'
    if (error.response && error.response.status === 401) {
      console.error("Erro 401: Não autorizado. Token inválido ou expirado.");
      // Redireciona para a página de login e limpa o token
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        // Use window.location.href para garantir um refresh completo e limpar o estado
        window.location.href = '/login';
      }
    }
    // Você pode adicionar outros tratamentos de erro aqui (ex: 403, 500)
    return Promise.reject(error);
  }
);

// Exportações
export default api;
