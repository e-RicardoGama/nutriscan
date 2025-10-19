// arquivo: src/app/registrar/page.tsx

"use client";

import { useState, Suspense } from 'react';
import api from '../../services/api'; // Nosso helper de API
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AxiosError } from 'axios';

// Componente principal que pode usar hooks
function RegisterContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      // Usando nosso helper 'api' para chamar o endpoint de registro
      await api.post('/auth/registrar', { email, password });

      setSuccess('Usuário registrado com sucesso! Redirecionando para o login...');
      
      // Espera 2 segundos e redireciona para a página de login
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
        // Verificamos se o erro é uma instância de AxiosError
        if (err instanceof AxiosError) {
            // Se for, podemos acessar err.response com segurança
            if (err.response?.data?.detail) {
            setError(err.response.data.detail);
            } else {
            setError('Ocorreu um erro na resposta do servidor.');
            }
        } else {
            // Se for outro tipo de erro
            setError('Ocorreu um erro inesperado ao tentar registrar.');
        }
        console.error('Falha no registro:', err);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen font-sans bg-gray-100 p-4">
      <div className="container mx-auto max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">Criar Conta</h1>
        <form onSubmit={handleRegister}>
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
          <div className="mb-4">
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
          <div className="mb-6">
            <label htmlFor="confirmPassword"  className="block text-gray-700 font-bold mb-2">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}

          <button type="submit" className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-full transition duration-300 hover:bg-sky-600 shadow-lg">
            Registrar
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-sky-500 hover:underline">
            Faça o login
          </Link>
        </p>
      </div>
    </main>
  );
}

// Componente principal com Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}