"use client";

import Navbar from "../../components/Navbar";

export default function PublicPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* NAVBAR */}
      <Navbar />

      {/* CONTENT */}
      <main className="grow flex flex-col items-center px-4 pt-6 pb-10 sm:px-6">

        <section className="w-full max-w-xl space-y-6">

          <h2 className="text-lg sm:text-xl font-bold text-green-800 text-center mb-2">
            Do seu prato às melhores escolhas
          </h2>

          {/* Card Genérico */}
          {[
            {
              title: "📸 Registre sua refeição",
              text: "Tire uma foto do seu prato ou digite os ingredientes. O NutrInfo analisa tudo em segundos.",
            },
            {
              title: "🥗 Veja o que está consumindo",
              text: "Descubra calorias, proteínas, carboidratos, vitaminas e minerais da sua refeição.",
            },
            {
              title: "💡 Receba recomendações",
              text: "O app destaca pontos positivos e sugere ajustes simples.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 sm:p-5 bg-white rounded-xl shadow border-l-4 border-green-500"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-1">
                {item.title}
              </h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}

        </section>
      </main>
    </div>
  );
}
