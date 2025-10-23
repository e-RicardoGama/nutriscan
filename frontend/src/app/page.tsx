// frontend_nutri/src/app/page.tsx - VERSÃO COMPLETA E CORRIGIDA

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
import { ChevronDown, Check, Pencil, Trash2 } from 'lucide-react';

// --- Interfaces ---
interface AlimentoDetalhado { nome: string; quantidade_gramas: number; metodo_preparo: string; medida_caseira_sugerida?: string; }
interface Macronutrientes { proteinas_g: number; carboidratos_g: number; gorduras_g: number; }
interface AnaliseNutricional { calorias_totais: number; macronutrientes: Macronutrientes; vitaminas_minerais: string[]; }
interface Recomendacoes { pontos_positivos: string[]; sugestoes_balanceamento: string[]; alternativas_saudaveis: string[]; }

// Resposta da API (Análise)
interface AnaliseCompletaResponse { 
    detalhes_prato: { alimentos: AlimentoDetalhado[]; }; 
    analise_nutricional: AnaliseNutricional; 
    recomendacoes: Recomendacoes; 
    timestamp?: string; 
}

// Resposta da API (Scan)
interface ScanRapidoAlimento { nome: string; categoria: string; quantidade_estimada_g: number; confianca: 'alta' | 'media' | 'baixa' | 'corrigido'; calorias_estimadas: number; medida_caseira_sugerida?: string;}
interface ScanRapidoResultado { modalidade?: string; alimentos_extraidos?: ScanRapidoAlimento[]; resumo_nutricional?: { total_calorias: number; total_proteinas_g: number; total_carboidratos_g: number; total_gorduras_g: number; }; alertas?: string[]; erro?: string; }
interface ScanRapidoResponse { status: string; modalidade: string; resultado: ScanRapidoResultado; timestamp: string; }

// --- Novos Tipos para o Estado da UI ---
type AlimentoEstado = 'sugerido' | 'confirmado' | 'corrigido';

interface AlimentoDetalhadoComEstado extends AlimentoDetalhado {
    estado: AlimentoEstado;
}

// Tipo que o STATE `analysisResult` usará
interface AnaliseCompletaState {
    detalhes_prato: { alimentos: AlimentoDetalhadoComEstado[]; };
    analise_nutricional?: AnaliseNutricional; // Opcional
    recomendacoes?: Recomendacoes; // Opcional
    timestamp?: string;
    alertas?: string[];
}
// --- Fim dos Tipos ---


// --- COMPONENTE DO ACORDEÃO (Correto) ---
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


// --- COMPONENTE SCANRESULTS (Correto) ---
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
                    <h2 className="font-semibold text-md text-green-800 mb-2 text-left">Alimentos Identificados (Scan Rápido):</h2>
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-green-700">Alimento</th>
                                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-green-700">Calorias</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold uppercase text-green-700">Confiança</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold uppercase text-green-700">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {alimentos_extraidos.map((alimento, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm font-medium text-left text-gray-900">
                                            {alimento.nome}
                                            <span className="block text-xs text-gray-500">{alimento.quantidade_estimada_g}g ({alimento.categoria})</span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500 text-right">{alimento.calorias_estimadas}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${confiancaStyles[alimento.confianca] || confiancaStyles.baixa}`}>
                                                {alimento.confianca}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex justify-center items-center space-x-2">
                                                <button 
                                                    onClick={() => onConfirm(index)}
                                                    className="p-1 text-green-600 rounded-full hover:bg-green-100 disabled:text-gray-300 disabled:hover:bg-transparent"
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


// --- COMPONENTE ANALYSISRESULTS (Correto e com a tabela que você pediu) ---
const AnalysisResults = ({ 
    analysisResult,
    onConfirm,
    onEdit,
    onDelete
}: { 
    analysisResult: AnaliseCompletaState | null; // Usa o tipo de State com 'estado'
    onConfirm: (index: number) => void;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}) => {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    if (!analysisResult) {
        return null;
    }

    // Constante de estilos que você pediu
    const confiancaStyles: Record<AlimentoEstado, string> = {
        sugerido: 'bg-yellow-100 text-yellow-800',
        confirmado: 'bg-green-100 text-green-800',
        corrigido: 'bg-blue-100 text-blue-800',
    };

    const handleAccordionClick = (id: string) => {
        setOpenAccordion(currentOpen => (currentOpen === id ? null : id));
    };

    const { detalhes_prato, analise_nutricional, recomendacoes, alertas } = analysisResult;
    
    // Função para renderizar alertas (se houver)
    const renderAlertas = () => (
        alertas && alertas.length > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-yellow-800 mb-2">Avisos:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                    {alertas.map((alerta, index) => <li key={index}>{alerta}</li>)}
                </ul>
            </div>
        )
    );

    return (
        <div className="space-y-8">
            {renderAlertas()}
            
            {/* Tabela interativa que você pediu */}
            {detalhes_prato?.alimentos?.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-semibold text-md text-green-800 mb-2 text-left">Alimentos Identificados (Análise Detalhada):</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-blue-700">Alimento</th>
                                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-blue-700">Quantidade (g)</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold uppercase text-blue-700">Confiança</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold uppercase text-blue-700">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {detalhes_prato.alimentos.map((alimento, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-left font-medium text-gray-900">
                                            {alimento.nome}
                                            <span className="block text-xs text-gray-500">{alimento.metodo_preparo}</span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500 text-right">{alimento.quantidade_gramas}</td>
                                        
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${confiancaStyles[alimento.estado]}`}>
                                                {alimento.estado}
                                            </span>
                                        </td>
                                        
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex justify-center items-center space-x-2">
                                                <button 
                                                    onClick={() => onConfirm(index)}
                                                    disabled={alimento.estado === 'confirmado'}
                                                    className="p-1 text-green-600 rounded-full hover:bg-green-100 disabled:text-gray-300 disabled:hover:bg-transparent"
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Restante do componente (Análise Nutricional, Recomendações) */}
            {analise_nutricional && (
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
            )}
            
            {recomendacoes && (
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
            )}
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function Home() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);
    
    // ✅ CORREÇÃO 1: O tipo do state `analysisResult` deve ser o novo `AnaliseCompletaState`
    const [analysisResult, setAnalysisResult] = useState<AnaliseCompletaState | null>(null);
    
    const [scanResult, setScanResult] = useState<ScanRapidoResponse | null>(null);
    const [activeMode, setActiveMode] = useState<'analysis' | 'scan' | null>(null);
    const [totais, setTotais] = useState({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
    const [fotoCapturada, setFotoCapturada] = useState<File | null>(null);
    const router = useRouter();
    const { usuario, carregando, logout } = useAuth();

    // Proteção de Rota
    useEffect(() => {
        if (!carregando && !usuario) {
            router.push('/login');
        }
    }, [usuario, carregando, router]);

    // Calcula os totais nutricionais
    useEffect(() => {
        setTotais({ kcal: 0, protein: 0, carbs: 0, fats: 0 });

        if (analysisResult?.analise_nutricional) {
            const { calorias_totais, macronutrientes } = analysisResult.analise_nutricional;
            setTotais({ kcal: calorias_totais || 0, protein: macronutrientes?.proteinas_g || 0, carbs: macronutrientes?.carboidratos_g || 0, fats: macronutrientes?.gorduras_g || 0 });
        } else if (scanResult?.resultado?.resumo_nutricional) {
            const { total_calorias, total_proteinas_g, total_carboidratos_g, total_gorduras_g } = scanResult.resultado.resumo_nutricional;
            setTotais({ kcal: total_calorias || 0, protein: total_proteinas_g || 0, carbs: total_carboidratos_g || 0, fats: total_gorduras_g || 0 });
        } else if (scanResult?.resultado?.alimentos_extraidos) {
            let kcal = 0;
            scanResult.resultado.alimentos_extraidos.forEach(alimento => {
                kcal += alimento.calorias_estimadas || 0;
            });
            setTotais({ kcal: kcal, protein: 0, carbs: 0, fats: 0 });
        }
    }, [analysisResult, scanResult]);

    // Função de analisar imagem
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
                // Recebe o tipo `AnaliseCompletaResponse` da API
                const response = await api.post<AnaliseCompletaResponse>(endpoint, formData);
                
                // Transforma a resposta da API para o tipo `AnaliseCompletaState`
                const alimentosComEstado: AlimentoDetalhadoComEstado[] = 
                    response.data.detalhes_prato.alimentos.map(alimento => ({
                        ...alimento,
                        estado: 'sugerido' as const // Adiciona o estado inicial
                    }));

                // Salva o novo objeto transformado no state
                setAnalysisResult({
                    ...response.data,
                    detalhes_prato: {
                        alimentos: alimentosComEstado
                    }
                });
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
            } else if (error instanceof Error) { errorMessage = error.message; }
            setApiError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageUrl(URL.createObjectURL(file));
            setFotoCapturada(file);
        }
        event.target.value = '';
    };

    const iniciarAnalise = (modo: 'analysis' | 'scan') => {
        if (fotoCapturada) {
            analyzeImage(fotoCapturada, modo);
        } else {
            setApiError("Nenhuma foto foi capturada para ser analisada.");
        }
    };

    const handleClearScreen = () => {
        setImageUrl(null);
        setAnalysisResult(null);
        setScanResult(null);
        setApiError(null);
        setActiveMode(null);
        setTotais({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
        setFotoCapturada(null);
    };

    // --- Handlers para ScanResult ---
    
    const handleConfirmFood = (indexToConfirm: number) => {
        setScanResult(prevResult => {
            if (!prevResult?.resultado?.alimentos_extraidos) return prevResult;
            const newAlimentos = prevResult.resultado.alimentos_extraidos.map((item, index) => {
                if (index === indexToConfirm) {
                    return { ...item, confianca: 'alta' as const }; 
                }
                return item;
            });
             return {
                ...prevResult,
                resultado: {
                    ...prevResult.resultado,
                    alimentos_extraidos: newAlimentos,
                }
            };
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
                return {
                    ...prevResult,
                    resultado: {
                        ...prevResult.resultado,
                        alimentos_extraidos: newAlimentos,
                        resumo_nutricional: undefined,
                        alertas: [...oldAlertas, "Item editado. Os totais de macros podem estar desatualizados."]
                    }
                };
            });
        }
    };

    const handleDeleteFood = (indexToDelete: number) => {
        setScanResult(prevResult => {
            if (!prevResult?.resultado?.alimentos_extraidos) return prevResult;
            const newAlimentos = prevResult.resultado.alimentos_extraidos.filter(
                (_, index) => index !== indexToDelete
            );
            const oldAlertas = prevResult.resultado.alertas || [];
            return {
                ...prevResult,
                resultado: {
                    ...prevResult.resultado,
                    alimentos_extraidos: newAlimentos,
                    resumo_nutricional: undefined,
                    alertas: [...oldAlertas, "Item removido. Os totais de macros podem estar desatualizados."]
                }
            };
        });
    };

    // ✅ CORREÇÃO 2: Adicionar os Handlers para o `analysisResult`
    
    const handleAnalysisConfirmFood = (indexToConfirm: number) => {
        setAnalysisResult(prevResult => {
            if (!prevResult?.detalhes_prato?.alimentos) return prevResult;

            const newAlimentos = prevResult.detalhes_prato.alimentos.map((item, index) => {
                if (index === indexToConfirm) {
                    return { ...item, estado: 'confirmado' as const }; 
                }
                return item;
            });

             return {
                ...prevResult,
                detalhes_prato: {
                    ...prevResult.detalhes_prato,
                    alimentos: newAlimentos,
                },
                // Confirmar NÃO invalida os totais
            };
        });
    };

    const handleAnalysisEditFood = (indexToEdit: number) => {
        const alimento = analysisResult?.detalhes_prato?.alimentos?.[indexToEdit];
        const novoNome = prompt("Corrija o nome do alimento:", alimento?.nome);

        if (novoNome && novoNome !== alimento?.nome) {
            setAnalysisResult(prevResult => {
                if (!prevResult?.detalhes_prato?.alimentos) return prevResult;

                const newAlimentos = prevResult.detalhes_prato.alimentos.map((item, index) => {
                    if (index === indexToEdit) {
                        return { ...item, nome: novoNome, estado: 'corrigido' as const }; 
                    }
                    return item;
                });
                
                const oldAlertas = prevResult.alertas || [];

                return {
                    ...prevResult,
                    detalhes_prato: { 
                        ...prevResult.detalhes_prato,
                        alimentos: newAlimentos
                    },
                    // Editar invalida os totais
                    analise_nutricional: undefined,
                    recomendacoes: undefined,
                    alertas: [...oldAlertas, "Item editado. A Análise Nutricional foi removida. Para recalcular, clique em 'Análise Detalhada' novamente."]
                };
            });
        }
    };

    const handleAnalysisDeleteFood = (indexToDelete: number) => {
        setAnalysisResult(prevResult => {
            if (!prevResult?.detalhes_prato?.alimentos) return prevResult;

            const newAlimentos = prevResult.detalhes_prato.alimentos.filter(
                (_, index) => index !== indexToDelete
            );

            const oldAlertas = prevResult.alertas || [];

            return {
                ...prevResult,
                detalhes_prato: { 
                    ...prevResult.detalhes_prato,
                    alimentos: newAlimentos
                },
                // Deletar invalida os totais
                analise_nutricional: undefined,
                recomendacoes: undefined,
                alertas: [...oldAlertas, "Item removido. A Análise Nutricional foi removida. Para recalcular, clique em 'Análise Detalhada' novamente."]
            };
        });
    };
    
    // Loader principal
    if (carregando) {
        return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
    }
    if (!usuario) {
        return null;
    }

    // JSX principal da página
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <Navbar onLogout={logout} />
            <main className="flex-grow w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-4 lg:p-8">
                    <div className="flex flex-col text-center">
                        <h3 className="text-md px-2 font-bold text-green-800">Fotografe seu prato</h3>
                        {/* Texto de aviso sempre visível */}
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
                                {loading && <div className="p-4 text-lg font-semibold text-gray-600 animate-pulse">Analisando...</div>}
                                {apiError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{apiError}</div>}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col text-center">
                        <h3 className="text-md px-2 font-bold text-green-800">Selecione a Opção Desejada</h3>
                        <p className="text-sm text-gray-600 mt-2 px-4">
                            Use os ícones de ação para me corrigir!
                        </p>
                        
                        {/* Legenda dos ícones */}
                        <div className="flex justify-center items-center gap-4 sm:gap-6 mt-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Check size={16} className="text-green-600" />
                                <span>Confirmar</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Pencil size={16} className="text-blue-600" />
                                <span>Editar</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Trash2 size={16} className="text-red-600" />
                                <span>Apagar</span>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="text-sm pt-4 px-8 flex flex-col sm:flex-row gap-4 justify-center w-full mb-8">
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
                        
                        {/* Área de Resultados */}
                        {!loading && (analysisResult || scanResult) && (
                            <div className="w-full results-container space-y-6">
                                
                                {activeMode === 'scan' && (
                                    <ScanResults 
                                        scanResult={scanResult} 
                                        onConfirm={handleConfirmFood}
                                        onEdit={handleEditFood}
                                        onDelete={handleDeleteFood}
                                    />
                                )}
                                
                                {/* ✅ CORREÇÃO 3: Passar os novos handlers para o AnalysisResults */}
                                {activeMode === 'analysis' && (
                                    <AnalysisResults 
                                        analysisResult={analysisResult}
                                        onConfirm={handleAnalysisConfirmFood}
                                        onEdit={handleAnalysisEditFood}
                                        onDelete={handleAnalysisDeleteFood}
                                    />
                                )}
                                
                                {/* Resumo Nutricional */}
                                {(analysisResult?.analise_nutricional || scanResult?.resultado) && (
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
                                                    <p>(Macros indisponíveis após edição).</p>
                                                </div>
                                            )}
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