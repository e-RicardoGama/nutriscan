// frontend_nutri/src/app/page.tsx - VERSÃO COMPLETA E FINAL

"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '../services/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import type { HttpValidationError } from '../types/error';

// --- Interfaces ---
interface AlimentoDetalhado { nome: string; quantidade_gramas: number; metodo_preparo: string; medida_caseira_sugerida?: string; }
interface Macronutrientes { proteinas_g: number; carboidratos_g: number; gorduras_g: number; }
interface AnaliseNutricional { calorias_totais: number; macronutrientes: Macronutrientes; vitaminas_minerais: string[]; }
interface Recomendacoes { pontos_positivos: string[]; sugestoes_balanceamento: string[]; alternativas_saudaveis: string[]; }
interface AnaliseCompletaResponse { detalhes_prato: { alimentos: AlimentoDetalhado[]; }; analise_nutricional: AnaliseNutricional; recomendacoes: Recomendacoes; timestamp?: string; }
interface ScanRapidoAlimento { nome: string; categoria: string; quantidade_estimada_g: number; confianca: string; calorias_estimadas: number; medida_caseira_sugerida?: string;}
interface ScanRapidoResultado { modalidade?: string; alimentos_extraidos?: ScanRapidoAlimento[]; resumo_nutricional?: { total_calorias: number; total_proteinas_g: number; total_carboidratos_g: number; total_gorduras_g: number; }; alertas?: string[]; erro?: string; }
interface ScanRapidoResponse { status: string; modalidade: string; resultado: ScanRapidoResultado; timestamp: string; }

export default function Home() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnaliseCompletaResponse | null>(null);
    const [scanResult, setScanResult] = useState<ScanRapidoResponse | null>(null);
    const [activeMode, setActiveMode] = useState<'analysis' | 'scan' | null>(null);
    const [totais, setTotais] = useState({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
    const router = useRouter();
    const [fotoCapturada, setFotoCapturada] = useState<File | null>(null); //
    const { usuario, carregando, logout } = useAuth();
    

    // Proteção de Rota
    useEffect(() => {
        if (!carregando && !usuario) {
            router.push('/login');
        }
    }, [usuario, carregando, router]);

    // Calcula os totais nutricionais quando um resultado chega
    useEffect(() => {
        if (analysisResult?.analise_nutricional) {
            const { calorias_totais, macronutrientes } = analysisResult.analise_nutricional;
            setTotais({
                kcal: calorias_totais || 0,
                protein: macronutrientes?.proteinas_g || 0,
                carbs: macronutrientes?.carboidratos_g || 0,
                fats: macronutrientes?.gorduras_g || 0
            });
        } else if (scanResult?.resultado?.resumo_nutricional) {
            const { total_calorias, total_proteinas_g, total_carboidratos_g, total_gorduras_g } = scanResult.resultado.resumo_nutricional;
            setTotais({
                kcal: total_calorias || 0,
                protein: total_proteinas_g || 0,
                carbs: total_carboidratos_g || 0,
                fats: total_gorduras_g || 0
            });
        }
    }, [analysisResult, scanResult]);
    

    // Função para enviar imagem para análise
    const analyzeImage = async (file: File, mode: 'analysis' | 'scan') => {
        setLoading(true);
        setApiError(null);
        setAnalysisResult(null);
        setScanResult(null);
        setActiveMode(mode);
        
        const formData = new FormData();
        const fieldName = mode === 'scan' ? 'imagem' : 'file';
        formData.append(fieldName, file);

        try {
            const endpoint = mode === 'scan' ? '/refeicoes/scan-rapido' : '/refeicoes/analisar-imagem-detalhado';

            if (mode === 'scan') {
                const response = await api.post<ScanRapidoResponse>(endpoint, formData);
                setScanResult(response.data);
            } else {
                const response = await api.post<AnaliseCompletaResponse>(endpoint, formData);
                setAnalysisResult(response.data);
            }
        } catch (error) {
            let errorMessage = "Ocorreu um erro desconhecido.";
            if (error instanceof AxiosError) {
                if (error.response?.status === 422) {
                    const validationData = error.response.data as HttpValidationError;
                    errorMessage = validationData.detail.map(err => err.msg).join('; ');
                } else {
                    const detail = error.response?.data?.detail;
                    errorMessage = typeof detail === 'string' ? detail : error.message;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setApiError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageUrl(URL.createObjectURL(file)); // Mostra a imagem na tela
            setFotoCapturada(file); // Salva o arquivo da imagem no nosso novo estado
            // A chamada para analyzeImage() foi removida daqui!
        }
        event.target.value = ''; // Limpa o input para permitir nova captura
    };

    const iniciarAnalise = (modo: 'analysis' | 'scan') => {
        if (fotoCapturada) {
            // Chama a função de análise original passando a foto que está salva no estado
            analyzeImage(fotoCapturada, modo);
        } else {
            // Apenas uma segurança, caso algo dê errado
            setApiError("Nenhuma foto foi capturada para ser analisada.");
        }
    };

    // Adicione esta função ao seu page.tsx
    const handleClearScreen = () => {
        setImageUrl(null);
        setAnalysisResult(null);
        setScanResult(null);
        setApiError(null);
        setActiveMode(null);
        setTotais({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
    };

    // Função para renderizar os resultados do Scan Rápido
    const renderScanResults = () => {
        if (!scanResult?.resultado) return null;
        const { alimentos_extraidos, alertas } = scanResult.resultado;
        return (
            <div className="space-y-6">
                {alimentos_extraidos && alimentos_extraidos.length > 0 && (
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-green-800">Alimentos Identificados</h3>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-bold text-green-600">Alimento</th>
                                        <th className="px-4 py-2 text-left font-bold text-green-600">Calorias (est.)</th>
                                        <th className="px-4 py-2 text-left font-bold text-green-600">Confiança</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alimentos_extraidos.map((item, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="px-4 py-2">{item.nome}</td>
                                            <td className="px-4 py-2">{item.calorias_estimadas} kcal</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.confianca === 'alta' ? 'bg-green-100 text-green-800' : item.confianca === 'media' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.confianca}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {alertas && alertas.length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <h4 className="font-bold text-yellow-800">Alertas</h4>
                        <ul className="list-disc list-inside mt-2 text-yellow-700">
                            {alertas.map((alerta, index) => <li key={index}>{alerta}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    // Função para renderizar os resultados da Análise Detalhada
    const renderAnalysisResults = () => {
        if (!analysisResult) return null;
        const { detalhes_prato, recomendacoes } = analysisResult;
        return (
            <div className="space-y-8">
                {detalhes_prato?.alimentos && (
                    <div>
                        <h3 className="font-bold text-xl mb-3 text-green-800">Detalhes do Prato</h3>
                        <div className="overflow-x-auto rounded-lg border">
                             <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-bold text-green-600">Alimento</th>
                                        <th className="px-4 py-2 text-left font-bold text-green-600">Quantidade</th>
                                        <th className="px-4 py-2 text-left font-bold text-green-600">Preparo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalhes_prato.alimentos.map((item, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="px-4 py-2">{item.nome}</td>
                                            <td className="px-4 py-2">{item.quantidade_gramas}g</td>
                                            <td className="px-4 py-2">{item.metodo_preparo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {recomendacoes && (
                     <div>
                        <h3 className="font-bold text-xl mb-3 text-green-800">Recomendações Nutricionais</h3>
                        <div className="space-y-4">
                            <div className="bg-green-50 border-l-4 border-green-400 p-4">
                                <h4 className="font-bold text-green-800">Pontos Positivos</h4>
                                <ul className="list-disc list-inside mt-2 text-green-700">
                                    {recomendacoes.pontos_positivos.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                            <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                                <h4 className="font-bold text-orange-800">Sugestões de Balanceamento</h4>
                                <ul className="list-disc list-inside mt-2 text-orange-700">
                                    {recomendacoes.sugestoes_balanceamento.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                             <div className="bg-sky-50 border-l-4 border-sky-400 p-4">
                                <h4 className="font-bold text-sky-800">Alternativas Saudáveis</h4>
                                <ul className="list-disc list-inside mt-2 text-sky-700">
                                    {recomendacoes.alternativas_saudaveis.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                     </div>
                )}
            </div>
        );
    };

    // Loader enquanto o AuthContext verifica o usuário
    if (carregando) {
        return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
    }

    // Evita renderização antes do redirecionamento
    if (!usuario) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <Navbar onLogout={logout} />

            <main className="flex-grow w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-4 lg:p-8">

                    {/* ================================================================== */}
                    {/* COLUNA 1: UPLOAD E IMAGEM                                      */}
                    {/* ================================================================== */}
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-lg md:text-xl py-4 px-8 font-bold text-green-800">
                            Fotografe seu prato
                        </h1>

                        {/* ✅ BOTÃO ATUALIZADO PARA USAR A CÂMERA */}
                        {!imageUrl && (
                            <label htmlFor="upload-inicial" className="w-full sm:w-auto cursor-pointer bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition hover:bg-blue-500 shadow-md">
                                📸 Abrir Câmera / Escolher Foto
                                <input 
                                    type="file" 
                                    id="upload-inicial" 
                                    accept="image/*" 
                                    capture="environment"
                                    className="hidden" 
                                    onChange={handleImageUpload}
                                />
                            </label>
                        )}

                        {/* A imagem capturada aparece aqui */}
                        {imageUrl && (
                            <div className="w-full mt-4">
                                <div className="relative w-full max-w-lg mx-auto aspect-square bg-white rounded-xl overflow-hidden mb-6 shadow-2xl">
                                    <Image src={imageUrl} alt="Prato a ser analisado" fill className="object-cover" />
                                </div>
                                {loading && <div className="p-4 text-lg font-semibold text-gray-600 animate-pulse">Analisando...</div>}
                                {apiError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{apiError}</div>}
                            </div>
                        )}
                    </div>

                    {/* ================================================================== */}
                    {/* COLUNA 2: AÇÕES E RESULTADOS                                   */}
                    {/* ================================================================== */}
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-lg md:text-xl py-4 px-8 font-bold text-green-800">Selecione a Opção Desejada</h1>

                        {/* ✅ BOTÕES DE AÇÃO COM NOVA LÓGICA */}
                        {/* Eles só aparecem QUANDO houver uma imagem */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-8">
                            {/* Botões ficam desabilitados até uma foto ser capturada */}
                            <button onClick={() => iniciarAnalise('analysis')} disabled={!fotoCapturada} className="w-full sm:w-auto cursor-pointer bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition hover:bg-blue-600 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Análise Detalhada
                            </button>
                            <button onClick={() => iniciarAnalise('scan')} disabled={!fotoCapturada} className="w-full sm:w-auto cursor-pointer bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition hover:bg-green-600 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Scan Rápido
                            </button>
                            <button onClick={handleClearScreen} disabled={!fotoCapturada} className="w-full sm:w-auto bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition hover:bg-red-600 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Limpar
                            </button>
                        </div>

                        {/* As tabelas de resultados continuam aparecendo aqui após a análise */}
                        {!loading && (analysisResult || scanResult) && (
                            <div className="w-full results-container space-y-6">
                                {activeMode === 'scan' && renderScanResults()}
                                {activeMode === 'analysis' && renderAnalysisResults()}
                                {(analysisResult || scanResult) && (
                                    <div className="bg-gray-100 p-4 rounded-lg mt-8">
                                        <h4 className="font-semibold text-gray-800 mb-2 text-lg text-center">Resumo Nutricional Geral</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                            <div><p className="text-2xl font-bold text-blue-600">{totais.kcal.toFixed(0)}</p><p className="text-xs text-gray-600">Calorias</p></div>
                                            <div><p className="text-2xl font-bold text-green-600">{totais.protein.toFixed(1)}g</p><p className="text-xs text-gray-600">Proteínas</p></div>
                                            <div><p className="text-2xl font-bold text-orange-600">{totais.carbs.toFixed(1)}g</p><p className="text-xs text-gray-600">Carboidratos</p></div>
                                            <div><p className="text-2xl font-bold text-red-600">{totais.fats.toFixed(1)}g</p><p className="text-xs text-gray-600">Gorduras</p></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}