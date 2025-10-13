"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '../services/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

// --- Interfaces (nenhuma mudança aqui) ---
interface AlimentoDetalhado {
    nome: string;
    quantidade_gramas: number;
    metodo_preparo: string;
}
interface Macronutrientes {
    proteinas_g: number;
    carboidratos_g: number;
    gorduras_g: number;
}
interface AnaliseNutricional {
    calorias_totais: number;
    macronutrientes: Macronutrientes;
    vitaminas_minerais: string[];
}
interface Recomendacoes {
    pontos_positivos: string[];
    sugestoes_balanceamento: string[];
    alternativas_saudaveis: string[];
}
interface AnaliseCompletaResponse {
    detalhes_prato: {
        alimentos: AlimentoDetalhado[];
    };
    analise_nutricional: AnaliseNutricional;
    recomendacoes: Recomendacoes;
    timestamp?: string;
}
interface ScanRapidoAlimento {
    nome: string;
    categoria: string;
    quantidade_estimada_g: number;
    confianca: string;
    calorias_estimadas: number;
}
interface ScanRapidoResultado {
    modalidade?: string;
    alimentos_extraidos?: ScanRapidoAlimento[];
    resumo_nutricional?: {
        total_calorias: number;
        total_proteinas_g: number;
        total_carboidratos_g: number;
        total_gorduras_g: number;
    };
    alertas?: string[];
    erro?: string;
}
interface ScanRapidoResponse {
    status: string;
    modalidade: string;
    resultado: ScanRapidoResultado;
    timestamp: string;
}

export default function Home() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnaliseCompletaResponse | null>(null);
    const [scanResult, setScanResult] = useState<ScanRapidoResponse | null>(null);
    const [activeMode, setActiveMode] = useState<'analysis' | 'scan' | null>(null);
    const [totais, setTotais] = useState({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
    const router = useRouter();

    // --- INÍCIO DA ADIÇÃO DA FUNÇÃO LOGOUT ---
    const handleLogout = () => {
        // Remove o token de autenticação da memória do navegador
        localStorage.removeItem('authToken');
        // Redireciona o usuário para a página de login
        router.push('/login');
    };

    // Efeito para verificar se o usuário está logado
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    // ... (o resto do seu código useEffect, analyzeImage, etc. continua igual) ...
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

    const analyzeImage = async (file: File, mode: 'analysis' | 'scan') => {
        setLoading(true);
        setApiError(null);
        setAnalysisResult(null);
        setScanResult(null);
        setActiveMode(mode);
        setTotais({ kcal: 0, protein: 0, carbs: 0, fats: 0 });

        const formData = new FormData();
        formData.append(mode === 'scan' ? 'imagem' : 'file', file);

        try {
            console.log(`📤 Enviando imagem para ${mode === 'scan' ? 'scan rápido' : 'análise detalhada'}...`);
            
            const endpoint = mode === 'scan' 
                ? '/api/refeicoes/scan-rapido'
                : '/api/refeicoes/analisar-imagem-detalhado';

            console.log('🔍 Debug URL:', {
                baseURL: api.defaults.baseURL,
                endpoint: endpoint,
                fullURL: api.defaults.baseURL + endpoint
            });

            // O bloco try agora só trata o sucesso. 
            // Se o backend retornar um erro (status 4xx ou 5xx), o axios vai
            // automaticamente rejeitar a promise e a execução pulará para o bloco CATCH.
            if (mode === 'scan') {
                const response = await api.post<ScanRapidoResponse>(endpoint, formData);
                console.log('✅ Resposta do scan recebida:', response.data);
                setScanResult(response.data); // Apenas define o resultado de sucesso
            } else {
                const response = await api.post<AnaliseCompletaResponse>(endpoint, formData);
                console.log('✅ Resposta da análise recebida:', response.data);
                setAnalysisResult(response.data); // Apenas define o resultado de sucesso
            }

        } catch (error) {
            // O bloco CATCH agora é o único responsável por tratar erros.
            const err = error as AxiosError<{ detail?: string }>;
            console.error('❌ Erro ao chamar o backend:', err);

            const message =
                err.response?.data?.detail || // Pega a mensagem "detail" do FastAPI
                err.message ||
                'Ocorreu um erro desconhecido.';

            setApiError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, mode: 'analysis' | 'scan') => {
        const file = event.target.files?.[0];
        if (file) {
            setImageUrl(URL.createObjectURL(file));
            await analyzeImage(file, mode);
            // Limpa o input para permitir selecionar o mesmo arquivo novamente
            event.target.value = '';
        }
    };

    const renderScanResults = () => {
        if (!scanResult?.resultado) return null;

        const { alimentos_extraidos, alertas } = scanResult.resultado;

        return (
            <>
                {/* Seção de Alimentos Extraídos */}
                {alimentos_extraidos && alimentos_extraidos.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">Alimentos Identificados:</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b">Alimento</th>
                                        <th className="py-2 px-4 border-b">Categoria</th>
                                        <th className="py-2 px-4 border-b">Quantidade (g)</th>
                                        <th className="py-2 px-4 border-b">Calorias</th>
                                        <th className="py-2 px-4 border-b">Confiança</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alimentos_extraidos.map((alimento, index) => (
                                        <tr key={index}>
                                            <td className="py-2 px-4 border-b">{alimento.nome}</td>
                                            <td className="py-2 px-4 border-b">{alimento.categoria}</td>
                                            <td className="py-2 px-4 border-b">{alimento.quantidade_estimada_g}</td>
                                            <td className="py-2 px-4 border-b">{alimento.calorias_estimadas}</td>
                                            <td className="py-2 px-4 border-b">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    alimento.confianca === 'alta' ? 'bg-green-100 text-green-800' :
                                                    alimento.confianca === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {alimento.confianca}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Alertas */}
                {alertas && alertas.length > 0 && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-800 mb-2">Alertas:</h4>
                        <ul className="list-disc list-inside text-sm text-yellow-700">
                            {alertas.map((alerta, index) => (
                                <li key={index}>{alerta}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        );
    };

    const renderAnalysisResults = () => {
        if (!analysisResult) return null;

        return (
            <>
                {/* Seção de Alimentos Reconhecidos */}
                {analysisResult.detalhes_prato?.alimentos?.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">Alimentos Identificados:</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b">Alimento</th>
                                        <th className="py-2 px-4 border-b">Quantidade (g)</th>
                                        <th className="py-2 px-4 border-b">Método de Preparo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analysisResult.detalhes_prato.alimentos.map((alimento, index) => (
                                        <tr key={index}>
                                            <td className="py-2 px-4 border-b">{alimento.nome}</td>
                                            <td className="py-2 px-4 border-b">{alimento.quantidade_gramas}</td>
                                            <td className="py-2 px-4 border-b">{alimento.metodo_preparo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Seção de Análise Nutricional */}
                {analysisResult.analise_nutricional && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">Análise Nutricional:</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded">
                                <h4 className="font-medium text-blue-800">Calorias Totais</h4>
                                <p className="text-2xl font-bold text-blue-600">{analysisResult.analise_nutricional.calorias_totais} kcal</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded">
                                <h4 className="font-medium text-green-800">Macronutrientes</h4>
                                <p className="text-sm text-green-600">
                                    Proteínas: {analysisResult.analise_nutricional.macronutrientes?.proteinas_g}g<br/>
                                    Carboidratos: {analysisResult.analise_nutricional.macronutrientes?.carboidratos_g}g<br/>
                                    Gorduras: {analysisResult.analise_nutricional.macronutrientes?.gorduras_g}g
                                </p>
                            </div>
                        </div>

                        {/* Vitaminas e Minerais */}
                        {analysisResult.analise_nutricional.vitaminas_minerais?.length > 0 && (
                            <div className="mt-4 bg-purple-50 p-4 rounded">
                                <h4 className="font-medium text-purple-800">Vitaminas e Minerais Principais</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {analysisResult.analise_nutricional.vitaminas_minerais.map((vitamina, index) => (
                                        <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                            {vitamina}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Seção de Recomendações */}
                {analysisResult.recomendacoes && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">Recomendações:</h3>
                        <div className="space-y-4">
                            {/* Pontos Positivos */}
                            {analysisResult.recomendacoes.pontos_positivos?.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-green-600">Pontos Positivos:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {analysisResult.recomendacoes.pontos_positivos.map((ponto, index) => (
                                            <li key={index}>{ponto}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Sugestões de Balanceamento */}
                            {analysisResult.recomendacoes.sugestoes_balanceamento?.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-yellow-600">Sugestões de Balanceamento:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {analysisResult.recomendacoes.sugestoes_balanceamento.map((sugestao, index) => (
                                            <li key={index}>{sugestao}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Alternativas Saudáveis */}
                            {analysisResult.recomendacoes.alternativas_saudaveis?.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-blue-600">Alternativas Saudáveis:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {analysisResult.recomendacoes.alternativas_saudaveis.map((alternativa, index) => (
                                            <li key={index}>{alternativa}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </>
        );
    };


    return (
        <main className="flex justify-center items-center min-h-screen font-sans bg-gray-100 p-4">
            <div className="container mx-auto max-w-2xl bg-white shadow-2xl rounded-2xl p-6 md:p-8">
                
                {/* --- INÍCIO DA ADIÇÃO DO BOTÃO LOGOUT --- */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Seu Prato</h1>
                        <p className="text-gray-500">Fotografe seu prato e receba uma análise nutricional inteligente.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white font-bold py-2 px-4 rounded-full transition duration-300 hover:bg-red-600 shadow-lg"
                    >
                        Sair
                    </button>
                </div>
                {/* --- FIM DA ADIÇÃO DO BOTÃO LOGOUT --- */}


                {/* Botões de Upload - LADO A LADO */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    {/* Botão Análise Detalhada */}
                    <div className="text-center">
                        <label htmlFor="analysis-upload" className="cursor-pointer inline-block bg-sky-500 text-white font-bold py-3 px-6 rounded-full transition duration-300 hover:bg-sky-600 shadow-lg w-full sm:w-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4.586-4.586a2 2 0 012.828 0L16 15z" clipRule="evenodd" />
                            </svg>
                            Análise Detalhada
                        </label>
                        <input 
                            type="file" 
                            id="analysis-upload" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'analysis')} 
                        />
                        <p className="text-xs text-gray-500 mt-1">Análise completa + recomendações</p>
                    </div>

                    {/* Botão Scan Rápido */}
                    <div className="text-center">
                        <label htmlFor="scan-upload" className="cursor-pointer inline-block bg-emerald-500 text-white font-bold py-3 px-6 rounded-full transition duration-300 hover:bg-emerald-600 shadow-lg w-full sm:w-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            Scan Rápido
                        </label>
                        <input 
                            type="file" 
                            id="scan-upload" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'scan')} 
                        />
                        <p className="text-xs text-gray-500 mt-1">Identificação rápida + calorias</p>
                    </div>
                </div>

                {imageUrl && (
                    <div id="results-container">
                        <div className="relative w-full max-w-md mx-auto aspect-square bg-gray-200 rounded-xl overflow-hidden mb-6">
                            <Image src={imageUrl} alt="Prato de comida" fill style={{ objectFit: 'cover' }} />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                                {activeMode === 'scan' ? 'Scan Rápido' : 'Análise Detalhada'}
                            </h2>
                            
                            {loading && (
                                <div className="text-center text-gray-500 mb-4">
                                    {activeMode === 'scan' ? 'Escaneando...' : 'Analisando...'}
                                </div>
                            )}
                            
                            {apiError && (
                                <div className="text-red-500 text-center p-2 bg-red-100 rounded">
                                    {apiError}
                                </div>
                            )}

                            {!loading && (
                                <>
                                    {activeMode === 'scan' && renderScanResults()}
                                    {activeMode === 'analysis' && renderAnalysisResults()}

                                    {/* Resumo dos Totais (comum para ambos os modos) */}
                                    {(analysisResult || scanResult) && (
                                        <div className="bg-gray-100 p-4 rounded-lg mt-6">
                                            <h4 className="font-semibold text-gray-800 mb-2">Resumo Nutricional:</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-600">{totais.kcal}</p>
                                                    <p className="text-xs text-gray-600">Calorias</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-green-600">{totais.protein}g</p>
                                                    <p className="text-xs text-gray-600">Proteínas</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-orange-600">{totais.carbs}g</p>
                                                    <p className="text-xs text-gray-600">Carboidratos</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-red-600">{totais.fats}g</p>
                                                    <p className="text-xs text-gray-600">Gorduras</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}