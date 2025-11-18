import Link from 'next/link';

export default function TermosUso() {
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8 text-gray-800 bg-white shadow-lg rounded-lg my-8">
      {/* Cabeçalho */}
      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold text-green-600 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-600">
          <strong>NutrInfo</strong> | Atualizado em 18 de novembro de 2025
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
          Bem-vindo ao aplicativo e plataforma digital <strong>NutrInfo</strong>, desenvolvidos e operados por <strong>Ricardo Gama</strong>, pessoa física. Ao acessar, registrar-se ou utilizar nossos serviços (coletivamente, “Serviços”), você concorda em estar vinculado a estes <strong>Termos de Uso</strong> (“Termos”), que formam um contrato entre você (“Usuário”, “Você”) e <strong>Ricardo Gama</strong> (“Nós”, “Nosso”).
        </p>
        <p className="mb-3 leading-relaxed">
          <strong>Controlador dos dados e responsável pelo app:</strong><br />
          Ricardo Gama, CPF 104.195.578-22, residente na Rua Três, 159, Condomínio Buona Vita, CEP 14805-407, Araraquara/SP, Brasil.<br />
          E-mail de contato para suporte e privacidade: <a href="mailto:gamadados@gmail.com" className="text-green-600 underline">gamadados@gmail.com</a>.
        </p>
        <p className="mb-3 leading-relaxed">
          Estes Termos incorporam por referência nossa <Link href="/politica-privacidade" className="text-green-600 underline hover:text-green-800">Política de Privacidade</Link>, que governa o tratamento de dados pessoais. Se você não concordar com estes Termos, não utilize nossos Serviços.
        </p>
        <p className="leading-relaxed">
          Nós poderemos atualizar estes Termos a qualquer momento. Quando houver alterações relevantes, avisaremos você pelo aplicativo, e-mail ou outro meio razoável. O uso contínuo do app após a publicação das alterações significa que você concorda com a versão atualizada.
        </p>
      </section>

      {/* Seção 2: Elegibilidade e Registro */}
      <section id="elegibilidade" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">2. Elegibilidade e Registro</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Idade mínima:</strong> Você deve ter pelo menos 18 anos ou ser emancipado legalmente para usar os Serviços. Menores de idade precisam de consentimento parental ou responsável.</li>
          <li><strong>Registro:</strong> Para acessar funcionalidades completas, crie uma conta fornecendo informações precisas (nome, e-mail, senha). Você é responsável por manter a confidencialidade de sua conta e notificar-nos imediatamente sobre qualquer uso não autorizado em <a href="mailto:gamadados@gmail.com" className="text-green-600 underline">gamadados@gmail.com</a>.</li>
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
          Os Serviços são fornecidos “como estão”, sem garantias de precisão absoluta em recomendações nutricionais, que dependem de dados fornecidos pelo usuário.
        </p>
      </section>

      {/* Seção 4: Pagamentos e Assinaturas */}
      <section id="pagamentos" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">4. Pagamentos e Assinaturas</h2>
        <p className="mb-3 leading-relaxed">
          Atualmente, alguns recursos do NutrInfo podem ser gratuitos e outros podem ser oferecidos mediante pagamento, por exemplo, assinaturas ou planos específicos. Sempre que houver cobrança, os valores, forma de pagamento e condições serão apresentados de forma clara dentro do aplicativo, antes da contratação.
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Modelos de precificação:</strong> Gratuito (básico) ou premium (valores e condições serão detalhados no momento da oferta).</li>
          <li><strong>Processamento:</strong> Pagamentos via plataformas seguras de terceiros (ex: Stripe, PagSeguro). Reembolsos seguirão o Código de Defesa do Consumidor (CDC) e as políticas específicas da plataforma de pagamento, informadas no momento da contratação.</li>
          <li><strong>Renovação automática:</strong> Assinaturas podem renovar automaticamente, a menos que canceladas com antecedência, conforme as instruções fornecidas no app ou pela plataforma de pagamento.</li>
          <li><strong>Impostos:</strong> Preços incluem impostos aplicáveis; você é responsável por quaisquer taxas adicionais.</li>
          <li><strong>Não reembolso:</strong> Conteúdo baixado ou acessado pode não ser reembolsável, conforme as políticas aplicáveis.</li>
        </ul>
      </section>

      {/* Seção 5: Propriedade Intelectual */}
      <section id="propriedade" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">5. Propriedade Intelectual</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Direitos nossos:</strong> Todo conteúdo da NutrInfo (textos, designs, algoritmos, marcas como “NutrInfo” e logotipos) é protegido por leis de direitos autorais, marcas e patentes (Lei 9.610/1998 e tratados internacionais). Você recebe uma licença limitada, não exclusiva e revogável para uso pessoal e não comercial.</li>
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
          <li><strong>Foro:</strong> Qualquer disputa será resolvida preferencialmente de forma amigável. Na impossibilidade de acordo, fica eleito o foro da Comarca de Araraquara/SP, Brasil, com renúncia a qualquer outro, por mais privilegiado que seja.</li>
          <li><strong>Mediação:</strong> Antes de litígio, as partes tentarão resolução amigável, podendo buscar plataformas de resolução de conflitos online ou órgãos de defesa do consumidor.</li>
          <li><strong>Arbitragem (opcional):</strong> Para disputas que as partes concordem, poderá ser utilizada a arbitragem, conforme a Lei 9.307/1996.</li>
        </ul>
      </section>

      {/* Seção 10: Disposições Gerais */}
      <section id="disposicoes" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">10. Disposições Gerais</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Integridade:</strong> Estes Termos, junto com a Política de Privacidade, constituem o acordo completo entre as partes, substituindo acordos anteriores.</li>
          <li><strong>Severabilidade:</strong> Se qualquer cláusula for inválida, as demais permanecem em vigor.</li>
          <li><strong>Transferência:</strong> Podemos ceder estes Termos em caso de venda do aplicativo ou parte dele, notificando você. Você não pode ceder sem nosso consentimento.</li>
          <li><strong>Notificações:</strong> Enviadas para o e-mail cadastrado ou notificação no app.</li>
          <li><strong>Força maior:</strong> Não seremos responsáveis por falhas devido a eventos imprevisíveis (ex: desastres naturais, pandemias).</li>
        </ul>
      </section>

      {/* Seção 11: Contato */}
      <section id="contato" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">11. Contato</h2>
        <p className="mb-3 leading-relaxed">Para dúvidas sobre estes Termos ou sobre o uso do aplicativo:</p>
        <ul className="space-y-2">
          <li><strong>Responsável:</strong> Ricardo Gama</li>
          <li><strong>E-mail:</strong> <a href="mailto:gamadados@gmail.com" className="text-green-600 underline">gamadados@gmail.com</a></li>
          <li><strong>Endereço:</strong> Rua Três, 159, Condomínio Buona Vita, CEP 14805-407, Araraquara/SP, Brasil</li>
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
