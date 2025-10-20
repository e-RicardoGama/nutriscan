// src/context/AuthContext.tsx - VERSÃO CORRIGIDA

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AxiosError } from "axios";
import api, { setAccessToken, getAccessToken } from "../services/api";
import type { Usuario } from "../types/usuario";

type MeResponse = Usuario;

type AuthCtx = {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  setUsuario: (usuario: Usuario | null) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

// Constante para controle de logs
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  // fetchMe otimizado
  const fetchMe = useCallback(async () => {
    try {
      if (IS_DEVELOPMENT) console.log('🔄 Buscando dados do usuário...');
      const { data } = await api.get<MeResponse>("/usuarios/me");
      if (IS_DEVELOPMENT) console.log('✅ Dados do usuário recebidos:', data);
      setUsuario(data);
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      
      if (error instanceof AxiosError && error.response?.status === 401) {
        setAccessToken(null);
      }
      
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Efeito de inicialização
  useEffect(() => {
    if (IS_DEVELOPMENT) console.log('🎯 AuthProvider montado');
    const token = getAccessToken();
    if (IS_DEVELOPMENT) console.log('🔐 Token encontrado:', !!token);
    
    if (token) {
      if (IS_DEVELOPMENT) console.log('🔄 Iniciando fetchMe...');
      fetchMe();
    } else {
      if (IS_DEVELOPMENT) console.log('🚫 Sem token, pulando fetchMe');
      setCarregando(false);
    }
  }, [fetchMe]);

  // Login
  const login = useCallback(async (email: string, senha: string) => {
    setCarregando(true);
    try {
      const body = new URLSearchParams();
      body.set("username", email);
      body.set("password", senha);

      if (IS_DEVELOPMENT) console.log('🔐 Tentando login...');
      const { data } = await api.post<{ access_token: string; token_type: string }>(
        "auth/login", 
        body.toString(), 
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (IS_DEVELOPMENT) console.log('✅ Login bem-sucedido, token recebido');
      setAccessToken(data.access_token);
      await fetchMe();
    } catch (err) {
      console.error('❌ Erro no login:', err);
      
      if (err instanceof AxiosError && err.response?.status === 401) {
        setAccessToken(null);
      }
      
      throw err;
    } finally {
      setCarregando(false);
    }
  }, [fetchMe]);

  const logout = useCallback(() => {
    if (IS_DEVELOPMENT) console.log('🚪 Fazendo logout...');
    setAccessToken(null);
    setUsuario(null);
  }, []);

  // Log de estado (apenas desenvolvimento)
  useEffect(() => {
    if (IS_DEVELOPMENT) {
      console.log('🔐 AuthContext - Estado atual:', {
        usuario: usuario ? { nome: usuario.nome, email: usuario.email } : null,
        carregando
      });
    }
  }, [usuario, carregando]);

  return (
    <Ctx.Provider value={{ usuario, carregando, login, logout, setUsuario }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export default Ctx;