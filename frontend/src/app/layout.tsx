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

        {/* SCRIPT PARA REMOVER SERVICE WORKERS "ZUMBIS" (VERSÃO 2 - SEM LOOP)
          Este script verifica se já tentámos o "assassino" nesta sessão.
          Se não, ele regista o 'sw-killer.js'.
          Quando o "assassino" se ativa, este script força UM reload.
          Na próxima carga, o sessionStorage vai impedir o script de correr de novo.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && !sessionStorage.getItem('sw-kill-attempted')) {
                // 1. Marca que já tentámos nesta sessão para evitar loops
                sessionStorage.setItem('sw-kill-attempted', 'true');
                
                navigator.serviceWorker.register('/sw-killer.js')
                  .then(registration => {
                    console.log('SW "Assassino" registado.');

                    // Ouve se um novo SW está a ser instalado
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        // Ouve as mudanças de estado do novo SW (o "assassino")
                        newWorker.addEventListener('statechange', () => {
                          // Quando o "assassino" estiver ativado (e já tiver desregistado tudo)
                          if (newWorker.state === 'activated') {
                            console.log('SW "Assassino" ativado. A recarregar a página para limpar...');
                            // Força o reload da página.
                            // Na próxima carga, o sessionStorage vai impedir este script de correr.
                            window.location.reload();
                          }
                        });
                      }
                    });
                  })
                  .catch(err => console.error('Falha ao registar SW "Assassino":', err));
              } else if ('serviceWorker' in navigator) {
                // Se já correu, apenas regista no log e não faz nada.
                console.log('SW "Assassino" já correu nesta sessão.');
              }
            `,
          }}
        />
        
      </body>
    </html>
  );
}