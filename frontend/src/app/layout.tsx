// /app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Suspense } from "react";
import ServiceWorkerClient from "../ServiceWorkerClient";
import Footer from "../components/Footer";
import ConsentimentoWrapper from '../components/ConsentimentoWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NutrInfo",
  description: "Fotografe seu prato e receba uma análise nutricional completa com inteligência artificial.",
  icons: { icon: "/imagens/alimentacao.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Suspense fallback={<div>Carregando...</div>}>
          <AuthProvider>
            <ServiceWorkerClient />
            
            {/* Conteúdo principal da aplicação */}
            {children}
            
            {/* Modal de consentimento - aparece automaticamente quando necessário */}
            <ConsentimentoWrapper />
            
            {/* Rodapé global */}
            <Footer />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
