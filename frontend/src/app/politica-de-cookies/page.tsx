import Link from 'next/link';

export default function PoliticaCookies() {
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8 text-gray-800 bg-white shadow-lg rounded-lg my-8">
      {/* Cabeçalho */}
      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold text-green-600 mb-2">Política de Cookies</h1>
        <p className="text-sm text-gray-600">
          <strong>NutrInfo</strong> | Atualizado em 18 de novembro de 2025
        </p>
      </header>

      {/* Navegação Interna (Índice) */}
      <nav className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Índice Rápido</h2>
        <ul className="space-y-1 text-sm">
          <li><a href="#introducao" className="text-green-600 hover:underline">1. Introdução</a></li>
          <li><a href="#o-que-sao-cookies" className="text-green-600 hover:underline">2. O Que São Cookies?</a></li>
          <li><a href="#tipos-de-cookies" className="text-green-600 hover:underline">3. Tipos de Cookies Utilizados</a></li>
          <li><a href="#finalidades" className="text-green-600 hover:underline">4. Finalidades dos Cookies</a></li>
          <li><a href="#consentimento" className="text-green-600 hover:underline">5. Seu Consentimento</a></li>
          <li><a href="#gerenciamento" className="text-green-600 hover:underline">6. Gerenciamento de Cookies</a></li>
          <li><a href="#atualizacoes" className="text-green-600 hover:underline">7. Atualizações da Política</a></li>
          <li><a href="#contato" className="text-green-600 hover:underline">8. Contato</a></li>
        </ul>
      </nav>

      {/* Seção 1: Introdução */}
      <section id="introducao" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">1. Introdução</h2>
        <p className="mb-3 leading-relaxed">
          O <strong>NutrInfo</strong>, desenvolvido e operado por <strong>Ricardo Gama</strong> (pessoa física), utiliza cookies e tecnologias semelhantes para garantir o funcionamento adequado do site e/ou aplicativo, melhorar sua experiência de uso, analisar o desempenho dos serviços e, quando aplicável, personalizar conteúdo. Esta política explica o que são cookies, como os utilizamos e como você pode gerenciá-los.
        </p>
        <p className="mb-3 leading-relaxed">
          Nosso uso de cookies está em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong> e demais normas brasileiras aplicáveis.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="font-semibold text-blue-800">📋 Transparência e Controle</p>
          <p className="text-sm text-blue-700 mt-1">
            Valorizamos sua privacidade e buscamos ser transparentes sobre o uso de cookies, oferecendo a você controle sobre suas preferências.
          </p>
        </div>
      </section>

      {/* Seção 2: O Que São Cookies? */}
      <section id="o-que-sao-cookies" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">2. O Que São Cookies?</h2>
        <p className="mb-3 leading-relaxed">
          Cookies são pequenos arquivos de texto que são armazenados no seu navegador ou dispositivo (computador, tablet, smartphone) quando você visita um site ou usa um aplicativo. Eles permitem que o site/app &amp;quot;lembre&amp;quot; suas ações e preferências (como login, idioma, tamanho da fonte e outras preferências de exibição) por um período de tempo, para que você não precise digitá-las novamente sempre que voltar ao site ou navegar de uma página para outra.
        </p>
        <p className="mb-3 leading-relaxed">
          Além dos cookies, utilizamos outras tecnologias semelhantes, como web beacons, pixels e armazenamento local, para coletar informações e melhorar nossos serviços.
        </p>
      </section>

      {/* Seção 3: Tipos de Cookies Utilizados */}
      <section id="tipos-de-cookies" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">3. Tipos de Cookies Utilizados</h2>
        <p className="mb-3 leading-relaxed">O <strong>NutrInfo</strong> utiliza os seguintes tipos de cookies:</p>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">3.1 Cookies Essenciais (Estritamente Necessários)</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>São indispensáveis para o funcionamento básico do site/app, permitindo a navegação e o uso de funcionalidades essenciais, como acesso a áreas seguras e carrinhos de compra. Sem eles, os serviços não podem ser fornecidos adequadamente.</li>
          <li><strong>Exemplos:</strong> Cookies de sessão, cookies de segurança.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">3.2 Cookies de Desempenho e Análise</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Coletam informações anônimas sobre como os usuários interagem com o site/app (páginas visitadas, tempo de permanência, erros, etc.). Isso nos ajuda a entender e melhorar o desempenho e a usabilidade de nossos serviços.</li>
          <li><strong>Exemplos:</strong> Google Analytics, Hotjar.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">3.3 Cookies de Funcionalidade</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Permitem que o site/app &amp;quot;lembre&amp;quot; suas escolhas e preferências (como idioma, região, nome de usuário) para oferecer uma experiência mais personalizada e conveniente.</li>
          <li><strong>Exemplos:</strong> Preferências de idioma, configurações de privacidade.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">3.4 Cookies de Publicidade e Marketing</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>São usados para exibir anúncios mais relevantes para você e seus interesses, limitar o número de vezes que você vê um anúncio e medir a eficácia das campanhas publicitárias. Podem ser definidos por nós ou por parceiros de publicidade.</li>
          <li><strong>Exemplos:</strong> Google Ads, Facebook Pixel.</li>
        </ul>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="font-semibold text-yellow-800">⚠️ Cookies de Terceiros</p>
          <p className="text-sm text-yellow-700 mt-1">
            Alguns cookies podem ser definidos por terceiros (como Google, Facebook) que fornecem serviços de análise ou publicidade em nosso nome. Não temos controle direto sobre esses cookies de terceiros.
          </p>
        </div>
      </section>

      {/* Seção 4: Finalidades dos Cookies */}
      <section id="finalidades" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">4. Finalidades dos Cookies</h2>
        <p className="mb-3 leading-relaxed">Utilizamos cookies para as seguintes finalidades:</p>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Autenticação e segurança do usuário</li>
          <li>Personalização da experiência (idioma, tema, preferências)</li>
          <li>Análise de tráfego e desempenho do site/app</li>
          <li>Melhoria contínua de nossos serviços e funcionalidades</li>
          <li>Publicidade direcionada e medição de campanhas (com seu consentimento)</li>
          <li>Prevenção de fraudes e garantia da integridade da plataforma</li>
        </ul>
      </section>

      {/* Seção 5: Seu Consentimento */}
      <section id="consentimento" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">5. Seu Consentimento</h2>
        <p className="mb-3 leading-relaxed">
          Ao acessar e utilizar o site ou aplicativo do <strong>NutrInfo</strong>, você será apresentado a um banner de consentimento de cookies. Através dele, você pode aceitar todos os cookies, recusar os não essenciais ou gerenciar suas preferências de forma granular.
        </p>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="font-semibold text-green-800">✅ Controle Total</p>
          <p className="text-sm text-green-700 mt-1">
            Seu consentimento é livre, informado e inequívoco. Você pode alterar suas preferências de cookies a qualquer momento através das configurações de privacidade em nosso site/app.
          </p>
        </div>
        <p className="leading-relaxed">
          A qualquer momento, você pode revogar seu consentimento para o uso de cookies não essenciais. A revogação não afeta a legalidade do tratamento baseado no consentimento antes da sua retirada.
        </p>
      </section>

      {/* Seção 6: Gerenciamento de Cookies */}
      <section id="gerenciamento" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">6. Gerenciamento de Cookies</h2>
        <p className="mb-3 leading-relaxed">
          Você tem o direito de gerenciar e controlar os cookies. Além do nosso banner de consentimento, você pode fazê-lo de várias maneiras:
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">6.1 Configurações do Navegador</h3>
        <p className="mb-2">A maioria dos navegadores permite que você:</p>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Visualize quais cookies estão armazenados e exclua-os individualmente.</li>
          <li>Bloqueie cookies de terceiros.</li>
          <li>Bloqueie cookies de sites específicos.</li>
          <li>Bloqueie o envio de todos os cookies.</li>
          <li>Exclua todos os cookies ao fechar o navegador.</li>
        </ul>
        <p className="text-sm text-gray-600">
          Consulte a seção de &amp;quot;Ajuda&amp;quot; do seu navegador para saber como gerenciar as configurações de cookies. Lembre-se que a desativação de cookies essenciais pode comprometer a funcionalidade do nosso site/app.
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">6.2 Configurações do Aplicativo</h3>
        <p className="leading-relaxed">
          Em nosso aplicativo móvel, você pode acessar as &amp;quot;Configurações de Privacidade&amp;quot; para ajustar suas preferências de cookies e outras tecnologias de rastreamento.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">6.3 Ferramentas de Opt-out</h3>
        <p className="leading-relaxed">
          Você pode optar por não participar de cookies de publicidade direcionada de muitos provedores de terceiros visitando sites como a <a href="https://optout.aboutads.info/?c=2&amp;lang=EN" className="text-green-600 underline" target="_blank" rel="noopener noreferrer">Network Advertising Initiative (NAI)</a> ou a <a href="https://www.youronlinechoices.com/" className="text-green-600 underline" target="_blank" rel="noopener noreferrer">European Interactive Digital Advertising Alliance (EDAA)</a>.
        </p>
      </section>

      {/* Seção 7: Atualizações da Política */}
      <section id="atualizacoes" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">7. Atualizações da Política</h2>
        <p className="mb-3 leading-relaxed">
          Esta Política de Cookies pode ser atualizada periodicamente para refletir mudanças em nossas práticas de uso de cookies ou em requisitos legais. A data da &amp;quot;Última Atualização&amp;quot; no topo desta página será revisada.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="font-semibold text-blue-800">📧 Notificação de Mudanças</p>
          <p className="text-sm text-blue-700 mt-1">
            Em caso de alterações significativas, notificaremos você através de nossos canais de comunicação (e-mail, notificações no app ou banner no site).
          </p>
        </div>
      </section>

      {/* Seção 8: Contato */}
      <section id="contato" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">8. Contato</h2>
        <p className="mb-3 leading-relaxed">
          Se você tiver dúvidas sobre esta Política de Cookies ou sobre nossas práticas de privacidade, entre em contato com nosso responsável pela proteção de dados:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li><strong>Responsável:</strong> Ricardo Gama</li>
          <li><strong>E-mail para dúvidas sobre privacidade e cookies:</strong> <a href="mailto:gamadados@gmail.com" className="text-green-600 underline">gamadados@gmail.com</a></li>
          <li><strong>Endereço:</strong> Rua Três, 159, Condomínio Buona Vita, CEP 14805-407, Araraquara/SP, Brasil</li>
        </ul>
      </section>

      {/* Rodapé */}
      <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
        <div className="mb-4">
          <p>
            Esta Política de Cookies foi elaborada em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong> e demais legislações aplicáveis.
          </p>
        </div>
        <div className="mb-4">
          <p>
            <strong>Última revisão legal:</strong> 18 de novembro de 2025 | <strong>Versão:</strong> 1.2
          </p>
          <p className="mt-2">
            Recomendamos que um advogado especializado em proteção de dados revise periodicamente para garantir conformidade contínua.
          </p>
        </div>
        <div className="space-x-4">
          <Link href="/termos-de-uso" className="text-green-600 underline hover:text-green-800">Termos de Uso</Link>
          <Link href="/politica-privacidade" className="text-green-600 underline hover:text-green-800">Política de Privacidade</Link>
          <Link href="/" className="text-green-600 underline hover:text-green-800">Voltar ao Início</Link>
        </div>
      </footer>
    </main>
  );
}
