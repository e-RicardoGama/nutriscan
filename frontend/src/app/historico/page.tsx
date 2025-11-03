// src/app/historico/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

// Interface para o item da lista (deve bater com o schema Pydantic)
interface RefeicaoHistoricoItem {
  id: number;
  data_criacao: string;
  imagem_url: string | null;
  total_calorias: number | null;
}

export default function HistoricoPage() {
  const router = useRouter();
  const { usuario, carregando, logout } = useAuth();
  const [refeicoes, setRefeicoes] = useState<RefeicaoHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proteção de Rota
  useEffect(() => {
    if (!carregando && !usuario) {
      router.push('/login');
    }
  }, [usuario, carregando, router]);

  // Buscar dados do Histórico
  useEffect(() => {
    if (usuario) {
      const fetchHistorico = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.get<RefeicaoHistoricoItem[]>('/api/v1/refeicoes/historico');
          setRefeicoes(response.data);
        } catch (err) {
          console.error("Erro ao buscar histórico:", err);
          setError("Não foi possível carregar seu histórico.");
        } finally {
          setLoading(false);
        }
      };
      fetchHistorico();
    }
  }, [usuario]); // Roda quando o usuário é carregado

  if (carregando || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onLogout={logout} />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="animate-spin" size={48} />
        </div>
      </div>
    );
  }
  
  if (!usuario) return null; // Proteção de rota

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onLogout={logout} />
      <main className="flex-grow w-full max-w-4xl mx-auto p-4 lg:p-8">
        <h1 className="text-2xl font-bold text-green-800 mb-6">Meu Histórico de Refeições</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}
        
        {refeicoes.length === 0 && !error && (
          <p className="text-gray-600 text-center">Você ainda não salvou nenhuma refeição.</p>
        )}

        <div className="space-y-4">
          {refeicoes.map((refeicao) => (
            <Link href={`/refeicao/${refeicao.id}`} key={refeicao.id} legacyBehavior>
              <a className="flex items-center bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  {/* Imagem */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                    {refeicao.imagem_url ? (
                      <Image
                        src={refeicao.imagem_url}
                        alt="Refeição"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  
                  {/* Infos */}
                  <div className="ml-4">
                    <p className="font-semibold text-lg text-gray-800">
                      Refeição #{refeicao.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(refeicao.data_criacao).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {refeicao.total_calorias && (
                      <p className="text-blue-600 font-bold mt-1">
                        {refeicao.total_calorias.toFixed(0)} kcal
                      </p>
                    )}
                  </div>
              </a>

            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}