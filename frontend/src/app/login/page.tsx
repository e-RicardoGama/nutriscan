// frontend/src/app/login/page.tsx - VERSÃO INTEGRADA COM AuthContext

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext'; // ✅ 1. IMPORTAMOS o useAuth

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const { login } = useAuth(); // ✅ 2. OBTEMOS a função de login do nosso contexto

  // ✅ ADICIONE headers explícitos na requisição de login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Teste simples de CORS primeiro
      const testResponse = await fetch('https://nutriscan-backend-925272362555.southamerica-east1.run.app/health', {
        method: 'GET',
        mode: 'cors',
      });
      
      if (!testResponse.ok) {
        throw new Error('Problema de CORS na API');
      }

      // Se o teste passar, faz o login
      await login(email, password);
      console.log('✅ Login bem-sucedido!');
      router.push('/');

    } catch (err) {
      console.error('❌ Falha no login:', err);
      
      if (err instanceof Error && err.message.includes('CORS')) {
        setError('Problema de configuração na API. Tente novamente mais tarde.');
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen font-sans bg-gray-100 p-4">
      <div className="container mx-auto max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">Login</h1>
        <form onSubmit={handleLogin}>
          {/* O restante do seu formulário JSX continua exatamente o mesmo */}
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