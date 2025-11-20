"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function PublicPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="grow max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-bold text-green-800 mb-4">
          Bem-vindo ao NutrInfo!
        </h1>

        <p className="text-gray-700 text-sm leading-relaxed">
          Aqui você poderá visualizar informações públicas sobre o app,
          entender como funciona, criar sua conta ou fazer login.
        </p>

        {/* Aqui você depois adiciona o conteúdo que quiser */}
      </main>

      <Footer />
    </div>
  );
}
