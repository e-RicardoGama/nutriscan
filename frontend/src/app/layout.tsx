// layout.tsx - VERSÃO COM SCRIPT DE LIMPEZA
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import ServiceWorkerCleanup from '../components/ServiceWorkerCleanup';
import DebugParams from '../components/DebugParams';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Nutri",
  description: "Fotografe seu prato e receba uma análise nutricional completa com inteligência artificial.",
  icons: {
    icon: '/imagens/alimentacao.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <Suspense fallback={<div>Carregando...</div>}>
              {children}
            </Suspense>
            <ServiceWorkerCleanup />
            <DebugParams />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}