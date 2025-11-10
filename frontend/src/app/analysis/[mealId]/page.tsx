// src/app/analysis/[mealId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// ✅ CORREÇÃO: Adicionado um '../' a mais em cada caminho
import Navbar from "../../../components/Navbar";
import AnalysisResults from "../../../components/AnalysisResults";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { AnaliseCompletaResponse } from "../../../interfaces/api.types"; // Este também estava incorreto, mas não gerou erro antes
import { AxiosError } from "axios";

export default function AnalysisPage() {
  const { mealId } = useParams() as { mealId: string };
  const router = useRouter();
  const { usuario, carregando, logout } = useAuth();
  const [analysis, setAnalysis] = useState<AnaliseCompletaResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregandoPagina, setCarregandoPagina] = useState(true);

  useEffect(() => {
    if (!carregando && !usuario) {
      router.push("/login");
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setCarregandoPagina(true);
        const response = await api.get<AnaliseCompletaResponse>(
          `/api/v1/refeicoes/detalhe/${mealId}`
        );
        setAnalysis(response.data);
      } catch (error) {
        console.error("Erro ao buscar análise:", error);
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 403 || axiosError.response?.status === 401) {
          setErro("Permissão negada. Faça login novamente.");
        } else {
          setErro("Não foi possível carregar a análise da refeição.");
        }
      } finally {
        setCarregandoPagina(false);
      }
    };

    if (usuario) fetchAnalysis();
  }, [usuario, carregando, mealId, router]);

  if (carregando || carregandoPagina) {
    return <div className="flex min-h-screen justify-center items-center">Carregando...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onLogout={logout} />
      <main className="flex-1 max-w-4xl mx-auto p-4 lg:p-8">
        <h1 className="text-2xl font-bold text-green-800 mb-4">Análise Detalhada</h1>
        {erro && (
          <p className="text-center bg-red-100 text-red-700 p-3 rounded-lg mb-4">{erro}</p>
        )}
        {analysis && <AnalysisResults analysisResult={analysis} />}
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Voltar para Dashboard
        </button>
      </main>
    </div>
  );
}
