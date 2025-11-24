// src/app/registrar/page.tsx - VERSÃO COMPLETA COM CAMPOS DE ENDEREÇO E LÓGICA DE CEP

"use client";

import { useState, Suspense } from 'react';
import api from '../../services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AxiosError } from 'axios';
import PasswordInput from '../../components/PasswordInput'; // Importando o componente
//import { Eye, EyeOff } from "lucide-react"; // Para os ícones de senha, se não estiverem no PasswordInput

// Componente principal que pode usar hooks
function RegisterContent() {
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dataNascimento, setDataNascimento] = useState(''); // Novo campo
  const [cep, setCep] = useState(''); // Novo campo
  const [logradouro, setLogradouro] = useState(''); // Novo campo
  const [numero, setNumero] = useState(''); // Novo campo
  const [complemento, setComplemento] = useState(''); // Novo campo
  const [bairro, setBairro] = useState(''); // Novo campo
  const [cidade, setCidade] = useState(''); // Novo campo
  const [estado, setEstado] = useState(''); // Novo campo

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [carregando, setCarregando] = useState(false); // Estado de carregamento para o formulário
  const router = useRouter();

  // Lógica para buscar endereço via ViaCEP
  const fetchAddress = async (cepValue: string) => {
    if (cepValue.length !== 8) return; // Só busca se tiver 8 dígitos

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError("CEP não encontrado ou inválido.");
        setLogradouro(''); setBairro(''); setCidade(''); setEstado('');
        return;
      }

      setLogradouro(data.logradouro || '');
      setBairro(data.bairro || '');
      setCidade(data.localidade || '');
      setEstado(data.uf || '');
      setError(''); // Limpa erro se encontrou
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      setError("Erro ao buscar CEP. Verifique sua conexão ou tente novamente.");
      setLogradouro(''); setBairro(''); setCidade(''); setEstado('');
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCep = e.target.value.replace(/\D/g, ''); // Remove não-dígitos
    setCep(newCep);
    if (newCep.length === 8) {
      fetchAddress(newCep);
    } else {
      // Limpa os campos de endereço se o CEP for incompleto
      setLogradouro(''); setBairro(''); setCidade(''); setEstado('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCarregando(true); // Inicia o carregamento

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setCarregando(false);
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      setCarregando(false);
      return;
    }

    try {
      await api.post('/api/v1/auth/registrar', {
        nome,
        apelido,
        email,
        password,
        data_nascimento: dataNascimento || null, // Envia null se vazio
        cep: cep || null,
        logradouro: logradouro || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
      });

      setSuccess('Usuário registrado com sucesso! Redirecionando para o login...');

      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
        if (err instanceof AxiosError) {
            if (err.response?.data?.detail) {
            setError(err.response.data.detail);
            } else {
            setError('Ocorreu um erro na resposta do servidor.');
            }
        } else {
            setError('Ocorreu um erro inesperado ao tentar registrar.');
        }
        console.error('Falha no registro:', err);
    } finally {
      setCarregando(false); // Finaliza o carregamento
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen font-sans bg-gray-100 p-4">
      <div className="container mx-auto max-w-2xl bg-white shadow-2xl rounded-2xl p-8"> {/* Aumentado max-w-md para max-w-2xl */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">Criar Conta</h1>
        <form onSubmit={handleRegister} className="space-y-6"> {/* Adicionado space-y-6 para espaçamento */}
          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block text-gray-700 font-bold mb-2">Nome Completo *</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={carregando}
              />
            </div>

            <div>
              <label htmlFor="apelido" className="block text-gray-700 font-bold mb-2">Como gostaria de ser chamado</label>
              <input
                type="text"
                id="apelido"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={carregando}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="username"
              disabled={carregando}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="dataNascimento" className="block text-gray-700 font-bold mb-2">Data de Nascimento</label>
            <input
              type="date"
              id="dataNascimento"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={carregando}
            />
          </div>

          {/* Endereço */}
          <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cep" className="block text-gray-700 font-bold mb-2">CEP</label>
              <input
                type="text"
                id="cep"
                value={cep}
                onChange={handleCepChange}
                maxLength={9} // 5 dígitos + '-' + 3 dígitos
                placeholder="Ex: 12345-678"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={carregando}
              />
            </div>
            <div>
              <label htmlFor="logradouro" className="block text-gray-700 font-bold mb-2">Logradouro</label>
              <input
                type="text"
                id="logradouro"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                readOnly // Geralmente preenchido automaticamente
                disabled={carregando}
              />
            </div>
            <div>
              <label htmlFor="numero" className="block text-gray-700 font-bold mb-2">Número</label>
              <input
                type="text"
                id="numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={carregando}
              />
            </div>
            <div>
              <label htmlFor="complemento" className="block text-gray-700 font-bold mb-2">Complemento</label>
              <input
                type="text"
                id="complemento"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={carregando}
              />
            </div>
            <div>
              <label htmlFor="bairro" className="block text-gray-700 font-bold mb-2">Bairro</label>
              <input
                type="text"
                id="bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                readOnly
                disabled={carregando}
              />
            </div>
            <div>
              <label htmlFor="cidade" className="block text-gray-700 font-bold mb-2">Cidade</label>
              <input
                type="text"
                id="cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                readOnly
                disabled={carregando}
              />
            </div>
            <div>
              <label htmlFor="estado" className="block text-gray-700 font-bold mb-2">Estado (UF)</label>
              <input
                type="text"
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                maxLength={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                readOnly
                disabled={carregando}
              />
            </div>
          </div>

          {/* Senhas */}
          <PasswordInput
            id="password"
            label="Senha *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={carregando}
          />
          <p className="mt-1 text-xs text-gray-500">
            Mínimo 8 caracteres
          </p>

          <PasswordInput
            id="confirmPassword"
            label="Confirmar Senha *"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={carregando}
          />

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 hover:bg-green-700 shadow-lg disabled:opacity-50"
            disabled={carregando || password !== confirmPassword || password.length < 8}
          >
            {carregando ? 'Criando Conta...' : 'Criar Conta'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-green-600 hover:underline">
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
