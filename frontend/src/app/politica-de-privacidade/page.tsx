import Link from 'next/link';

export default function PoliticaPrivacidade() {
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8 text-gray-800 bg-white shadow-lg rounded-lg my-8">
      {/* Cabeçalho */}
      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold text-green-600 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-600">
          <strong>NutrInfo</strong> | Atualizado em 18 de novembro de 2025
        </p>
      </header>

      {/* Navegação Interna (Índice) */}
      <nav className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Índice Rápido</h2>
        <ul className="space-y-1 text-sm">
          <li><a href="#introducao" className="text-green-600 hover:underline">1. Introdução</a></li>
          <li><a href="#dados-coletados" className="text-green-600 hover:underline">2. Dados Coletados</a></li>
          <li><a href="#finalidades" className="text-green-600 hover:underline">3. Finalidades do Tratamento</a></li>
          <li><a href="#consentimento" className="text-green-600 hover:underline">4. Consentimento e Base Legal</a></li>
          <li><a href="#direitos" className="text-green-600 hover:underline">5. Direitos dos Usuários</a></li>
          <li><a href="#compartilhamento" className="text-green-600 hover:underline">6. Compartilhamento de Dados</a></li>
          <li><a href="#seguranca" className="text-green-600 hover:underline">7. Medidas de Segurança</a></li>
          <li><a href="#retencao" className="text-green-600 hover:underline">8. Retenção de Dados</a></li>
          <li><a href="#violacao" className="text-green-600 hover:underline">9. Notificação de Violações</a></li>
          <li><a href="#transferencia" className="text-green-600 hover:underline">10. Transferência Internacional</a></li>
          <li><a href="#atualizacoes" className="text-green-600 hover:underline">11. Atualizações da Política</a></li>
          <li><a href="#contato" className="text-green-600 hover:underline">12. Contato e Encarregado de Proteção de Dados</a></li>
        </ul>
      </nav>

      {/* Seção 1: Introdução */}
      <section id="introducao" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">1. Introdução</h2>
        <p className="mb-3 leading-relaxed">
          A <strong>NutrInfo</strong>, desenvolvida e operada por <strong>Ricardo Gama</strong> (pessoa física), valoriza sua privacidade e está comprometida com a proteção de seus dados pessoais, em conformidade com a <strong>LGPD (Lei Geral de Proteção de Dados Pessoais - Lei nº 13.709/2018)</strong> e demais legislações aplicáveis de proteção de dados.
        </p>
        <p className="mb-3 leading-relaxed">
          Esta <strong>Política de Privacidade</strong> detalha como coletamos, processamos, armazenamos, compartilhamos e protegemos suas informações pessoais quando você utiliza nossos serviços (aplicativo móvel, site e serviços relacionados). Ao usar a NutrInfo, você concorda com as práticas descritas nesta política.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="font-semibold text-blue-800">📋 Informações Importantes</p>
          <p className="text-sm text-blue-700 mt-1">
            Esta política se aplica a todos os usuários do NutrInfo, cujo controlador dos dados é <strong>Ricardo Gama</strong>, pessoa física, CPF 104.195.578-22, residente na Rua Três, 159, Condomínio Buona Vita, CEP 14805-407, Araraquara/SP, Brasil.
          </p>
        </div>
      </section>

      {/* Seção 2: Dados Coletados */}
      <section id="dados-coletados" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">2. Dados Coletados</h2>
        <p className="mb-3 leading-relaxed">Coletamos apenas os dados necessários para fornecer e melhorar nossos serviços:</p>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">2.1 Dados de Identificação</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Nome completo</li>
          <li>Endereço de e-mail</li>
          <li>CPF (opcional, para personalização de serviços e verificação de identidade)</li>
          <li>Data de nascimento</li>
          <li>Informações de pagamento (para assinaturas premium)</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">2.2 Dados de Saúde e Nutrição (Dados Sensíveis)</h3>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="font-semibold text-yellow-800">⚠️ Atenção: Dados Sensíveis</p>
          <p className="text-sm text-yellow-700 mt-1">
            Dados de saúde são considerados sensíveis pela LGPD (art. 5º, II) e só são coletados com seu consentimento explícito e específico.
          </p>
        </div>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Histórico nutricional e preferências alimentares</li>
          <li>Alergias e intolerâncias alimentares</li>
          <li>Metas de peso, fitness e saúde</li>
          <li>Condições médicas relevantes (ex: diabetes, hipertensão)</li>
          <li>Atividade física e hábitos de exercício</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">2.3 Dados Técnicos e de Uso</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Endereço IP e informações de geolocalização aproximada</li>
          <li>Tipo de dispositivo, sistema operacional e navegador</li>
          <li>Cookies e tecnologias similares (veja seção 2.4)</li>
          <li>Logs de uso do aplicativo (páginas visitadas, tempo de sessão)</li>
          <li>Dados de integração com wearables (ex: Fitbit, Apple Health)</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">2.4 Cookies e Tecnologias Similares</h3>
        <p className="mb-2">Utilizamos cookies para:</p>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento básico do site/app</li>
          <li><strong>Cookies de Funcionalidade:</strong> Para lembrar preferências do usuário</li>
          <li><strong>Cookies de Análise:</strong> Para entender padrões de uso (Google Analytics)</li>
          <li><strong>Cookies de Publicidade:</strong> Para anúncios personalizados (com consentimento)</li>
        </ul>
        <p className="text-sm text-gray-600">
          Você pode gerenciar cookies nas configurações do navegador ou através do nosso banner de consentimento.
        </p>
      </section>

      {/* Seção 3: Finalidades do Tratamento */}
      <section id="finalidades" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">3. Finalidades do Tratamento</h2>
        <p className="mb-3 leading-relaxed">Seus dados são utilizados exclusivamente para as seguintes finalidades, conforme autorizado pela LGPD:</p>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">3.1 Finalidades Primárias (Execução de Contrato)</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Fornecer serviços personalizados de nutrição e planejamento alimentar</li>
          <li>Processar registros de refeições e rastreamento nutricional</li>
          <li>Gerar relatórios e análises de progresso de saúde</li>
          <li>Integrar dados com dispositivos wearables autorizados</li>
          <li>Processar pagamentos e gerenciar assinaturas premium</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">3.2 Finalidades Secundárias (Consentimento Específico)</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Enviar newsletters, dicas nutricionais e atualizações (pode ser cancelado a qualquer momento)</li>
          <li>Realizar pesquisas de satisfação e melhoria de serviços</li>
          <li>Personalizar anúncios e conteúdo promocional</li>
          <li>Compartilhar dados anonimizados para estudos nutricionais agregados</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">3.3 Finalidades Legais (Cumprimento de Obrigação Legal)</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Cumprir obrigações fiscais, contábeis e trabalhistas</li>
          <li>Responder a solicitações judiciais ou administrativas</li>
          <li>Prevenir fraudes e atividades ilegais</li>
          <li>Manter registros para auditorias de conformidade com a LGPD</li>
        </ul>
      </section>

      {/* Seção 4: Consentimento e Base Legal */}
      <section id="consentimento" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">4. Consentimento e Base Legal</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">4.1 Bases Legais para o Tratamento (LGPD Art. 7º)</h3>
        <p className="mb-3 leading-relaxed">De acordo com a LGPD, tratamos seus dados com base em:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li><strong>Consentimento (Art. 7º, I):</strong> Para dados sensíveis de saúde e marketing, obtemos consentimento específico e inequívoco</li>
          <li><strong>Execução de Contrato (Art. 7º, V):</strong> Para fornecer os serviços solicitados</li>
          <li><strong>Cumprimento de Obrigação Legal (Art. 7º, II):</strong> Para obrigações fiscais e regulatórias</li>
          <li><strong>Legítimo Interesse (Art. 7º, IX):</strong> Para análise de dados agregados e prevenção de fraudes</li>
          <li><strong>Proteção da Vida (Art. 7º, VII):</strong> Em situações de emergência, para proteger a vida ou incolumidade física do titular ou de terceiro</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">4.2 Consentimento para Dados Sensíveis</h3>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="font-semibold text-green-800">✅ Consentimento Explícito</p>
          <p className="text-sm text-green-700 mt-1">
            Para o tratamento de seus dados de saúde e nutrição (dados sensíveis), solicitaremos seu consentimento explícito e específico no momento da coleta, destacando as finalidades e a possibilidade de revogação.
          </p>
        </div>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">4.3 Revogação do Consentimento</h3>
        <p className="leading-relaxed">
          Você pode revogar seu consentimento a qualquer momento, de forma facilitada e gratuita, através das configurações do app (quando disponível) ou enviando e-mail para <a href="mailto:gamadados@gmail.com" className="text-green-600 underline">gamadados@gmail.com</a>. A revogação não afetará a legalidade do tratamento realizado antes da retirada do consentimento.
        </p>
      </section>

      {/* Seção 5: Direitos dos Usuários */}
      <section id="direitos" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">5. Direitos dos Usuários (LGPD Art. 18)</h2>
        <p className="mb-3 leading-relaxed">Você, como titular dos dados, possui os seguintes direitos:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Confirmação e Acesso:</strong> Saber se tratamos seus dados e acessá-los.</li>
          <li><strong>Correção:</strong> Solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
          <li><strong>Anonimização, Bloqueio ou Eliminação:</strong> Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.</li>
          <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado e transferi-los a outro fornecedor de serviço.</li>
          <li><strong>Eliminação:</strong> Solicitar a eliminação de dados pessoais tratados com seu consentimento, exceto nas hipóteses previstas em lei.</li>
          <li><strong>Informação sobre Compartilhamento:</strong> Obter informações sobre as entidades públicas e privadas com as quais compartilhamos seus dados.</li>
          <li><strong>Informação sobre a Possibilidade de Não Fornecer Consentimento:</strong> Ser informado sobre as consequências de não fornecer consentimento e sobre a possibilidade de revogá-lo.</li>
          <li><strong>Oposição:</strong> Opor-se ao tratamento de dados realizado com base em outras bases legais, em caso de descumprimento da LGPD.</li>
          <li><strong>Revisão de Decisões Automatizadas:</strong> Solicitar a revisão de decisões tomadas unicamente com base em tratamento automatizado de dados pessoais que afetem seus interesses.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600 italic">
          Para exercer qualquer um desses direitos, entre em contato conosco através do e-mail <a href="mailto:gamadados@gmail.com" className="text-green-600 underline">gamadados@gmail.com</a>. Responderemos à sua solicitação no prazo legal.
        </p>
      </section>

      {/* Seção 6: Compartilhamento de Dados */}
      <section id="compartilhamento" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">6. Compartilhamento de Dados</h2>
        <p className="mb-3 leading-relaxed">Seus dados pessoais podem ser compartilhados nas seguintes situações:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Com prestadores de serviços:</strong> Para operar o app (ex: serviços de hospedagem, processamento de pagamentos, ferramentas de análise de uso). Esses terceiros são contratualmente obrigados a proteger seus dados.</li>
          <li><strong>Com autoridades legais:</strong> Em resposta a ordens judiciais, solicitações governamentais ou para cumprir obrigações legais.</li>
          <li><strong>Em caso de reestruturação:</strong> Se o NutrInfo for vendido, fundido ou transferido, seus dados podem ser transferidos ao novo proprietário, que deverá manter esta Política de Privacidade.</li>
          <li><strong>Com seu consentimento:</strong> Para outras finalidades específicas, mediante seu consentimento explícito.</li>
          <li><strong>Dados anonimizados:</strong> Podemos compartilhar dados agregados e anonimizados que não identificam você pessoalmente para fins de pesquisa, análise de mercado ou melhoria de serviços.</li>
        </ul>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="font-semibold text-yellow-800">⚠️ Sem Venda de Dados</p>
          <p className="text-sm text-yellow-700 mt-1">
            Nós não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros para fins de marketing direto sem o seu consentimento explícito.
          </p>
        </div>
      </section>

      {/* Seção 7: Medidas de Segurança */}
      <section id="seguranca" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">7. Medidas de Segurança</h2>
        <p className="mb-3 leading-relaxed">Adotamos medidas técnicas e administrativas para proteger seus dados pessoais contra acesso não autorizado, destruição, perda, alteração, comunicação ou qualquer forma de tratamento inadequado ou ilícito. Nossas medidas incluem:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Criptografia de dados em trânsito e em repouso.</li>
          <li>Controles de acesso rigorosos aos sistemas e dados.</li>
          <li>Monitoramento contínuo de segurança.</li>
          <li>Uso de firewalls e sistemas de detecção de intrusão.</li>
          <li>Realização de backups regulares.</li>
          <li>Anonimização e pseudonimização de dados sempre que possível.</li>
        </ul>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="font-semibold text-blue-800">🔒 Sua Segurança é Prioridade</p>
          <p className="text-sm text-blue-700 mt-1">
            Embora nos esforcemos para proteger seus dados, nenhuma transmissão pela internet é 100% segura. Você também tem um papel importante na proteção de sua conta, mantendo sua senha confidencial.
          </p>
        </div>
      </section>

      {/* Seção 8: Retenção de Dados */}
      <section id="retencao" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">8. Retenção de Dados</h2>
        <p className="mb-3 leading-relaxed">Retemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletados, incluindo para fins de cumprimento de obrigações legais, regulatórias, fiscais, contábeis, ou para o exercício regular de direitos em processos judiciais, administrativos ou arbitrais.</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Dados de cadastro:</strong> Mantidos enquanto sua conta estiver ativa e por um período adicional após o encerramento, conforme exigido por lei.</li>
          <li><strong>Dados de saúde:</strong> Retidos enquanto forem relevantes para os serviços personalizados e com seu consentimento, sendo anonimizados ou eliminados após o término da finalidade.</li>
          <li><strong>Dados de transação:</strong> Mantidos pelos prazos legais e fiscais aplicáveis.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600 italic">
          Após o término do período de retenção, seus dados serão eliminados ou anonimizados de forma segura.
        </p>
      </section>

      {/* Seção 9: Notificação de Violações */}
      <section id="violacao" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">9. Notificação de Violações</h2>
        <p className="mb-3 leading-relaxed">
          Em caso de ocorrência de incidente de segurança que possa acarretar risco ou dano relevante aos seus dados pessoais, envidaremos esforços razoáveis para comunicar os usuários afetados e a Autoridade Nacional de Proteção de Dados (ANPD), quando aplicável, em prazo adequado, conforme exigido pela LGPD.
        </p>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="font-semibold text-red-800">🚨 Reporte de Incidentes</p>
          <p className="text-sm text-red-700 mt-1">
            Se você identificar qualquer vulnerabilidade ou suspeita de incidente de segurança, por favor, entre em contato imediatamente pelo e-mail <a href="mailto:gamadados@gmail.com" className="text-red-600 underline">gamadados@gmail.com</a>.
          </p>
        </div>
      </section>

      {/* Seção 10: Transferência Internacional */}
      <section id="transferencia" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">10. Transferência Internacional de Dados</h2>
        <p className="mb-3 leading-relaxed">
          Para a operação do NutrInfo, podemos utilizar serviços de terceiros que podem processar ou armazenar dados em servidores localizados fora do Brasil. Nesses casos, a transferência internacional de dados é realizada em conformidade com a LGPD, garantindo que os países ou organizações internacionais destinatárias proporcionem um nível de proteção de dados adequado ou que sejam adotadas garantias contratuais e técnicas apropriadas.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">10.1 Principais Destinos e Garantias</h3>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Destino</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Tipo de Dados</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Base Legal / Garantia</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Exemplos de Serviços</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Estados Unidos</td>
                <td className="border border-gray-300 px-4 py-2">Dados de identificação, técnicos, uso, pagamento</td>
                <td className="border border-gray-300 px-4 py-2">Cláusulas Contratuais Padrão (SCCs), Consentimento</td>
                <td className="border border-gray-300 px-4 py-2">Hospedagem (Vercel, AWS), Analytics (Google Analytics), Pagamento (Stripe)</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">União Europeia</td>
                <td className="border border-gray-300 px-4 py-2">Dados de análise agregada</td>
                <td className="border border-gray-300 px-4 py-2">Decisão de Adequação (GDPR)</td>
                <td className="border border-gray-300 px-4 py-2">Ferramentas de pesquisa e análise</td>
              </tr>
              <tr className="hover:bg-gray-50 bg-red-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Dados de Saúde</td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Nenhum</td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Processados exclusivamente no Brasil</td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Proteção máxima de dados sensíveis</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">10.2 Garantias de Proteção</h3>
        <p className="mb-3 leading-relaxed">Para todas as transferências internacionais, garantimos que:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li>São utilizados apenas parceiros que oferecem garantias de conformidade com a LGPD e outras leis de proteção de dados.</li>
          <li>São aplicadas cláusulas contratuais padrão ou outras ferramentas legais que assegurem um nível de proteção de dados equivalente ao brasileiro.</li>
          <li>Seu consentimento explícito será solicitado para transferências de dados sensíveis, quando aplicável.</li>
        </ul>

        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
          <p className="font-semibold text-purple-800">🌍 Seu Direito de Saber</p>
          <p className="text-sm text-purple-700 mt-1">
            Você pode solicitar mais informações sobre as transferências internacionais de dados e as garantias adotadas através do e-mail <a href="mailto:gamadados@gmail.com" className="text-purple-600 underline">gamadados@gmail.com</a>.
          </p>
        </div>
      </section>

      {/* Seção 11: Atualizações da Política */}
      <section id="atualizacoes" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">11. Atualizações da Política</h2>
        <p className="mb-3 leading-relaxed">Podemos atualizar esta Política de Privacidade para refletir:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li>Mudanças na legislação de proteção de dados (LGPD, etc.)</li>
          <li>Novos serviços ou funcionalidades da NutrInfo</li>
          <li>Melhorias em nossas práticas de segurança e privacidade</li>
          <li>Alterações em nossos parceiros e prestadores de serviços</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">11.1 Como Seremos Notificados</h3>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="font-semibold text-blue-800">📧 Canais de Notificação</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm text-blue-700">
            <li><strong>E-mail:</strong> Para todas as alterações materiais, enviado para o endereço cadastrado</li>
            <li><strong>Notificação Push:</strong> No aplicativo móvel, para usuários ativos</li>
            <li><strong>Banner no Site/App:</strong> Visível por 30 dias após a atualização</li>
            <li><strong>Pop-up de Consentimento:</strong> Para alterações que afetem direitos fundamentais</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">11.2 Versões Anteriores</h3>
        <p className="leading-relaxed">
          Todas as versões anteriores desta Política, se houver, estarão arquivadas e disponíveis para consulta mediante solicitação em <a href="mailto:gamadados@gmail.com" className="text-green-600 underline">gamadados@gmail.com</a>.
        </p>

        <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Última Atualização Significativa:</strong> 18 de novembro de 2025 - Adaptação para pessoa física, atualização de dados de contato e simplificação de algumas cláusulas.
        </p>
      </section>

      {/* Seção 12: Contato */}
      <section id="contato" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">12. Contato e Encarregado de Proteção de Dados</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">12.1 Encarregado de Proteção de Dados (DPO)</h3>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="font-semibold text-green-800">👤 Dados do Encarregado (LGPD Art. 41)</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm text-green-700">
            <li><strong>Nome do Controlador e Encarregado:</strong> Ricardo Gama</li>
            <li><strong>E-mail:</strong> <a href="mailto:gamadados@gmail.com" className="text-green-600 underline">gamadados@gmail.com</a></li>
            <li><strong>Endereço:</strong> Rua Três, 159, Condomínio Buona Vita, CEP 14805-407, Araraquara/SP, Brasil</li>
            <li>
              No momento, não há um DPO formalmente nomeado além do próprio controlador. Todas as demandas de privacidade são tratadas diretamente por Ricardo Gama.
            </li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">12.2 Canais de Atendimento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Para Exercer Direitos (LGPD Art. 18)</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="mailto:gamadados@gmail.com" className="text-green-600 underline">gamadados@gmail.com</a></li>
              <li>Formulário no app: Configurações &gt; Privacidade &gt; Meus Direitos (se disponível)</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Para Incidentes de Segurança</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="mailto:gamadados@gmail.com" className="text-red-600 underline">gamadados@gmail.com</a></li>
              <li>Reporte de vulnerabilidades: Utilize o e-mail acima para comunicação imediata.</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">12.3 Reclamações à ANPD</h3>
        <p className="leading-relaxed mb-4">
          Se não estiver satisfeito com nossa resposta ou acredita que seus direitos foram violados, você pode apresentar reclamação diretamente à:
        </p>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Autoridade Nacional de Proteção de Dados (ANPD)</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            <li><strong>Site:</strong> <a href="https://www.gov.br/anpd/pt-br" className="underline" target="_blank" rel="noopener noreferrer">www.gov.br/anpd</a></li>
            <li><strong>E-mail:</strong> <a href="mailto:ouvidoria@anpd.gov.br" className="underline">ouvidoria@anpd.gov.br</a></li>
            <li><strong>Telefone:</strong> 0800 123 4567 (disponível em todo o Brasil)</li>
            <li><strong>Endereço:</strong> SAI/SO, Quadra 1, Bloco A, Edifício ANPD, Brasília/DF</li>
          </ul>
        </div>

        <p className="mt-4 text-sm text-gray-600 italic">
          <strong>Conformidade LGPD:</strong> O NutrInfo, operado por Ricardo Gama, busca cumprir todas as obrigações de controlador de dados pessoais, conforme a LGPD.
        </p>
      </section>

      {/* Rodapé */}
      <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
        <div className="mb-4">
          <p>
            Esta Política de Privacidade foi elaborada em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong> e demais legislações aplicáveis.
          </p>
        </div>
        <div className="mb-4">
          <p>
            <strong>Última revisão legal:</strong> 18 de novembro de 2025 | <strong>Versão:</strong> 2.2
          </p>
          <p className="mt-2">
            Recomendamos que um advogado especializado em proteção de dados revise periodicamente para garantir conformidade contínua.
          </p>
        </div>
        <div className="space-x-4">
          <Link href="/termos-de-uso" className="text-green-600 underline hover:text-green-800">Termos de Uso</Link>
          <Link href="/" className="text-green-600 underline hover:text-green-800">Voltar ao Início</Link>
          <a href="mailto:gamadados@gmail.com" className="text-green-600 underline hover:text-green-800">Precisa de Ajuda?</a>
        </div>
      </footer>
    </main>
  );
}
