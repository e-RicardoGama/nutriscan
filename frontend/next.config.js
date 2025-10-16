/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Diz ao Next.js para gerar arquivos estáticos na pasta 'out'

  eslint: {
    // Mantemos esta regra para ignorar erros de linting no build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;