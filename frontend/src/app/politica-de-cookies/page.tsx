// /app/politica-cookies/page.tsx
export default function PoliticaCookies() {
  return (
    <main className="max-w-3xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Política de Cookies</h1>

      <p className="mb-2">
        O aplicativo <strong>Nutrindo seu bem-estar</strong> utiliza cookies e tecnologias semelhantes para melhorar a experiência do usuário, analisar desempenho e personalizar conteúdo.
      </p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">1. Tipos de Cookies</h2>
      <ul className="list-disc ml-6 mb-2">
        <li><strong>Cookies essenciais:</strong> Necessários para funcionamento do aplicativo.</li>
        <li><strong>Cookies de desempenho:</strong> Coletam informações anônimas sobre uso do app para melhorar serviços.</li>
        <li><strong>Cookies de funcionalidade:</strong> Guardam preferências do usuário, como idioma e consentimentos.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-4 mb-2">2. Consentimento</h2>
      <p className="mb-2">
        Ao usar o aplicativo, você pode aceitar ou recusar cookies. Seu consentimento é registrado e pode ser alterado a qualquer momento nas configurações do aplicativo.
      </p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">3. Gerenciamento de Cookies</h2>
      <p className="mb-2">
        É possível gerenciar cookies no navegador ou dispositivo. No entanto, a desativação de cookies essenciais pode limitar funcionalidades do aplicativo.
      </p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">4. Contato</h2>
      <p className="mb-2">
        Dúvidas sobre cookies ou LGPD podem ser enviadas para: <strong>contato@alimentacaoequilibrada.com.br</strong>
      </p>
    </main>
  );
}
