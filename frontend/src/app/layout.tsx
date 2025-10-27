// layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Suspense } from "react";
import ServiceWorkerClient from "../ServiceWorkerClient";
import Footer from "../components/Footer";
import ConsentimentoLGPD from "../components/ConsentimentoLGPD";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alimentação Equilibrada",
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
            {children}
            <ConsentimentoLGPD />
            <Footer />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
