// layout.tsx - VERSÃO SIMPLIFICADA
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
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
      <body className={inter.className}>
        <Suspense fallback={<div>Carregando...</div>}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Suspense>
        
      </body>
    </html>
  );
}