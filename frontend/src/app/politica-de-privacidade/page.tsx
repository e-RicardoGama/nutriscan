// /app/politica-privacidade/page.tsx
export default function PoliticaPrivacidade() {
  return (
    <main className="max-w-3xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Política de Privacidade</h1>

      <p className="mb-2">
        O aplicativo <strong>Nutrindo seu bem-estar</strong> coleta, armazena e processa dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018). Ao utilizar nosso aplicativo, você concorda com esta política.
      </p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">1. Dados Coletados</h2>
      <p className="mb-2">
        Podemos coletar dados fornecidos voluntariamente pelo usuário, incluindo: nome, e-mail, fotos de refeições, informações nutricionais e preferências alimentares.
      </p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">2. Finalidade do Tratamento</h2>
      <p className="mb-2">
        Os dados são utilizados para:
      </p>
      <ul className="list-disc ml-6 mb-2">
        <li>Fornecer análises nutricionais e recomendações personalizadas;</li>
        <li>Melhorar a experiência do usuário no aplicativo;</li>
        <li>Enviar comunicações relacionadas ao serviço, quando autorizado.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-4 mb-2">3. Compartilhamento de Dados</h2>
      <p className="mb-2">
        Não compartilhamos seus dados com terceiros para fins comerciais sem seu consentimento. Podemos compartilhar dados com parceiros de tecnologia apenas para processamento de dados de forma segura e anonimizada.
      </p>

      <h2 className="text-2xl font-semibold mt-4 mb-2">4. Direitos do Titular</h2>
      <p className="mb-2">
        Você tem direito a:
      </p>
      <ul className="list-disc ml-6 mb-2">
        <li>Acessar, corrigir ou excluir seus dados pessoais;</li>
        <li>Revogar consentimento a qualquer momento;</li>
        <li>Solicitar portabilidade de dados;</li>
        <li>Ser informado sobre o compartilhamento de seus dados.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-4 mb-2">5. Contato</h2>
      <p className="mb-2">
        Para exercer seus direitos ou tirar dúvidas sobre privacidade: <strong>contato@alimentacaoequilibrada.com.br</strong>
      </p>
    </main>
  );
}
