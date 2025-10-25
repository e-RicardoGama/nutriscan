/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          },
        ],
      },
    ]
  },
  eslint: {
    // Aviso: Isso vai permitir que o build seja concluído 
    // mesmo que seu projeto tenha erros de ESLint.
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true  // ← LINHA CRÍTICA
  }
}

module.exports = nextConfig