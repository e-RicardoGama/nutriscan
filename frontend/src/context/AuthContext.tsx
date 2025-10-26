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

// ✅ CORREÇÃO: Usar a URL da API do ambiente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  // ✅ CORREÇÃO: Log da URL da API para debug
  useEffect(() => {
    if (IS_DEVELOPMENT) {
      console.log('🌐 API Base URL:', API_BASE_URL);
      console.log('🎯 AuthProvider montado');
    }
  }, []);

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

  useEffect(() => {
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

  // ✅ CORREÇÃO PRINCIPAL: Login com URL absoluta para evitar problemas de CORS
  const login = useCallback(async (email: string, senha: string) => {
    setCarregando(true);
    try {
      const body = new URLSearchParams();
      body.set("username", email);
      body.set("password", senha);

      if (IS_DEVELOPMENT) {
        console.log('🔐 Tentando login...');
        console.log('🌐 URL da API:', API_BASE_URL);
      }

      // ✅ CORREÇÃO: Usar fetch diretamente com URL absoluta para evitar problemas de CORS
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (IS_DEVELOPMENT) console.log('✅ Login bem-sucedido, token recebido:', data);
      
      // ✅ CORREÇÃO: Verificar se o token existe
      if (!data.access_token) {
        throw new Error('Token não recebido da API');
      }
      
      setAccessToken(data.access_token);
      await fetchMe();
    } catch (err) {
      console.error('❌ Erro no login:', err);
      
      // ✅ CORREÇÃO: Mensagem de erro mais específica
      let errorMessage = 'Erro durante o login';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      throw new Error(errorMessage);
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