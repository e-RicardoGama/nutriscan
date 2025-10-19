// layout.tsx - VERSÃO COM SCRIPT DE LIMPEZA
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import ServiceWorkerCleanup from '../components/ServiceWorkerCleanup';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Nutri",
  description: "Fotografe seu prato e receba uma análise nutricional completa com inteligência artificial.",
  icons: {
    icon: '/imagens/alimentacao.png',
  },
};

// Script de limpeza agressivo
const cleanupScript = `
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    console.log('Removendo', regs.length, 'Service Workers...');
    regs.forEach(reg => reg.unregister().then(() => {
      console.log('Service Worker removido');
      if (window.location.search.includes('bypass-sw')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }));
  });
  
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <head>
        {/* Script de limpeza executado imediatamente */}
        <script dangerouslySetInnerHTML={{ __html: cleanupScript }} />
      </head>
      <body className={inter.className}>
        <ServiceWorkerCleanup />
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}