/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========================================
  // Headers customizados
  // ========================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ],
      },
    ]
  },

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

  // ❌ REMOVIDO: output: 'export'
  // ✅ Firebase Hosting com Next.js precisa de servidor

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
