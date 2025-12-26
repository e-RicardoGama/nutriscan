// frontend/src/app/scan/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '../../services/api';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import EditFoodModal from '../../components/alimentos/EditFoodModal.jsx';
import imageCompression from "browser-image-compression";

import {
  ScanRapidoAlimento,
  ScanRapidoResponse,
  AnaliseCompletaResponse,
  FoodDatabaseItem,
  ModalAlimentoData,
  FoodItem
} from '../../interfaces/api.types';

// --- UTIL: separa vitaminas e minerais a partir de uma lista mista ---
function splitVitsAndMins(lista?: string[]) {
  if (!lista || lista.length === 0) return { vitaminas: [] as string[], minerais: [] as string[] };
  const mineraisConhecidos = [
    'cálcio','calcio','ferro','magnésio','magnesio','fósforo','fosforo','potássio','potassio',
    'sódio','sodio','selênio','selenio','zinco','cobre','manganês','manganes','iodo','iodeto'
  ].map(s => s.toLowerCase());
  const vitaminas: string[] = [];
  const minerais: string[] = [];
  lista.forEach(item => {
    const texto = (item || '').toLowerCase();
    // heurística direta para vitaminas
    if (texto.includes('vitamina') || /^vit[^\s]*/i.test(item) || texto.startsWith('b') && texto.length <= 3) {
      vitaminas.push(item);
      return;
    }
    // se bater com mineral conhecido => mineral
    const isMineral = mineraisConhecidos.some(m => texto.includes(m));
    if (isMineral) {
      minerais.push(item);
      return;
    }
    // fallback por comprimento/estrutura: nomes curtos sem espaço tendem a ser minerais (ex.: ferro, zinco)
    if (texto.length <= 12 && !texto.includes(' ')) {
      minerais.push(item);
      return;
    }
    // caso indeciso, joga em vitaminas (mais informativo ao usuário)
    vitaminas.push(item);
  });
  return { vitaminas, minerais };
}

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
  onEdit,
  onDelete
}: {
  scanResult: ScanRapidoResponse | null;
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

// --- COMPONENTE ANALYSISRESULTS CORRIGIDO ---
const AnalysisResults = ({ analysisResult }: { analysisResult: AnaliseCompletaResponse | null }) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  if (!analysisResult) {
    return null;
  }
  const handleAccordionClick = (id: string) => {
    setOpenAccordion(currentOpen => (currentOpen === id ? null : id));
  };
  const { detalhes_prato, analise_nutricional, recomendacoes } = analysisResult;
  // Calcula valores para o resumo que será exibido aqui — evita duplicidade com o resumo global
  const resumo = {
    kcal: analise_nutricional?.calorias_totais ?? 0,
    proteinas: analise_nutricional?.macronutrientes?.proteinas_g ?? 0,
    carboidratos: analise_nutricional?.macronutrientes?.carboidratos_g ?? 0,
    gorduras: analise_nutricional?.macronutrientes?.gorduras_g ?? 0,
  };
  // prepara vitaminas/minerais para exibição (prefere campos separados quando disponíveis)
  let vitaminasList: string[] = [];
  let mineraisList: string[] = [];
  if (analise_nutricional) {
    if (analise_nutricional.vitaminas?.length || analise_nutricional.minerais?.length) {
      vitaminasList = analise_nutricional.vitaminas ?? [];
      mineraisList = analise_nutricional.minerais ?? [];
    } else if (analise_nutricional.vitaminas_minerais && analise_nutricional.vitaminas_minerais.length) {
      const split = splitVitsAndMins(analise_nutricional.vitaminas_minerais);
      vitaminasList = split.vitaminas;
      mineraisList = split.minerais;
    }
  }
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
      {/* --- RESUMO NUTRICIONAL --- */}
      <div className="mb-6 text-left">
        <h3 className="font-semibold text-md text-green-800 mb-2">Resumo Nutricional</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Calorias Totais</h4>
            <p className="text-xl font-bold text-blue-600">{resumo.kcal} kcal</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Macronutrientes</h4>
            <p className="text-sm text-green-700">
              Proteínas: {resumo.proteinas}g<br/>
              Carboidratos: {resumo.carboidratos}g<br/>
              Gorduras: {resumo.gorduras}g
            </p>
          </div>
        </div>
        {/* Vitaminas e Minerais separados */}
        {(vitaminasList.length > 0 || mineraisList.length > 0) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {vitaminasList.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-800">Vitaminas</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vitaminasList.map((v, i) => (
                    <span key={`vit-${i}`} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mineraisList.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-amber-800">Minerais</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mineraisList.map((m, i) => (
                    <span key={`min-${i}`} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Recomendações */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-green-800 mb-3 text-left">Recomendações:</h3>
        <div className="space-y-3">
          <AccordionItem
            title="Pontos Positivos"
            isOpen={openAccordion === 'positivos'}
            onClick={() => handleAccordionClick('positivos')}
            colorClasses="bg-green-50 border-green-200 text-green-800"
          >
            <ul className="list-disc list-inside text-sm space-y-1 text-left">
              {recomendacoes.pontos_positivos.map((ponto, index) => <li key={index}>{ponto}</li>)}
            </ul>
          </AccordionItem>
          <AccordionItem
            title="Sugestões de Balanceamento"
            isOpen={openAccordion === 'balanceamento'}
            onClick={() => handleAccordionClick('balanceamento')}
            colorClasses="bg-orange-50 border-orange-200 text-orange-800"
          >
            <ul className="list-disc list-inside text-sm space-y-1 text-left">
              {recomendacoes.sugestoes_balanceamento.map((sugestao, index) => <li key={index}>{sugestao}</li>)}
            </ul>
          </AccordionItem>
          <AccordionItem
            title="Alternativas Saudáveis"
            isOpen={openAccordion === 'alternativas'}
            onClick={() => handleAccordionClick('alternativas')}
            colorClasses="bg-sky-50 border-sky-200 text-sky-800"
          >
            <ul className="list-disc list-inside text-sm space-y-1 text-left">
              {recomendacoes.alternativas_saudaveis.map((alternativa, index) => <li key={index}>{alternativa}</li>)}
            </ul>
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
  const [totais, setTotais] = useState({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
  const router = useRouter();
  const { usuario, carregando, logout } = useAuth();
  console.log("🔍 Auth State:", {
    usuario: usuario ? usuario.nome : "null",
    carregando
  });

  // Estados para o fluxo
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanRapidoResponse | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnaliseCompletaResponse | null>(null);
  const [foodDatabase, setFoodDatabase] = useState<FoodDatabaseItem[]>([]); // Guarda o food_database.json
  const [editingItem, setEditingItem] = useState<{ index: number, data: ModalAlimentoData } | null>(null); // Guarda o item sendo editado

  // Proteção de Rota
  useEffect(() => {
    if (!carregando && !usuario) {
      router.push('/login');
    }
  }, [usuario, carregando, router]);

  // Calcula os totais nutricionais
useEffect(() => {
    if (analysisResult?.analise_nutricional) {
      // Quando a análise completa já chegou (tem macronutrientes)
      const { calorias_totais, macronutrientes } = analysisResult.analise_nutricional;
      setTotais({
        kcal: calorias_totais || 0,
        protein: macronutrientes?.proteinas_g || 0,
        carbs: macronutrientes?.carboidratos_g || 0,
        fats: macronutrientes?.gorduras_g || 0,
      });
    } else if (scanResult?.resultado?.resumo_nutricional) {
      // ---- RESUMO NUTRICIONAL DO SCAN RÁPIDO ----
      const resumo = scanResult.resultado.resumo_nutricional;
      const total_calorias = resumo.total_calorias ?? 0; // Usa nullish coalescing

      // Acessa os macronutrientes com optional chaining e nullish coalescing
      const total_proteinas_g = resumo.macronutrientes_estimados?.total_proteinas_g ?? 0;
      const total_carboidratos_g = resumo.macronutrientes_estimados?.total_carboidratos_g ?? 0;
      const total_gorduras_g = resumo.macronutrientes_estimados?.total_gorduras_g ?? 0;

      setTotais({
        kcal: total_calorias,
        protein: total_proteinas_g,
        carbs: total_carboidratos_g,
        fats: total_gorduras_g,
      });
    } else if (scanResult?.resultado?.alimentos_extraidos) {
      // Fallback: se não tem resumo nutricional, soma apenas as calorias dos alimentos extraídos
      const kcal = scanResult.resultado.alimentos_extraidos.reduce(
        (soma, alimento) => soma + (alimento.calorias_estimadas || 0),
        0
      );
      setTotais({ kcal, protein: 0, carbs: 0, fats: 0 });
    } else {
      // Se não há nenhum resultado, zera tudo
      setTotais({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
    }
  }, [analysisResult, scanResult]);

  useEffect(() => {
    // Carrega a base de dados de alimentos da pasta /public
    fetch('/food_database.json')
      .then(res => res.json())
      .then(data => setFoodDatabase(data))
      .catch(err => console.error("Erro ao carregar food_database.json:", err));
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  // Função para rodar o Scan Rápido
  const runScan = async (file: File) => {
    setLoading(true);
    setApiError(null);
    setScanResult(null);
    setAnalysisResult(null);
    setAnalysisError(null);

    const formData = new FormData();
    // O nome 'imagem' está correto, pois bate com o seu backend Python
    formData.append('imagem', file);

    try {
      const response = await api.post<ScanRapidoResponse>('/api/v1/refeicoes/scan-rapido', formData, {
        // REMOVIDO: 'Content-Type': 'multipart/form-data'
        // O Axios identificará o FormData e configurará o header correto sozinho.
      });

      console.log("Frontend - Resposta do Scan Rápido recebida:", response.data);
      setScanResult(response.data);
    } catch { // <--- Deixe vazio se não for usar o objeto de erro
      setApiError("Ocorreu um erro ao escanear a imagem.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fotoCapturada) {
      runScan(fotoCapturada);
    }
  }, [fotoCapturada]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 🔥 CONFIGURAÇÕES DE COMPRESSÃO (Seguras, ótimas e rápidas)
      const options = {
        maxSizeMB: 1,              // máximo 1MB (o backend aceita tranquilo)
        maxWidthOrHeight: 1600,    // mantém qualidade alta para IA
        useWebWorker: true,
        fileType: "image/jpeg",    // garante boa compressão
      };

      console.log("📸 Imagem original:", file.size / 1024 / 1024, "MB");

      // 🔧 Comprime a imagem
      const compressedFile = await imageCompression(file, options);

      console.log("📉 Imagem comprimida:", compressedFile.size / 1024 / 1024, "MB");

      // Atualiza pré-visualização
      setImageUrl(URL.createObjectURL(compressedFile));

      // Envia sempre a versão comprimida
      setFotoCapturada(compressedFile);
    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      // fallback: usa a imagem original
      setImageUrl(URL.createObjectURL(file));
      setFotoCapturada(file);
    }

    // Reseta input
    event.target.value = null;
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

  // Função para adicionar um alimento manualmente
  const handleAddManualFood = () => {
    setEditingItem({
      index: -1,
      data: {
        nome: '',
        quantidade_estimada_g: 100,
        calorias_estimadas: 0,
        categoria: 'Outros',
        confianca: 'corrigido',
        peso_g: 100,
        kcal: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        medida_caseira_sugerida: '',
      }
    });
  };

  const handleEditFood = (indexToEdit: number) => {
    const alimentoOriginal = scanResult?.resultado?.alimentos_extraidos?.[indexToEdit];
    if (alimentoOriginal) {
      const itemParaModal: ModalAlimentoData = {
        ...alimentoOriginal,
        peso_g: alimentoOriginal.quantidade_estimada_g,
        kcal: alimentoOriginal.calorias_estimadas,
        protein: 0,
        carbs: 0,
        fats: 0,
        medida_caseira_sugerida: alimentoOriginal.medida_caseira_sugerida || '',
      };
      setEditingItem({
        index: indexToEdit,
        data: itemParaModal
      });
    }
  };

  const handleCloseModal = () => {
    setEditingItem(null);
  };

  const handleSaveEdit = (itemAtualizadoDoModal: ModalAlimentoData) => {
    if (editingItem === null) return;
    const indexToEdit = editingItem.index;

    setScanResult(prevResult => {

      // CASO 1 — não havia resultado antes
      if (!prevResult) {
        const novoAlimento: ScanRapidoAlimento = {
          nome: itemAtualizadoDoModal.nome,
          quantidade_estimada_g: itemAtualizadoDoModal.peso_g,
          calorias_estimadas: itemAtualizadoDoModal.kcal,
          confianca: 'corrigido',
          categoria: itemAtualizadoDoModal.categoria || 'Manual',
          medida_caseira_sugerida: itemAtualizadoDoModal.medida_caseira_sugerida || '',
        };

        return {
          sucesso: true,
          erro: null,
          bloqueada: false,
          status: 'success',
          timestamp: new Date().toISOString(),
          resultado: {
            alimentos_extraidos: [novoAlimento],
            alertas: ["Novo alimento adicionado manualmente."],
            resumo_nutricional: null,
          }
        };
      }

      // CASO 2 — já existe resultado (edição ou adição)
      const currentAlimentos = prevResult.resultado?.alimentos_extraidos || [];
      let newAlimentos: ScanRapidoAlimento[];

      if (indexToEdit === -1) {
        const novoAlimento: ScanRapidoAlimento = {
          nome: itemAtualizadoDoModal.nome,
          quantidade_estimada_g: itemAtualizadoDoModal.peso_g,
          calorias_estimadas: itemAtualizadoDoModal.kcal,
          confianca: 'corrigido',
          categoria: itemAtualizadoDoModal.categoria || 'Manual',
          medida_caseira_sugerida: itemAtualizadoDoModal.medida_caseira_sugerida || '',
        };
        newAlimentos = [...currentAlimentos, novoAlimento];

      } else {
        newAlimentos = currentAlimentos.map((item, index) => {
          if (index === indexToEdit) {
            return {
              ...item,
              nome: itemAtualizadoDoModal.nome,
              quantidade_estimada_g: itemAtualizadoDoModal.peso_g,
              calorias_estimadas: itemAtualizadoDoModal.kcal,
              confianca: 'corrigido',
            };
          }
          return item;
        });
      }

      const oldAlertas = prevResult.resultado?.alertas || [];

      return {
        ...prevResult,
        status: prevResult.status ?? 'success',
        timestamp: prevResult.timestamp ?? new Date().toISOString(),
        resultado: {
          ...prevResult.resultado,
          alimentos_extraidos: newAlimentos,
          resumo_nutricional: null,
          alertas: [...oldAlertas, "Item editado/adicionado. Os totais podem estar desatualizados."]
        }
      };
    });
  };

  const handleDeleteFood = (indexToDelete: number) => {
    setScanResult(prevResult => {
      if (!prevResult?.resultado?.alimentos_extraidos) return prevResult;

      const newAlimentos = prevResult.resultado.alimentos_extraidos.filter((_, index) => index !== indexToDelete);
      const oldAlertas = prevResult.resultado.alertas || [];

      return {
        ...prevResult,
        status: prevResult.status, // Mantém o status
        resultado: {
          ...prevResult.resultado,
          alimentos_extraidos: newAlimentos,
          resumo_nutricional: null,
          alertas: [...oldAlertas, "Item removido. Os totais de macros podem estar desatualizados."]
        }
      };
    });
  };

  const fetchDetailedAnalysis = async () => {
    console.log('🔍 Estado antes de salvar:', {
      fotoCapturada: !!fotoCapturada,
      alimentos: scanResult?.resultado?.alimentos_extraidos?.length || 0,
      scanResult: scanResult
    });

    setLoadingAnalysis(true);
    setAnalysisError(null);
    setApiError(null);
    let savedMealId: number | null = null;

    try {
      if (!scanResult?.resultado?.alimentos_extraidos || scanResult.resultado.alimentos_extraidos.length === 0) {
        throw new Error("Não há alimentos editados do scan rápido para salvar e analisar.");
      }

      // Preparar os dados
      const alimentosParaSalvar = scanResult.resultado.alimentos_extraidos.map(alimento => ({
        nome: alimento.nome,
        quantidade_estimada_g: alimento.quantidade_estimada_g,
        categoria_nutricional: alimento.categoria || "Outros",  // ✅ CORRIGIDO
        confianca: alimento.confianca,
        calorias_estimadas: alimento.calorias_estimadas,
        medida_caseira_sugerida: alimento.medida_caseira_sugerida,
      }));

      console.log('🔍 DEBUG: Estado fotoCapturada:', {
        existe: !!fotoCapturada,
        tipo: fotoCapturada?.type,
        tamanho: fotoCapturada?.size,
        nome: fotoCapturada?.name
      });

      // 2. Criar o FormData
      const formData = new FormData();

      // 3. Verificar se a imagem original existe
      if (!fotoCapturada) {
        throw new Error("Imagem original (fotoCapturada) não encontrada. Tente escanear novamente.");
      }

      // 4. Adicionar os campos que o backend espera
      formData.append("imagem", fotoCapturada);
      formData.append("alimentos_json", JSON.stringify(alimentosParaSalvar));

      console.log('📦 DEBUG: FormData criado:', {
        temImagem: formData.has('imagem'),
        temAlimentos: formData.has('alimentos_json')
      });

      // ✅ CORREÇÃO: Enviar a lista DIRETAMENTE
      const saveResponse = await api.post<{ meal_id: number }>(
        '/api/v1/refeicoes/salvar-scan-editado',
        formData
      );

      console.log('✅ DEBUG: Resposta recebida:', saveResponse.data);
      savedMealId = saveResponse.data.meal_id;

      if (!savedMealId) {
        throw new Error("Falha ao obter o ID da refeição salva.");
      }

      console.log('Refeição salva com ID:', savedMealId);

      // Agora chamar a análise detalhada
      const analysisResponse = await api.post<AnaliseCompletaResponse>(
        `/api/v1/refeicoes/analisar-detalhadamente/${savedMealId}`
      );

      if (analysisResponse.data && analysisResponse.data.detalhes_prato) {
        setScanResult(null);
        setAnalysisResult(analysisResponse.data);
      } else {
        throw new Error('Resposta da análise detalhada em formato inválido');
      }

    } catch (error) {
      console.error('Erro no fluxo de salvar e analisar:', error);

      // ✅ CORREÇÃO: Tratamento de erro aprimorado
      let errorMessage = "Erro desconhecido";

      if (axios.isAxiosError(error)) {
        console.log('Detalhes do erro Axios:', error.response?.data);

        if (error.response?.status === 422) {
          // Erro de validação - mostrar detalhes
          const detail = error.response.data?.detail;
          if (Array.isArray(detail)) {
            errorMessage = `Erro de validação: ${detail.map(d => d.msg).join(', ')}`;
          } else if (typeof detail === 'string') {
            errorMessage = detail;
          } else {
            errorMessage = "Dados enviados em formato incorreto";
          }
        } else {
          const detail = error.response?.data?.detail;
          errorMessage = typeof detail === 'string' ? detail : error.message || "Erro na requisição";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setAnalysisError(errorMessage);
    } finally {
      setLoadingAnalysis(false);
    }
  };


  // Função para buscar alimentos no backend com suporte a IA
  const searchFoodsFromDatabase = async (searchTerm: string, incluirIA: boolean = true): Promise<FoodItem[]> => {
    if (searchTerm.length < 2) {
      return [];
    }
    try {
      // Use o novo endpoint que inclui IA
      const response = await api.get<FoodItem[]>(
        `/api/v1/alimentos/buscar-completo?q=${encodeURIComponent(searchTerm)}&incluir_ia=${incluirIA}&limit=10`
      );
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      // Fallback para o endpoint original
      try {
        const response = await api.get<FoodItem[]>(
          `/api/v1/alimentos/buscar?q=${encodeURIComponent(searchTerm)}&limit=10`
        );
        return response.data || [];
      } catch (fallbackError) {
        console.error('Erro no fallback de busca:', fallbackError);
        return [];
      }
    }
  };

  // Loader principal
  if (carregando) { return <div className="flex justify-center items-center min-h-screen">Carregando...</div>; }
  if (!usuario) { return null; }

  // JSX principal da página
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar onLogout={logout} />
      <main className="grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-4 lg:p-8">
          {/* --- COLUNA DA ESQUERDA (IMAGEM) --- */}
          <div className="flex flex-col text-center">
            <h3 className="text-md px-2 font-bold text-green-800">1. Fotografe seu prato</h3>
            <p className="text-sm font-semibold text-gray-600 mt-2 px-4">
              A análise nutricional é feita com ajuda de IA 🧠.
              Estou em constante aprendizado, se algo parecer incorreto,
              use os ícones para ajustar os alimentos identificados!
            </p>
            {!imageUrl && (
              <label htmlFor="upload-inicial" className="w-full sm:w-auto cursor-pointer bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition hover:bg-green-600 shadow-md mt-4">
                📸 Abrir Câmera
                <input type="file" id="upload-inicial" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
            {imageUrl && (
              <div className="w-full mt-4">
                <div className="relative w-full max-w-lg mx-auto aspect-square bg-white rounded-xl overflow-hidden mb-6 shadow-2xl">
                  <Image src={imageUrl} alt="Prato a ser analisado" fill className="object-cover" />
                </div>
                <button onClick={handleClearScreen} className="w-full sm:w-auto bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg transition hover:bg-red-600 shadow-md">
                  Limpar Foto
                </button>
              </div>
            )}
          </div>
          {/* --- COLUNA DA DIREITA (RESULTADOS) --- */}
          <div className="flex flex-col">
            {/* ✅ TÍTULO E LEGENDA QUE SOMEM APÓS A ANÁLISE DETALHADA */}
            {scanResult && !analysisResult && (
              <>
                <h3 className="text-md px-2 font-bold text-green-800 text-center">2. Revise os Alimentos</h3>
                {/* Legenda dos ícones */}
                <div className="flex justify-center items-center gap-4 sm:gap-6 mt-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><Plus size={16} className="text-green-600" /><span>Adicionar</span></div>
                  <div className="flex items-center gap-1"><Pencil size={16} className="text-blue-600" /><span>Editar</span></div>
                  <div className="flex items-center gap-1"><Trash2 size={16} className="text-red-600" /><span>Apagar</span></div>
                </div>

                {/* Novo botão para adicionar alimento manualmente */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleAddManualFood}
                    className="w-full sm:w-auto bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition hover:bg-green-700 shadow-md flex items-center justify-center mx-auto"
                  >
                    <Plus size={10} className="mr-2" />
                    Adicionar Alimento Manualmente
                  </button>
                </div>
              </>
            )}

            {/* Área de Resultados */}
            <div className="w-full results-container space-y-6 mt-8">
              {loading && <div className="p-4 text-lg font-semibold text-gray-600 animate-pulse text-center">Analisando imagem...</div>}
              {apiError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">{apiError}</div>}
              {/* ✅ MOSTRA SCAN RESULTS APENAS SE NÃO HOUVER ANALYSIS RESULT */}
              {scanResult && !analysisResult && (
                <ScanResults
                  scanResult={scanResult}
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
                    className="w-full sm:w-auto cursor-pointer bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition hover:bg-blue-600 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              {/* Resumo Nutricional - MOSTRA APENAS NO CASO DO SCAN RÁPIDO (evita duplicidade quando há analysisResult) */}
              {(!loading && !loadingAnalysis) && (scanResult && !analysisResult) && (
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
              {/* Este botão só aparece se a análise detalhada foi concluída */}
              {analysisResult && !loadingAnalysis && (
                <div className="mt-10 text-center">
                  <button
                      onClick={() => router.push("/")}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition text-sm font-medium"
                    >
                      Home
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {editingItem && (
          <EditFoodModal
            itemParaEditar={editingItem.data}
            foodDatabase={foodDatabase}
            onSearchFood={searchFoodsFromDatabase}
            onSave={handleSaveEdit}
            onClose={handleCloseModal}
          />
        )}
      </main>
    </div>
  );
}
