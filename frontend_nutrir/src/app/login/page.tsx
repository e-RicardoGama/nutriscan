// frontend_nutri/src/app/login/page.tsx - VERSÃO CORRIGIDA E FINAL

"use client";

import { useState } from 'react';
import api from '../../services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ CORREÇÃO: Converte os dados para o formato de formulário
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // A chamada agora envia os dados no formato correto
      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;
      localStorage.setItem('authToken', access_token);
      
      console.log('✅ Login bem-sucedido!');
      router.push('/'); 

    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      console.error('❌ Falha no login:', error);
      
      // ✅ Mensagem mais específica
      const errorMessage = error.response?.data?.detail || 'E-mail ou senha incorretos.';
      setError(errorMessage);
    } finally {
    setLoading(false);  // ✅ Finaliza loading
    }
  };


  return (
    <main className="flex justify-center items-center min-h-screen font-sans bg-gray-100 p-4">
      <div className="container mx-auto max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password"  className="block text-gray-700 font-bold mb-2">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-full transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-600'} shadow-lg`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Não tem uma conta?{' '}
          <Link href="/registrar" className="text-sky-500 hover:underline">
            Registre-se
          </Link>
        </p>
      </div>
    </main>
  );
}