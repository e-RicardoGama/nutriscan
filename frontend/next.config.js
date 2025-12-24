/** @type {import('next').NextConfig} */
const nextConfig = {
  
  // ========================================
  // ESLint
  // ========================================
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ========================================
  // Otimização de imagens
  // ========================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ]
  },
  // ========================================
  // Configuração para exportação estática
  // ========================================
  output: 'export', // Habilita a exportação estática
  distDir: 'out', // Define o diretório de saída para 'out'
  images: { unoptimized: true },
  
  // ========================================
  // Variáveis de ambiente públicas
  // ========================================
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://nutriscan-backend-925272362555.southamerica-east1.run.app'
  },
  // ========================================
  // Configurações de build
  // ========================================
  typescript: {
    ignoreBuildErrors: false,
  },
  // ========================================
  // Experimental
  // ========================================
  experimental: {
    optimizePackageImports: ['lucide-react'],
  }
}
module.exports = nextConfig
