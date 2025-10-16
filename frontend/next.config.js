/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adicione esta seção de configuração do ESLint
  eslint: {
    // Aviso: Isso permite que builds de produção sejam concluídos com sucesso
    // mesmo que seu projeto tenha erros de ESLint.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;