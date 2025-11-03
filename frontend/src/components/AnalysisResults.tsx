// src/components/AnalysisResults.tsx
"use client"; // Precisa disso pois usa o hook 'useState'

import React, { useState } from 'react'; // Importe React e useState

// Importe a interface de tipos (use o caminho que criamos antes)
import { AnaliseCompletaResponse } from '../interfaces/api.types';

// Importe os "ajudantes" que acabamos de mover
import AccordionItem from './AccordionItem';
import { splitVitsAndMins } from '../utils/nutrition'; 

// Cole o seu código original aqui
const AnalysisResults = ({ analysisResult }: { analysisResult: AnaliseCompletaResponse | null }) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  if (!analysisResult) {
    return null;
  }

  const handleAccordionClick = (id: string) => {
    setOpenAccordion(currentOpen => (currentOpen === id ? null : id));
  };

  const { detalhes_prato, analise_nutricional, recomendacoes } = analysisResult;

  // Calcula valores para o resumo
  const resumo = {
    kcal: analise_nutricional?.calorias_totais ?? 0,
    proteinas: analise_nutricional?.macronutrientes?.proteinas_g ?? 0,
    carboidratos: analise_nutricional?.macronutrientes?.carboidratos_g ?? 0,
    gorduras: analise_nutricional?.macronutrientes?.gorduras_g ?? 0,
  };

  // prepara vitaminas/minerais
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

  // O seu JSX original completo
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

      {/* --- Resumo Nutricional --- */}
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

// Exporte o componente para que outros arquivos possam usá-lo
export default AnalysisResults;