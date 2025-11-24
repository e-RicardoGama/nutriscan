"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../services/api';
import { AxiosError } from 'axios';
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center">Redefinir Senha</h2>
          <p className="text-center text-gray-600 mt-3">
            O link está faltando ou é inválido.
          </p>

          <Link
            href="/esqueci-senha"
            className="mt-6 w-full block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Solicitar Novo Link
          </Link>

          <p className="text-center mt-4">
            <Link href="/login" className="text-green-600 hover:text-green-500">
              Voltar ao Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setErro(null);
    setCarregando(true);

    try {
      await api.post('/api/v1/auth/redefinir-senha', {
        token,
        nova_senha: novaSenha,
        confirmar_senha: confirmarSenha,
      });

      setMensagem('Senha redefinida com sucesso! Redirecionando para login...');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError && err.response?.data?.detail) {
        setErro(err.response.data.detail);
      } else {
        setErro('Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">

        <h2 className="text-2xl font-bold text-center text-gray-900">Redefinir Senha</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nova senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                disabled={carregando || !!mensagem}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                disabled={carregando || !!mensagem}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
          {mensagem && <p className="text-green-600 text-sm text-center">{mensagem}</p>}

          <button
            type="submit"
            disabled={carregando || !!mensagem || novaSenha !== confirmarSenha}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {carregando ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>

        <p className="text-sm text-center">
          <Link href="/login" className="text-green-600 hover:text-green-500">
            Voltar ao Login
          </Link>
        </p>

      </div>
    </div>
  );
}
