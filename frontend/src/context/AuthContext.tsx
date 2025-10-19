// src/context/AuthContext.tsx

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessToken, getAccessToken } from "../services/api";
import type { Usuario } from "../types/usuario";

// A resposta de /usuarios/me deve bater com seu schema UsuarioOut
type MeResponse = Usuario;

type AuthCtx = {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  setUsuario: (usuario: Usuario | null) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  // Busca o perfil do usuário autenticado
  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get<MeResponse>("/usuarios/me");
      setUsuario(data);
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Inicializa com token salvo (se houver)
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchMe();
    } else {
      setCarregando(false);
    }
  }, [fetchMe]);

  // Faz login via form-urlencoded: username/password (exigido pelo OAuth2PasswordRequestForm)
  const login = useCallback(async (email: string, senha: string) => {
    setCarregando(true);
    try {
      const body = new URLSearchParams();
      body.set("username", email);
      body.set("password", senha);

      const { data } = await api.post<{ access_token: string; token_type: string }>("auth/login", body.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      setAccessToken(data.access_token);
      await fetchMe();
    } catch (err) {
      // Opcional: lançar para a UI exibir mensagem
      throw err;
    } finally {
      setCarregando(false);
    }
  }, [fetchMe]);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    console.log('🔐 AuthContext - Estado atual:', {
      usuario,
      carregando,
      url: window.location.href
    });
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
