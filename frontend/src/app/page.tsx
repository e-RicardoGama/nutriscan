// frontend_nutri/src/app/page.tsx - VERSÃO COMPLETA E CORRIGIDA (FLUXO PROGRESSIVO)

"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '../services/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Check, Pencil, Trash2 } from 'lucide-react';

// --- Interfaces da API ---

// (Scan Rápido)
interface ScanRapidoAlimento { nome: string; categoria: string; quantidade_estimada_g: number; confianca: 'alta' | 'media' | 'baixa' | 'corrigido'; calorias_estimadas: number; medida_caseira_sugerida?: string;}
interface ScanRapidoResultado { modalidade?: string; alimentos_extraidos?: ScanRapidoAlimento[]; resumo_nutricional?: { total_calorias: number; total_proteinas_g: number; total_carboidratos_g: number; total_gorduras_g: number; }; alertas?: string[]; erro?: string; }
interface ScanRapidoResponse { status: string; modalidade: string; resultado: ScanRapidoResultado; timestamp: string; }

// (Análise Detalhada via Lista)
interface AlimentoDetalhado { nome: string; quantidade_gramas: number; metodo_preparo: string; medida_caseira_sugerida?: string; }
interface Macronutrientes { proteinas_g: number; carboidratos_g: number; gorduras_g: number; }
interface AnaliseNutricional { calorias_totais: number; macronutrientes: Macronutrientes; vitaminas_minerais: string[]; }
interface Recomendacoes { pontos_positivos: string[]; sugestoes_balanceamento: string[]; alternativas_saudaveis: string[]; }

// Resposta do endpoint /refeicoes/analisar-lista-detalhada
interface AnaliseCompletaResponse { 
    detalhes_prato: { alimentos: AlimentoDetalhado[]; }; 
    analise_nutricional: AnaliseNutricional; 
    recomendacoes: Recomendacoes; 
    timestamp?: string; 
}
// --- Fim das Interfaces ---


// --- COMPONENTE DO ACORDEÃO (sem alterações) ---
type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  colorClasses: string;
};

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onClick, colorClasses }) => {
  return (
    <div className={`border rounded-lg shadow-sm overflow-hidden ${colorClasses}`}>
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center p-4 font-semibold text-left"
      >
        <span>{title}</span>
        <ChevronDown
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-gray-700 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};


// --- COMPONENTE SCANRESULTS (Com handlers e botão confirmar sempre ativo) ---
const ScanResults = ({ 
    scanResult,
    onConfirm,
    onEdit,
    onDelete
}: { 
    scanResult: ScanRapidoResponse | null;
    onConfirm: (index: number) => void;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}) => {
    if (!scanResult?.resultado) return null;

    const { alimentos_extraidos, alertas } = scanResult.resultado;

    const confiancaStyles: Record<ScanRapidoAlimento['confianca'], string> = {
        alta: 'bg-green-100 text-green-800',
        media: 'bg-yellow-100 text-yellow-800',
        baixa: 'bg-red-100 text-red-800',
        corrigido: 'bg-blue-100 text-blue-800',
    };

    return (
        <>
            {alimentos_extraidos && alimentos_extraidos.length > 0 && (
                <div className="mb-6">
                    <h2 className="font-semibold text-md text-green-800 mb-2 text-left">Alimentos Identificados:</h2>
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-green-700">Alimento</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold uppercase text-green-700">Ações</th>
                                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-green-700">Calorias</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold uppercase text-green-700">Confiança</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {alimentos_extraidos.map((alimento, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                            {alimento.nome}
                                            <span className="block text-xs text-gray-500">{alimento.quantidade_estimada_g}g ({alimento.categoria})</span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex justify-center items-center space-x-2">
                                                <button 
                                                    onClick={() => onConfirm(index)}
                                                    className="p-1 text-green-600 rounded-full hover:bg-green-100" // Botão sempre ativo
                                                    title="Confirmar"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => onEdit(index)}
                                                    className="p-1 text-blue-600 rounded-full hover:bg-blue-100"
                                                    title="Editar"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => onDelete(index)}
                                                    className="p-1 text-red-600 rounded-full hover:bg-red-100"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                        
                                        <td className="py-3 px-4 text-sm text-gray-500 text-right">{alimento.calorias_estimadas}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${confiancaStyles[alimento.confianca] || confiancaStyles.baixa}`}>
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
            {alertas && alertas.length > 0 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                    <h4 className="font-semibold text-yellow-800 mb-2">Alertas:</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700">
                        {alertas.map((alerta, index) => <li key={index}>{alerta}</li>)}
                    </ul>
                </div>
            )}
        </>
    );
};


// --- COMPONENTE ANALYSISRESULTS ("read-only", simplificado) ---
const AnalysisResults = ({ analysisResult }: { analysisResult: AnaliseCompletaResponse | null }) => {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    if (!analysisResult) {
        return null;
    }

    const handleAccordionClick = (id: string) => {
        setOpenAccordion(currentOpen => (currentOpen === id ? null : id));
    };

    const { detalhes_prato, analise_nutricional, recomendacoes } = analysisResult;
    
    return (
        <div className="space-y-8 mt-6 pt-6 border-t">
            {detalhes_prato?.alimentos?.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-semibold text-md text-green-800 mb-2 text-left">Análise Detalhada:</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-blue-700">Alimento</th>
                                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-blue-700">Quantidade (g)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {detalhes_prato.alimentos.map((alimento, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{alimento.nome}</td>
                                        <td className="py-3 px-4 text-sm text-gray-500 text-right">{alimento.quantidade_gramas}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Análise Nutricional */}
            <div className="mb-6 text-left">
                <h3 className="font-semibold text-md text-green-800 mb-2">Análise Nutricional:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800">Calorias Totais</h4>
                        <p className="text-xl font-bold text-blue-600">{analise_nutricional.calorias_totais} kcal</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800">Macronutrientes</h4>
                        <p className="text-sm text-green-700">
                            Proteínas: {analise_nutricional.macronutrientes?.proteinas_g}g<br/>
                            Carboidratos: {analise_nutricional.macronutrientes?.carboidratos_g}g<br/>
                            Gorduras: {analise_nutricional.macronutrientes?.gorduras_g}g
                        </p>
                    </div>
                </div>
                {analise_nutricional.vitaminas_minerais?.length > 0 && (
                    <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-800">Vitaminas e Minerais Principais</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {analise_nutricional.vitaminas_minerais.map((vitamina, index) => (
                                <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                    {vitamina}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Recomendações */}
            <div className="mb-6">
                <h3 className="font-semibold text-lg text-green-800 mb-3 text-left">Recomendações:</h3>
                <div className="space-y-3">
                    <AccordionItem title="Pontos Positivos" isOpen={openAccordion === 'positivos'} onClick={() => handleAccordionClick('positivos')} colorClasses="bg-green-50 border-green-200 text-green-800">
                        <ul className="list-disc list-inside text-sm space-y-1 text-left">{recomendacoes.pontos_positivos.map((ponto, index) => <li key={index}>{ponto}</li>)}</ul>
                    </AccordionItem>
                    <AccordionItem title="Sugestões de Balanceamento" isOpen={openAccordion === 'balanceamento'} onClick={() => handleAccordionClick('balanceamento')} colorClasses="bg-orange-50 border-orange-200 text-orange-800">
                        <ul className="list-disc list-inside text-sm space-y-1 text-left">{recomendacoes.sugestoes_balanceamento.map((sugestao, index) => <li key={index}>{sugestao}</li>)}</ul>
                    </AccordionItem>
                    <AccordionItem title="Alternativas Saudáveis" isOpen={openAccordion === 'alternativas'} onClick={() => handleAccordionClick('alternativas')} colorClasses="bg-sky-50 border-sky-200 text-sky-800">
                        <ul className="list-disc list-inside text-sm space-y-1 text-left">{recomendacoes.alternativas_saudaveis.map((alternativa, index) => <li key={index}>{alternativa}</li>)}</ul>
                    </AccordionItem>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function Home() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [fotoCapturada, setFotoCapturada] = useState<File | null>(null);
//    const [currentImage, setCurrentImage] = useState<File | null>(null); // ✅ VARIÁVEL ADICIONADA
    const [totais, setTotais] = useState({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
    const router = useRouter();
    const { usuario, carregando, logout } = useAuth();

    // Estados para o fluxo
    const [loading, setLoading] = useState<boolean>(false); 
    const [apiError, setApiError] = useState<string | null>(null); 
    const [scanResult, setScanResult] = useState<ScanRapidoResponse | null>(null);
    
    const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnaliseCompletaResponse | null>(null);
    
    // Proteção de Rota
    useEffect(() => {
        if (!carregando && !usuario) {
            router.push('/login');
        }
    }, [usuario, carregando, router]);

    // Calcula os totais nutricionais
    useEffect(() => {
        if (analysisResult?.analise_nutricional) {
            const { calorias_totais, macronutrientes } = analysisResult.analise_nutricional;
            setTotais({ kcal: calorias_totais || 0, protein: macronutrientes?.proteinas_g || 0, carbs: macronutrientes?.carboidratos_g || 0, fats: macronutrientes?.gorduras_g || 0 });
        } else if (scanResult?.resultado?.resumo_nutricional) {
            const { total_calorias, total_proteinas_g, total_carboidratos_g, total_gorduras_g } = scanResult.resultado.resumo_nutricional;
            setTotais({ kcal: total_calorias || 0, protein: total_proteinas_g || 0, carbs: total_carboidratos_g || 0, fats: total_gorduras_g || 0 });
        } else if (scanResult?.resultado?.alimentos_extraidos) {
            let kcal = 0;
            scanResult.resultado.alimentos_extraidos.forEach(alimento => { kcal += alimento.calorias_estimadas || 0; });
            setTotais({ kcal: kcal, protein: 0, carbs: 0, fats: 0 });
        } else {
            setTotais({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
        }
    }, [analysisResult, scanResult]);

    // Função para rodar o Scan Rápido
    const runScan = async (file: File) => {
        setLoading(true);
        setApiError(null);
        setScanResult(null);
        setAnalysisResult(null); 
        setAnalysisError(null); 

        const formData = new FormData();
        formData.append('imagem', file); 
        
        try {
            const response = await api.post<ScanRapidoResponse>('/api/v1/refeicoes/scan-rapido', formData);
            setScanResult(response.data);
        } catch (error) {
            // ✅ CORREÇÃO 1: Usando const e simplificado
            const defaultErrorMessage = "Ocorreu um erro ao escanear a imagem.";
            if (error instanceof AxiosError) {
                const detail = error.response?.data?.detail;
                setApiError(typeof detail === 'string' ? detail : error.message || defaultErrorMessage);
            } else if (error instanceof Error) {
                setApiError(error.message);
            } else {
                setApiError(defaultErrorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ CORREÇÃO 3: Removido o eslint-disable
    useEffect(() => {
        if (fotoCapturada) {
            runScan(fotoCapturada);
        }
    }, [fotoCapturada]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageUrl(URL.createObjectURL(file));
            setFotoCapturada(file); 
        }
        event.target.value = '';
    };

    const handleClearScreen = () => {
        setImageUrl(null);
        setFotoCapturada(null);
        setAnalysisResult(null);
        setScanResult(null);
        setApiError(null);
        setAnalysisError(null);
        setTotais({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
    };

    // ✅ CORREÇÃO 4, 5, 6: Handlers para ScanResult FUNCIONAIS
    const handleConfirmFood = (indexToConfirm: number) => {
        setScanResult(prevResult => {
            if (!prevResult?.resultado?.alimentos_extraidos) return prevResult;
            const newAlimentos = prevResult.resultado.alimentos_extraidos.map((item, index) => {
                if (index === indexToConfirm) {
                    return { ...item, confianca: 'alta' as const }; 
                }
                return item;
            });
             return { ...prevResult, resultado: { ...prevResult.resultado, alimentos_extraidos: newAlimentos } };
        });
    };

    const handleEditFood = (indexToEdit: number) => {
        const alimento = scanResult?.resultado?.alimentos_extraidos?.[indexToEdit];
        const novoNome = prompt("Corrija o nome do alimento:", alimento?.nome);

        if (novoNome && novoNome !== alimento?.nome) {
            setScanResult(prevResult => {
                if (!prevResult?.resultado?.alimentos_extraidos) return prevResult;
                const newAlimentos = prevResult.resultado.alimentos_extraidos.map((item, index) => {
                    if (index === indexToEdit) {
                        return { ...item, nome: novoNome, confianca: 'corrigido' as const }; 
                    }
                    return item;
                });
                const oldAlertas = prevResult.resultado.alertas || [];
                return { ...prevResult, resultado: { ...prevResult.resultado, alimentos_extraidos: newAlimentos, resumo_nutricional: undefined, alertas: [...oldAlertas, "Item editado. Os totais de macros podem estar desatualizados."] } };
            });
        }
    };

    const handleDeleteFood = (indexToDelete: number) => {
        setScanResult(prevResult => {
            if (!prevResult?.resultado?.alimentos_extraidos) return prevResult;
            const newAlimentos = prevResult.resultado.alimentos_extraidos.filter((_, index) => index !== indexToDelete);
            const oldAlertas = prevResult.resultado.alertas || [];
            return { ...prevResult, resultado: { ...prevResult.resultado, alimentos_extraidos: newAlimentos, resumo_nutricional: undefined, alertas: [...oldAlertas, "Item removido. Os totais de macros podem estar desatualizados."] } };
        });
    };
    // --- Fim dos Handlers do ScanResult ---

    // Função para buscar a Análise Detalhada
    const fetchDetailedAnalysis = async () => {
        setLoadingAnalysis(true);
        setAnalysisError(null);
        
        try {
            if (!fotoCapturada) {
                throw new Error('Nenhuma imagem disponível para análise detalhada');
            }

            const formData = new FormData();
            formData.append('file', fotoCapturada);
            
            const response = await api.post<AnaliseCompletaResponse>(
                '/refeicoes/analisar-imagem-detalhado', 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            if (response.data && response.data.detalhes_prato) {
                // ✅ LIMPA OS RESULTADOS DO SCAN RÁPIDO QUANDO A ANÁLISE DETALHADA É GERADA
                setScanResult(null);
                setAnalysisResult(response.data);
            } else {
                throw new Error('Resposta da análise detalhada em formato inválido');
            }
            
        } catch (error) {
            console.error('Erro na análise detalhada:', error);
            const defaultErrorMessage = "Ocorreu um erro ao gerar a análise detalhada.";
            
            if (error instanceof AxiosError) {
                const detail = error.response?.data?.detail;
                if (typeof detail === 'string') {
                    setAnalysisError(detail);
                } else if (error.response?.data?.erro) {
                    setAnalysisError(error.response.data.erro);
                } else if (error.message) {
                    setAnalysisError(error.message);
                } else {
                    setAnalysisError(defaultErrorMessage);
                }
            } else if (error instanceof Error) {
                setAnalysisError(error.message);
            } else {
                setAnalysisError(defaultErrorMessage);
            }
        } finally {
            setLoadingAnalysis(false);
        }
    };

    // Loader principal
    if (carregando) { return <div className="flex justify-center items-center min-h-screen">Carregando...</div>; }
    if (!usuario) { return null; }

    // JSX principal da página
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <Navbar onLogout={logout} />
            <main className="flex-grow w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-4 lg:p-8">
                    
                    {/* --- COLUNA DA ESQUERDA (IMAGEM) --- */}
                    <div className="flex flex-col text-center">
                        <h3 className="text-md px-2 font-bold text-green-800">1. Fotografe seu prato</h3>
                        <p className="text-sm text-gray-600 mt-2 px-4">
                            Eu uso IA para analisar sua foto 🧠. Ainda estou aprendendo, 
                            então se eu errar, use os ícones de ação para me corrigir!
                        </p>
                        
                        {!imageUrl && (
                            <label htmlFor="upload-inicial" className="w-full sm:w-auto cursor-pointer bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition hover:bg-blue-600 shadow-md mt-4">
                                📸 Abrir Câmera / Escolher Foto
                                <input type="file" id="upload-inicial" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload}/>
                            </label>
                        )}
                        
                        {imageUrl && (
                            <div className="w-full mt-4">
                                <div className="relative w-full max-w-lg mx-auto aspect-square bg-white rounded-xl overflow-hidden mb-6 shadow-2xl">
                                    <Image src={imageUrl} alt="Prato a ser analisado" fill className="object-cover" />
                                </div>
                                <button onClick={handleClearScreen} className="w-full sm:w-auto bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition hover:bg-red-600 shadow-md">
                                    Limpar Foto
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* --- COLUNA DA DIREITA (RESULTADOS) --- */}
                    <div className="flex flex-col">
                        <h3 className="text-md px-2 font-bold text-green-800 text-center">2. Revise os Alimentos</h3>
                        
                        {/* Legenda dos ícones */}
                        <div className="flex justify-center items-center gap-4 sm:gap-6 mt-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1"><Check size={16} className="text-green-600" /><span>Confirmar</span></div>
                            <div className="flex items-center gap-1"><Pencil size={16} className="text-blue-600" /><span>Editar</span></div>
                            <div className="flex items-center gap-1"><Trash2 size={16} className="text-red-600" /><span>Apagar</span></div>
                        </div>
                        
                        {/* Área de Resultados */}
                        <div className="w-full results-container space-y-6 mt-8">
    
                            {loading && <div className="p-4 text-lg font-semibold text-gray-600 animate-pulse text-center">Analisando imagem...</div>}
                            {apiError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">{apiError}</div>}

                            {/* ✅ MOSTRA SCAN RESULTS APENAS SE NÃO HOUVER ANALYSIS RESULT */}
                            {scanResult && !analysisResult && (
                                <ScanResults 
                                    scanResult={scanResult} 
                                    onConfirm={handleConfirmFood}
                                    onEdit={handleEditFood}
                                    onDelete={handleDeleteFood}
                                />
                            )}
                            
                            {/* Botão para Análise Detalhada - APENAS QUANDO HÁ SCAN MAS NÃO HÁ ANÁLISE */}
                            {!loading && scanResult && !analysisResult && (
                                <div className="mt-6 text-center">
                                    <h3 className="text-md px-2 font-bold text-green-800 text-center mb-4">3. Gere a Análise Completa</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Obtenha uma análise nutricional completa com calorias precisas, macronutrientes, 
                                        vitaminas e recomendações personalizadas
                                    </p>
                                    <button 
                                        onClick={fetchDetailedAnalysis} 
                                        disabled={loadingAnalysis || !scanResult.resultado?.alimentos_extraidos?.length}
                                        className="w-full sm:w-auto cursor-pointer bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition hover:bg-blue-600 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {loadingAnalysis ? 'Gerando Análise...' : 'Gerar Análise Nutricional Completa'}
                                    </button>
                                </div>
                            )}

                            {loadingAnalysis && <div className="p-4 text-lg font-semibold text-gray-600 animate-pulse text-center">Gerando análise detalhada...</div>}
                            {analysisError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">{analysisError}</div>}

                            {/* ✅ ANALYSIS RESULTS SUBSTITUI O SCAN RESULTS */}
                            {analysisResult && (
                                <AnalysisResults analysisResult={analysisResult} />
                            )}
                            
                            {/* Resumo Nutricional - MOSTRA PARA AMBOS OS CASOS */}
                            {(!loading && !loadingAnalysis) && (scanResult || analysisResult) && (
                                <div className="bg-gray-100 p-4 rounded-lg mt-8">
                                    <h4 className="font-semibold text-green-800 mb-2 text-base md:text-lg text-center">Resumo Nutricional Geral</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div><p className="text-2xl font-bold text-blue-600">{totais.kcal.toFixed(0)}</p><p className="text-xs text-gray-600">Calorias</p></div>
                                        {totais.protein > 0 || totais.carbs > 0 || totais.fats > 0 ? (
                                            <>
                                                <div><p className="text-2xl font-bold text-green-600">{totais.protein.toFixed(1)}g</p><p className="text-xs text-gray-600">Proteínas</p></div>
                                                <div><p className="text-2xl font-bold text-orange-600">{totais.carbs.toFixed(1)}g</p><p className="text-xs text-gray-600">Carboidratos</p></div>
                                                <div><p className="text-2xl font-bold text-red-600">{totais.fats.toFixed(1)}g</p><p className="text-xs text-gray-600">Gorduras</p></div>
                                            </>
                                        ) : (
                                            <div className="col-span-3 text-sm text-gray-500 text-center flex items-center justify-center">
                                                <p>(Macros disponíveis após a análise detalhada).</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}