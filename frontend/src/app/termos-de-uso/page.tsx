// /app/termos-de-uso/page.tsx
import Link from 'next/link';

export default function TermosUso() {
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8 text-gray-800 bg-white shadow-lg rounded-lg my-8">
      {/* Cabeçalho */}
      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold text-green-600 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-600">
          <strong>NutrInfo</strong> | Atualizado em 6 de novembro de 2025
        </p>
      </header>

      {/* Navegação Interna (Índice) */}
      <nav className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Índice Rápido</h2>
        <ul className="space-y-1 text-sm">
          <li><a href="#introducao" className="text-green-600 hover:underline">1. Introdução</a></li>
          <li><a href="#elegibilidade" className="text-green-600 hover:underline">2. Elegibilidade e Registro</a></li>
          <li><a href="#servicos" className="text-green-600 hover:underline">3. Descrição dos Serviços</a></li>
          <li><a href="#pagamentos" className="text-green-600 hover:underline">4. Pagamentos e Assinaturas</a></li>
          <li><a href="#propriedade" className="text-green-600 hover:underline">5. Propriedade Intelectual</a></li>
          <li><a href="#comportamento" className="text-green-600 hover:underline">6. Comportamento do Usuário</a></li>
          <li><a href="#responsabilidades" className="text-green-600 hover:underline">7. Responsabilidades e Isenções</a></li>
          <li><a href="#termino" className="text-green-600 hover:underline">8. Término e Suspensão</a></li>
          <li><a href="#lei" className="text-green-600 hover:underline">9. Lei Aplicável</a></li>
          <li><a href="#disposicoes" className="text-green-600 hover:underline">10. Disposições Gerais</a></li>
          <li><a href="#contato" className="text-green-600 hover:underline">11. Contato</a></li>
        </ul>
      </nav>

      {/* Seção 1: Introdução */}
      <section id="introducao" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">1. Introdução</h2>
        <p className="mb-3 leading-relaxed">
          Bem-vindo à <strong>NutrInfo</strong>, uma plataforma digital (aplicativo móvel e site) dedicada a fornecer informações nutricionais personalizadas, planos de alimentação, rastreamento de hábitos saudáveis e ferramentas de suporte à nutrição. Ao acessar, registrar-se ou utilizar nossos serviços (coletivamente, &ldquo;Serviços&rdquo;), você concorda em estar vinculado a estes <strong>Termos de Uso</strong> (&ldquo;Termos&rdquo;), que formam um contrato legal entre você (&ldquo;Usuário&rdquo;, &ldquo;Você&rdquo;) e a <strong>NutrInfo Ltda.</strong> (&ldquo;Nós&rdquo;, &ldquo;Nosso&rdquo; ou &ldquo;Empresa&rdquo;), com sede na Av. Paulista, 1000, São Paulo/SP, CEP 01310-100, CNPJ 12.345.678/0001-90.
        </p>
        <p className="mb-3 leading-relaxed">
          Estes Termos incorporam por referência nossa <Link href="/politica-privacidade" className="text-green-600 underline hover:text-green-800">Política de Privacidade</Link>, que governa o tratamento de dados pessoais. Se você não concordar com estes Termos, não utilize nossos Serviços.
        </p>
        <p className="leading-relaxed">
          Nós nos reservamos o direito de atualizar estes Termos a qualquer momento, notificando você via e-mail, notificação no app ou banner no site, com pelo menos 30 dias de antecedência para alterações materiais. O uso contínuo após as atualizações constitui aceitação.
        </p>
      </section>

      {/* Seção 2: Elegibilidade e Registro */}
      <section id="elegibilidade" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">2. Elegibilidade e Registro</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Idade mínima:</strong> Você deve ter pelo menos 18 anos ou ser emancipado legalmente para usar os Serviços. Menores de idade precisam de consentimento parental ou responsável.</li>
          <li><strong>Registro:</strong> Para acessar funcionalidades completas, crie uma conta fornecendo informações precisas (nome, e-mail, senha). Você é responsável por manter a confidencialidade de sua conta e notificar-nos imediatamente sobre qualquer uso não autorizado em <a href="mailto:suporte@nutriinfo.com.br" className="text-green-600 underline">suporte@nutriinfo.com.br</a>.</li>
          <li><strong>Verificação:</strong> Podemos exigir verificação de identidade para certas funcionalidades, como planos personalizados de saúde. Contas falsas ou fraudulentas serão suspensas.</li>
        </ul>
      </section>

      {/* Seção 3: Descrição dos Serviços */}
      <section id="servicos" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">3. Descrição dos Serviços</h2>
        <p className="mb-3 leading-relaxed">A NutrInfo oferece:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Ferramentas de rastreamento:</strong> Registro de refeições, calorias, macronutrientes e metas nutricionais.</li>
          <li><strong>Planos personalizados:</strong> Recomendações baseadas em perfis de usuário (ex: vegetarianos, atletas), geradas por algoritmos e, opcionalmente, nutricionistas certificados.</li>
          <li><strong>Conteúdo educativo:</strong> Artigos, receitas e dicas sobre nutrição, sem substituir aconselhamento médico profissional.</li>
          <li><strong>Integrações:</strong> Conexão com wearables (ex: Fitbit, Apple Health) para sincronização de dados.</li>
          <li><strong>Recursos premium:</strong> Assinaturas pagas para análises avançadas, consultas virtuais e remoção de anúncios (detalhes na seção 4).</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600 italic">
          Os Serviços são fornecidos &ldquo;como estão&rdquo;, sem garantias de precisão absoluta em recomendações nutricionais, que dependem de dados fornecidos pelo usuário.
        </p>
      </section>

      {/* Seção 4: Pagamentos e Assinaturas */}
      <section id="pagamentos" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">4. Pagamentos e Assinaturas</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Modelos de precificação:</strong> Gratuito (básico) ou premium (R$ 19,90/mês ou R$ 199,90/ano, sujeitos a alterações com notificação prévia).</li>
          <li><strong>Processamento:</strong> Pagamentos via plataformas seguras (ex: Stripe, PagSeguro), com reembolso apenas nos primeiros 7 dias para assinaturas premium, conforme Código de Defesa do Consumidor (CDC).</li>
          <li><strong>Renovação automática:</strong> Assinaturas renovam automaticamente, a menos que canceladas com 24 horas de antecedência via configurações do app ou <a href="mailto:faturamento@nutriinfo.com.br" className="text-green-600 underline">faturamento@nutriinfo.com.br</a>.</li>
          <li><strong>Impostos:</strong> Preços incluem impostos aplicáveis; você é responsável por quaisquer taxas adicionais.</li>
          <li><strong>Não reembolso:</strong> Conteúdo baixado ou acessado não é reembolsável.</li>
        </ul>
      </section>

      {/* Seção 5: Propriedade Intelectual */}
      <section id="propriedade" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">5. Propriedade Intelectual</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Direitos nossos:</strong> Todo conteúdo da NutrInfo (textos, designs, algoritmos, marcas como &ldquo;NutrInfo&rdquo; e logotipos) é protegido por leis de direitos autorais, marcas e patentes (Lei 9.610/1998 e tratados internacionais). Você recebe uma licença limitada, não exclusiva e revogável para uso pessoal e não comercial.</li>
          <li><strong>Seus direitos:</strong> Você retém direitos sobre dados pessoais e conteúdo gerado por você (ex: diários de refeições), mas concede-nos uma licença mundial, royalty-free para usar, modificar e distribuir esses dados anonimizados para melhorar os Serviços.</li>
          <li><strong>Proibições:</strong> Não copie, distribua, modifique ou comercialize nosso conteúdo sem permissão escrita. Violações sujeitam-se a ações judiciais.</li>
        </ul>
      </section>

      {/* Seção 6: Comportamento do Usuário */}
      <section id="comportamento" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">6. Comportamento do Usuário e Proibições</h2>
        <p className="mb-3 leading-relaxed">Você concorda em:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Usar os Serviços apenas para fins legais e de acordo com estes Termos.</li>
          <li><strong>Não:</strong> (i) introduzir vírus ou malware; (ii) colher dados de outros usuários; (iii) usar bots ou scraping; (iv) fornecer informações falsas sobre saúde que possam induzir erros; (v) violar leis de privacidade ou direitos de terceiros.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Nós monitoramos o uso para garantir conformidade e podemos remover conteúdo ofensivo ou ilegal.
        </p>
      </section>

      {/* Seção 7: Responsabilidades e Isenções */}
      <section id="responsabilidades" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">7. Responsabilidades e Isenções</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="font-semibold text-yellow-800">⚠️ Aviso Importante</p>
          <p className="text-sm text-yellow-700 mt-1">
            As recomendações da NutrInfo não substituem orientação profissional de nutricionistas ou médicos. Consulte um profissional de saúde antes de seguir qualquer plano.
          </p>
        </div>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Suas responsabilidades:</strong> Você é o único responsável pela precisão dos dados inseridos (ex: alergias, condições médicas).</li>
          <li><strong>Nossas limitações:</strong> Não garantimos resultados nutricionais ou de saúde. Os Serviços podem conter erros ou interrupções devido a falhas técnicas.</li>
          <li><strong>Isenção de responsabilidade:</strong> Em nenhuma circunstância seremos responsáveis por danos indiretos, consequenciais ou punitivos, incluindo perda de dados, lesões físicas decorrentes de recomendações mal interpretadas ou lucros cessantes. Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses.</li>
        </ul>
      </section>

      {/* Seção 8: Término e Suspensão */}
      <section id="termino" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">8. Término e Suspensão</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Por você:</strong> Cancele sua conta a qualquer momento via configurações do app. Após cancelamento, dados serão retidos conforme Política de Privacidade.</li>
          <li><strong>Por nós:</strong> Podemos suspender ou encerrar sua conta por violação destes Termos, inatividade prolongada (12 meses) ou razões legais, com notificação prévia quando possível.</li>
          <li><strong>Efeitos:</strong> Término não afeta obrigações acumuladas (ex: pagamentos devidos) e não libera você de responsabilidades por violações passadas.</li>
        </ul>
      </section>

      {/* Seção 9: Lei Aplicável */}
      <section id="lei" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">9. Lei Aplicável e Resolução de Disputas</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Lei governante:</strong> Estes Termos são regidos pelas leis da República Federativa do Brasil, sem aplicação de conflitos de lei.</li>
          <li><strong>Foro:</strong> Qualquer disputa será resolvida exclusivamente nos tribunais da Comarca de São Paulo/SP, com renúncia a qualquer outro foro.</li>
          <li><strong>Mediação:</strong> Antes de litígio, as partes tentarão resolução amigável via mediação gratuita pelo Procon-SP.</li>
          <li><strong>Arbitragem (opcional):</strong> Para disputas acima de R$ 20.000,00, submetem-se à Câmara de Arbitragem da FGV, conforme Lei 9.307/1996.</li>
        </ul>
      </section>

      {/* Seção 10: Disposições Gerais */}
      <section id="disposicoes" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">10. Disposições Gerais</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Integridade:</strong> Estes Termos, junto com a Política de Privacidade, constituem o acordo completo entre as partes, substituindo acordos anteriores.</li>
          <li><strong>Severabilidade:</strong> Se qualquer cláusula for inválida, as demais permanecem em vigor.</li>
          <li><strong>Transferência:</strong> Podemos ceder estes Termos em caso de fusão ou aquisição, notificando você. Você não pode ceder sem nosso consentimento.</li>
          <li><strong>Notificações:</strong> Enviadas para o e-mail cadastrado ou endereço postal oficial.</li>
          <li><strong>Força maior:</strong> Não seremos responsáveis por falhas devido a eventos imprevisíveis (ex: desastres naturais, pandemias).</li>
        </ul>
      </section>

      {/* Seção 11: Contato */}
      <section id="contato" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">11. Contato</h2>
        <p className="mb-3 leading-relaxed">Para dúvidas sobre estes Termos:</p>
        <ul className="space-y-2">
          <li><strong>E-mail:</strong> <a href="mailto:termos@nutriinfo.com.br" className="text-green-600 underline">termos@nutriinfo.com.br</a></li>
          <li><strong>Telefone:</strong> +55 (11) 4000-2000</li>
          <li><strong>Endereço:</strong> Av. Paulista, 1000, São Paulo/SP, CEP 01310-100</li>
          <li><strong>Encarregado de Proteção de Dados (DPO):</strong> Dr. Ana Silva, <a href="mailto:dpo@nutriinfo.com.br" className="text-green-600 underline">dpo@nutriinfo.com.br</a></li>
        </ul>
      </section>

      {/* Rodapé */}
      <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
        <p>
          Estes Termos foram elaborados para garantir conformidade com o Código de Defesa do Consumidor (CDC), Marco Civil da Internet e demais normas aplicáveis.
        </p>
        <p className="mt-2">
          Recomendamos que um advogado revise para adaptações específicas ao seu negócio.
        </p>
        <p className="mt-4">
          <Link href="/politica-privacidade" className="text-green-600 underline hover:text-green-800">Ver Política de Privacidade</Link> | 
          <Link href="/" className="text-green-600 underline hover:text-green-800 ml-2">Voltar ao Início</Link>
        </p>
      </footer>
    </main>
  );
}
