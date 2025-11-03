// src/app/refeicao/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';
import { Loader2, Home, ArrowLeft } from 'lucide-react';

// 🔥 REUTILIZE SEUS COMPONENTES E INTERFACES!
// Importe a interface da sua página principal
import { AnaliseCompletaResponse } from '../../../interfaces/api.types';
// Importe o componente que você já criou para mostrar a análise
import AnalysisResults from '../../../components/AnalysisResults';

/*
  IMPORTANTE: Você precisará refatorar seu 'page.tsx' original.
  
  1. Mova o componente 'AnalysisResults' (que você me mostrou) 
     para seu próprio arquivo (ex: 'src/components/AnalysisResults.tsx').
     
  2. Importe 'AnalysisResults' tanto na sua 'page.tsx' (principal) 
     quanto nesta nova página 'src/app/refeicao/[id]/page.tsx'.
*/


export default function DetalheRefeicaoPage() {
  const router = useRouter();
  const params = useParams(); // Hook para pegar o [id] da URL
  const { usuario, carregando, logout } = useAuth();
  
  const [analysisResult, setAnalysisResult] = useState<AnaliseCompletaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mealId = params?.id; // Pega o ID da URL

  // Proteção de Rota
  useEffect(() => {
    if (!carregando && !usuario) {
      router.push('/login');
    }
  }, [usuario, carregando, router]);

  // Buscar dados da Análise Detalhada
  useEffect(() => {
    if (usuario && mealId) {
      const fetchAnalise = async () => {
        setLoading(true);
        setError(null);
        try {
          // Chama o novo endpoint de detalhe
          const response = await api.get<AnaliseCompletaResponse>(`/api/v1/refeicoes/detalhe/${mealId}`);
          setAnalysisResult(response.data);
        } catch (err) {
          console.error("Erro ao buscar análise:", err);
          setError("Não foi possível carregar a análise desta refeição.");
        } finally {
          setLoading(false);
        }
      };
      fetchAnalise();
    }
  }, [usuario, mealId]); // Roda quando o usuário e o mealId estiverem prontos

  if (carregando) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onLogout={logout} />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="animate-spin" size={48} />
        </div>
      </div>
    );
  }
  
  if (!usuario) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onLogout={logout} />
      <main className="flex-grow w-full max-w-4xl mx-auto p-4 lg:p-8">
        
        <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-800">Análise da Refeição #{mealId}</h1>
            
            <Link href="/historico" legacyBehavior>
                <a className="flex items-center text-sm text-blue-600 hover:underline">
                    <ArrowLeft size={16} className="mr-1" />
                    Voltar para o Histórico
                </a>
            </Link>
        </div>
        
        {loading && (
           <div className="flex-grow flex justify-center items-center p-10">
                <Loader2 className="animate-spin" size={32} />
           </div>
        )}

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}
        
        {/* 🔥 A MÁGICA ACONTECE AQUI! 🔥 */}
        {/* Você reutiliza o componente que já tem! */}
        {analysisResult && (
          <>
            <AnalysisResults analysisResult={analysisResult} />

            <div className="mt-10 text-center">
              <button
                onClick={() => router.push('/')} // Navega para a Home
                className="w-full sm:w-auto cursor-pointer bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition hover:bg-green-700 shadow-md flex items-center justify-center mx-auto"
              >
                <Home size={20} className="mr-2" />
                Ir para o Dashboard
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}