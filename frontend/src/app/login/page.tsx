// src/app/login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
// Removidas as importações de 'api' e 'AxiosError' pois não são mais necessárias aqui.

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { usuario, carregando, login } = useAuth(); // Pega a função login do contexto

  // Redireciona se já estiver logado
  useEffect(() => {
    if (!carregando && usuario) {
      router.push('/');
    }
  }, [usuario, carregando, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ✅ CORREÇÃO PRINCIPAL: Chamar a função 'login' do contexto, passando email e senha.
      // Toda a lógica de requisição HTTP, obtenção do token e atualização do estado
      // do usuário é gerenciada dentro do AuthContext.
      await login(email, password);
      console.log('✅ Login bem-sucedido!');
      router.push('/');

    } catch (err) {
      // O AuthContext já trata os erros da API e lança uma exceção genérica.
      // Podemos exibir uma mensagem de erro mais amigável aqui.
      console.error('❌ Erro no login:', err);
      setError('Credenciais inválidas. Verifique seu email e senha.');
    } finally {
      setLoading(false);
    }
  };

  if (carregando || usuario) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Bem-vindo de volta!</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username" // Para acessibilidade e preenchimento automático
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" // Para acessibilidade e preenchimento automático
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Não tem uma conta?{' '}
          <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Registre-se
          </a>
        </p>
      </div>
    </div>
  );
}
