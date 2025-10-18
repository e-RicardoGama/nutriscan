import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// 1. Importe o seu AuthProvider
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Nutri",
  description: "Fotografe seu prato e receba uma análise nutricional completa com inteligência artificial.",
  icons: {
    icon: '/imagens/alimentacao.png', // ✅ Favicon adicionado
    shortcut: '/imagens/alimentacao.png',
    apple: '/imagens/alimentacao.png', // Para dispositivos Apple
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* 2. Envolva toda a aplicação com o AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}