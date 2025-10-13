/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Remove basePath se não estiver usando
  // basePath: '/frontend_nutri'
}

module.exports = nextConfig