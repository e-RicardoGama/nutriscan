// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import GoalCircles from '../components/dashboard/GoalCircles';
import DailyFeed from '../components/dashboard/DailyFeed';
import { Plus } from 'lucide-react';
import api from '../services/api';

interface DailyTotals {
  total_calorias: number;
  total_proteinas_g: number;
  total_carboidratos_g: number;
  total_gorduras_g: number;
}

interface MealSummary {
  id: number;
  tipo?: string;
  kcal_estimadas?: number;
  imagem_url?: string | null;
  proteinas_g?: number | null;
  carboidratos_g?: number | null;
  gorduras_g?: number | null;
  alimentos_principais?: string[];
  suggested_name?: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const { usuario, carregando, logout } = useAuth();
  
  const [totals, setTotals] = useState<DailyTotals | null>(null);
  const [todaysMeals, setTodaysMeals] = useState<MealSummary[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proteção de Rota
  useEffect(() => {
    if (!carregando && !usuario) {
      router.push('/publico');
    }
  }, [usuario, carregando, router]);

  // Busca os dados do Dashboard
  useEffect(() => {
    if (usuario) {
      const fetchData = async () => {
        try {
          setLoadingData(true);
          setError(null);

          // Requisição 1: Resumo Diário
          const totalsResponse = await api.get<DailyTotals>('/api/v1/refeicoes/resumo-diario');
          // ✅ Adicionar verificação para garantir que a data existe antes de setar
          if (totalsResponse.data) {
            setTotals(totalsResponse.data);
          } else {
            console.warn("Resposta vazia ou inválida para resumo-diario.");
            setTotals({ total_calorias: 0, total_proteinas_g: 0, total_carboidratos_g: 0, total_gorduras_g: 0 }); // Define um default
          }

          // Requisição 2: Refeições de Hoje
          const mealsResponse = await api.get<MealSummary[]>('/api/v1/refeicoes/refeicoes-hoje');
          // ✅ Adicionar verificação para garantir que a data existe antes de setar
          if (mealsResponse.data) {
            setTodaysMeals(mealsResponse.data);
          } else {
            console.warn("Resposta vazia ou inválida para refeicoes-hoje.");
            setTodaysMeals([]); // Define um default
          }

        } catch (err) {
          console.error("Erro ao buscar dados do dashboard:", err);
          let errorMessage = "Não foi possível carregar seu resumo. Tente novamente.";

          if (err instanceof AxiosError) {
            // Se for um erro do Axios, podemos tentar extrair mais detalhes
            if (err.response) {
              // O servidor respondeu com um status diferente de 2xx
              console.error("Detalhes do erro do backend:", err.response.data);
              if (typeof err.response.data === 'object' && err.response.data !== null && 'detail' in err.response.data) {
                errorMessage = `Erro do servidor: ${err.response.data.detail}`;
              } else if (typeof err.response.data === 'string') {
                errorMessage = `Erro do servidor: ${err.response.data}`;
              } else {
                errorMessage = `Erro do servidor: Status ${err.response.status}`;
              }
            } else if (err.request) {
              // A requisição foi feita, mas nenhuma resposta foi recebida
              errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está online.";
            } else {
              // Algo aconteceu na configuração da requisição que disparou um erro
              errorMessage = `Erro na requisição: ${err.message}`;
            }
          } else if (err instanceof Error) {
            // Outros erros de JavaScript
            errorMessage = `Erro inesperado: ${err.message}`;
          }
          setError(errorMessage);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [usuario]);

  const handleScanMealClick = () => {
    router.push('/scan'); 
  };

  // ✅ FUNÇÃO PARA VISUALIZAR ANÁLISE DETALHADA
  const handleViewMealAnalysis = (mealId: number) => {
    // Navega para a página de análise detalhada
    router.push(`/analysis/${mealId}`);
  };

  // ✅ FUNÇÃO PARA CLIQUE NO CARD INTEIRO (DETALHES DA REFEIÇÃO)
  const handleMealClick = (mealId: number) => {
    // Pode ser usado para abrir um modal ou navegar para detalhes
    console.log('Abrir detalhes da refeição:', mealId);
    // router.push(`/meal/${mealId}`); // Se tiver uma página de detalhes
  };

  if (carregando || !usuario) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar onLogout={logout} />
      <main className="grow w-full max-w-4xl mx-auto p-4 lg:p-8">
        
        {loadingData && (
          <div className="text-center text-gray-600">Carregando seu resumo...</div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">{error}</div>
        )}

        {!loadingData && !error && (
          <>
            {/* Círculos de Totais Consumidos */}
            <h2 className="text-lg font-semibold text-green-800 mb-3">Consumo de Hoje</h2>
            {totals ? (
              <GoalCircles totals={totals} />
            ) : (
              <p className='text-gray-500 text-center'>Sem dados de consumo hoje.</p>
            )}

            {/* Feed Visual de Refeições */}
            <h2 className="text-lg font-semibold text-green-800 mt-8 mb-3">Suas Refeições</h2>
            <DailyFeed 
              meals={todaysMeals} 
              onAddMealClick={handleScanMealClick}
              onViewMealClick={handleViewMealAnalysis} // ✅ Link para análise
              onMealClick={handleMealClick} // ✅ Clique no card
            />
          </>
        )}

        {/* Botão de Ação Rápida (FAB) */}
        <button
        onClick={handleScanMealClick}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-green-700 text-white rounded-full px-4 py-3 shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-50 flex items-center gap-2"
        title="Analisar nova refeição"
      >
        <Plus size={18} />
        <span className="text-sm font-medium">Nova Refeição</span>
      </button>

      </main>
    </div>
  );
}