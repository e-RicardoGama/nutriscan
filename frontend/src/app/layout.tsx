// layout.tsx - VERSÃO CORRIGIDA
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Suspense } from 'react';
import ServiceWorkerClient from '../ServiceWorkerClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Nutri",
  description: "Fotografe seu prato e receba uma análise nutricional completa com inteligência artificial.",
  icons: {
    icon: '/imagens/alimentacao.jpg',
  },
};

// Componente cliente para lidar com Service Worker
function ServiceWorkerCleanup() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if (typeof window !== 'undefined') {
            // Remove service workers
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                registrations.forEach(function(registration) {
                  registration.unregister();
                  console.log('Service Worker unregistered');
                });
              });
            }
            
            // Limpa caches
            if ('caches' in window) {
              caches.keys().then(function(cacheNames) {
                cacheNames.forEach(function(cacheName) {
                  caches.delete(cacheName);
                });
              });
            }
          }
        `
      }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <ServiceWorkerCleanup />
      </head>
      <body className={inter.className}>
        <Suspense fallback={<div>Carregando...</div>}>
          <AuthProvider>
            <ServiceWorkerClient />
            {children}
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}