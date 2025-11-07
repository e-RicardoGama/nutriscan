// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
//import { AxiosError } from "axios";
import api, { setAccessToken } from "../services/api"; // REMOVIDO: getAccessToken
import type { Usuario } from "../types/usuario"; // Assumindo que este é o caminho correto

type MeResponse = Usuario; // Assumindo que o endpoint /me retorna um objeto Usuario

interface AuthContextType {
  usuario: Usuario | null;
  carregando: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      // ✅ CORREÇÃO AQUI: Chamando o endpoint correto no backend
      const response = await api.get<MeResponse>("/api/v1/usuarios/me");
      setUsuario(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      setUsuario(null);
      // Se /me falhar (ex: 401 Unauthorized), o interceptor em api.ts já deve lidar com isso
      // redirecionando para login e limpando o token.
      // Para o erro 404, o token não é inválido, mas o recurso não foi encontrado.
      // Não removemos o token aqui para 404, pois o usuário pode estar autenticado,
      // mas o endpoint /me pode estar com problema no backend.
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
          setAccessToken(storedToken); // Configura o token no Axios para futuras requisições
          await fetchUser(); // Tenta buscar os dados do usuário
        } else {
          setCarregando(false); // Não há token, então não há usuário logado, para de carregar
        }
      } else {
        // No ambiente do servidor (SSR), não há localStorage, então não há token persistido
        setCarregando(false);
      }
    };
    initializeAuth();
  }, [fetchUser]);

  const login = useCallback((token: string) => {
    setAccessToken(token); // Salva o token no localStorage e configura o Axios
    setCarregando(true);
    fetchUser(); // Busca os dados do usuário após o login
  }, [fetchUser]);

  const logout = useCallback(() => {
    setAccessToken(null); // Limpa o token do localStorage e do Axios
    setUsuario(null);
    setCarregando(false);
  }, []);

  const refreshUser = useCallback(async () => {
    setCarregando(true);
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
