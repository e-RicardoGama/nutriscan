"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

export default function PublicPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="grow max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center text-center">
        {/* Seção de Boas-Vindas e Chamada Principal */}
        <section className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-700 mb-4 leading-tight">
            NutrInfo: Seu Guia Inteligente para uma Alimentação Saudável
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Descubra o que você come de verdade. Informações nutricionais claras, rápidas e personalizadas para suas escolhas diárias.
          </p>
        </section>

        {/* Destaques Iniciais */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl">
          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg sm:text-xl font-semibold text-green-600 mb-3 flex items-center justify-center">
              <span className="text-xl sm:text-2xl mr-2">⚡</span> Simples e Rápido
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Análise nutricional instantânea. Menos tempo pesquisando, mais tempo vivendo.
            </p>
          </div>

          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg sm:text-xl font-semibold text-green-600 mb-3 flex items-center justify-center">
              <span className="text-xl sm:text-2xl mr-2">🍎</span> Escolhas Inteligentes
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Entenda o impacto dos alimentos na sua saúde com orientações claras.
            </p>
          </div>

          <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg sm:text-xl font-semibold text-green-600 mb-3 flex items-center justify-center">
              <span className="text-xl sm:text-2xl mr-2">🌱</span> Saúde Duradoura
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Construa hábitos alimentares melhores, passo a passo, sem complicações.
            </p>
          </div>
        </section>

        {/* Botões de Ação */}
        <section className="flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-md">
          <Link href="/register" passHref>
            <button className="px-6 sm:px-8 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300 text-base sm:text-lg flex-1">
              Comece Agora!
            </button>
          </Link>
          <Link href="/login" passHref>
            <button className="px-6 sm:px-8 py-3 bg-gray-200 text-green-800 font-bold rounded-full shadow-lg hover:bg-gray-300 transition-colors duration-300 text-base sm:text-lg flex-1">
              Já sou usuário
            </button>
          </Link>
        </section>

        {/* Seção: Como o NutrInfo te ajuda */}
        <section className="w-full max-w-3xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center">
            Como o NutrInfo te ajuda na prática
          </h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-8 text-center max-w-2xl mx-auto">
            O NutrInfo analisa cada alimento e te mostra, de forma simples, o que ele tem de bom, o que precisa de equilíbrio e quais trocas podem ser mais saudáveis. Você não precisa entender de nutrição: o app traduz a informação em recomendações claras para o seu dia a dia.
          </p>

          {/* Três Pilares */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Pilar 1 */}
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-3 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">✅</span> Pontos Positivos
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Veja rapidamente o que aquele alimento tem de bom para a sua saúde. O NutrInfo destaca quando ele é fonte de proteínas, fibras, gorduras boas, tem pouco açúcar, pouco sódio ou um bom perfil de vitaminas e minerais.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-3 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">⚖️</span> Sugestões de Balanceamento
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                O NutrInfo te mostra como equilibrar o consumo: quando faz sentido reduzir a porção, combinar com proteína ou fibras, ou compensar com escolhas mais leves ao longo do dia.
              </p>

            </div>

            {/* Pilar 3 */}
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-3 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">🔄</span> Alternativas Saudáveis
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Quando o alimento não é a melhor opção, o NutrInfo sugere trocas simples e possíveis para o seu dia a dia. Você recebe ideias de produtos parecidos, mas com menos açúcar, menos sódio, mais fibras ou melhor qualidade nutricional.
              </p>
            </div>
          </div>
        </section>

        {/* Seção: Nutrientes */}
        <section className="w-full max-w-3xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center">
            O que o NutrInfo mostra sobre nutrientes
          </h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-8 text-center max-w-2xl mx-auto">
            Além das recomendações, o NutrInfo organiza as informações nutricionais de forma clara, mostrando os principais macronutrientes, vitaminas e minerais que impactam a sua saúde.
          </p>

          {/* Blocos de Nutrientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Nutrientes Principais */}
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-3 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">📊</span> Nutrientes Principais
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                O NutrInfo mostra os principais nutrientes de forma clara: calorias, carboidratos, proteínas, gorduras totais, gorduras saturadas, açúcares, fibras e sódio. Você entende, em segundos, se aquele alimento é muito calórico, se traz saciedade ou se exige atenção.
              </p>
            </div>

            {/* Açúcares, Fibras e Sódio */}
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-3 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">⚠️</span> Açúcares, Fibras e Sódio
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                O app chama atenção para o excesso de açúcar e sódio, ajudando a prevenir picos de glicose, pressão alta e retenção de líquidos. Ao mesmo tempo, destaca quando o alimento é rico em fibras, que favorecem o intestino, a saciedade e o controle da glicemia.
              </p>
            </div>

            {/* Vitaminas */}
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-3 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">💊</span> Vitaminas em Destaque
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Quando os dados estão disponíveis, o NutrInfo mostra vitaminas importantes como A, C, D, E e vitaminas do complexo B. Você vê, em linguagem simples, quando um alimento contribui para imunidade, energia, visão, saúde da pele e dos ossos.
              </p>
            </div>

            {/* Minerais */}
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-3 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">💎</span> Minerais Importantes
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                O app também evidencia minerais como cálcio, ferro, magnésio, zinco e potássio, quando informados no rótulo. Assim, fica fácil identificar alimentos que ajudam na saúde dos ossos, no transporte de oxigênio, na energia, na imunidade e no equilíbrio da pressão.
              </p>
            </div>
          </div>
        </section>

        {/* Seção Final: Resumo */}
        <section className="w-full max-w-2xl mb-12">
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-xl sm:text-2xl font-bold text-green-700 mb-3 text-center">
              Três pilares para melhores escolhas
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-center">
              Pontos Positivos mostram o que o alimento tem de bom. Sugestões de Balanceamento explicam como encaixar esse alimento na sua rotina. Alternativas Saudáveis trazem trocas mais inteligentes, mantendo praticidade e sabor.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
