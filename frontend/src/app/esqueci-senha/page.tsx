"use client";

import React, { useState } from 'react';
import api from '../../services/api';
import { AxiosError } from 'axios';
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    setErro(null);
    setCarregando(true);

    try {
      await api.post('/api/v1/auth/esqueci-senha', { email });
      setMensagem('Se o seu email estiver registrado, um link para redefinir sua senha foi enviado.');
      setEmail('');
    } catch (err) {
      console.error('Erro ao solicitar redefinição:', err);
      if (err instanceof AxiosError && err.response?.data?.detail) {
        setErro(err.response.data.detail);
      } else {
        setErro('Erro ao processar solicitação. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">

        <h2 className="text-2xl font-bold text-center text-gray-900">Esqueceu sua Senha?</h2>
        <p className="text-sm text-center text-gray-600">
          Informe seu email e enviaremos um link de redefinição.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={carregando || !!mensagem}
            />
          </div>

          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
          {mensagem && <p className="text-green-600 text-sm text-center">{mensagem}</p>}

          <button
            type="submit"
            disabled={carregando || !!mensagem}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {carregando ? 'Enviando...' : 'Enviar Link'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
            Voltar para Login
          </Link>
        </p>

      </div>
    </div>
  );
}
