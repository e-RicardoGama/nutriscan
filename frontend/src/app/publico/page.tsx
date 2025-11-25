"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
//import Link from "next/link";

export default function PublicPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="grow max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center">
        {/* Seção: Do Prato à Recomendação */}
        <section className="w-full max-w-2xl mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-4 text-center">
            Do seu prato às melhores escolhas
          </h2>

          <div className="space-y-3">
            {/* Passo 1: Registre sua refeição */}
            <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-green-800 mb-1 flex items-center">
                📸 Registre sua refeição
              </h3>
              <p className="text-gray-600 text-sm text-left">
                Tire uma foto do seu prato ou digite os ingredientes. O NutrInfo analisa tudo em segundos.
              </p>
            </div>

            {/* Passo 2: Veja os nutrientes */}
            <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-green-800 mb-1 flex items-center">
                🥗 Veja o que está consumindo
              </h3>
              <p className="text-gray-600 text-sm text-left">
                Descubra calorias, proteínas, carboidratos, vitaminas e minerais da sua refeição. Entenda o impacto real na sua saúde.
              </p>
            </div>

            {/* Passo 3: Receba recomendações */}
            <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-green-800 mb-1 flex items-center">
                💡 Receba recomendações
              </h3>
              <p className="text-gray-600 text-sm text-left">
                O app destaca pontos positivos, sugere ajustes simples e indica alternativas mais saudáveis. Melhore sua refeição sem complicações.
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
