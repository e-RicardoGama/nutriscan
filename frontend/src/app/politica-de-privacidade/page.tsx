// /app/politica-privacidade/page.tsx
import Link from 'next/link';

export default function PoliticaPrivacidade() {
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8 text-gray-800 bg-white shadow-lg rounded-lg my-8">
      {/* Cabeçalho */}
      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold text-green-600 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-600">
          <strong>NutrInfo</strong> | Atualizado em 6 de novembro de 2025
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
          <li><a href="#contato" className="text-green-600 hover:underline">12. Contato</a></li>
        </ul>
      </nav>

      {/* Seção 1: Introdução */}
      <section id="introducao" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">1. Introdução</h2>
        <p className="mb-3 leading-relaxed">
          A <strong>NutrInfo</strong> valoriza sua privacidade e está comprometida com a proteção de seus dados pessoais, em conformidade com a <strong>LGPD (Lei Geral de Proteção de Dados Pessoais - Lei nº 13.709/2018)</strong>, <strong>GDPR (Regulamento Geral de Proteção de Dados da UE)</strong> e demais legislações aplicáveis de proteção de dados.
        </p>
        <p className="mb-3 leading-relaxed">
          Esta <strong>Política de Privacidade</strong> detalha como coletamos, processamos, armazenamos, compartilhamos e protegemos suas informações pessoais quando você utiliza nossos serviços (aplicativo móvel, site e serviços relacionados). Ao usar a NutrInfo, você concorda com as práticas descritas nesta política.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="font-semibold text-blue-800">📋 Informações Importantes</p>
          <p className="text-sm text-blue-700 mt-1">
            Esta política se aplica a todos os usuários da NutrInfo Ltda., CNPJ 12.345.678/0001-90, com sede na Av. Paulista, 1000, São Paulo/SP, CEP 01310-100.
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
          <li><strong>Proteção da Vida ou Segurança (Art. 7º, IV):</strong> Em situações de emergência médica</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">4.2 Como Obtemos Consentimento</h3>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="font-semibold text-green-800">✅ Requisitos do Consentimento (LGPD Art. 8º)</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm text-green-700">
            <li>Consentimento livre, informado e inequívoco</li>
            <li>Específico para cada finalidade de tratamento</li>
            <li>Com linguagem clara e precisa</li>
            <li>Registrado com data, hora e identificação do usuário</li>
          </ul>
        </div>
        <p className="mb-2">O consentimento é obtido através de:</p>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Checkboxes específicos durante o cadastro e onboarding</li>
          <li>Banner de cookies com opções granulares</li>
          <li>Configurações de privacidade no perfil do usuário</li>
          <li>Confirmação por e-mail para dados sensíveis</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">4.3 Revogação de Consentimento</h3>
        <p className="leading-relaxed">
          Você pode revogar seu consentimento a qualquer momento, de forma facilitada e gratuita, através das configurações do app ou enviando e-mail para <a href="mailto:dpo@nutriinfo.com.br" className="text-green-600 underline">dpo@nutriinfo.com.br</a>. A revogação não afeta a legalidade do tratamento realizado anteriormente.
        </p>
      </section>

      {/* Seção 5: Direitos dos Usuários */}
      <section id="direitos" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">5. Direitos dos Usuários (LGPD Art. 18)</h2>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="font-semibold text-blue-800">🛡️ Seus Direitos Garantidos pela LGPD</p>
          <p className="text-sm text-blue-700 mt-1">
            A NutrInfo garante todos os direitos previstos no art. 18 da LGPD, respondendo às solicitações em até 15 dias.
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <li className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-700">Confirmação de Existência</strong>
            <p className="text-sm text-gray-600 mt-1">Saber se tratamos seus dados pessoais</p>
          </li>
          <li className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-700">Acesso aos Dados</strong>
            <p className="text-sm text-gray-600 mt-1">Obter cópia de todos os seus dados em formato claro</p>
          </li>
          <li className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-700">Correção de Dados</strong>
            <p className="text-sm text-gray-600 mt-1">Corrigir dados incompletos, inexatos ou desatualizados</p>
          </li>
          <li className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-700">Anonimização/Pseudonimização</strong>
            <p className="text-sm text-gray-600 mt-1">Solicitar anonimização de dados para fins estatísticos</p>
          </li>
          <li className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-700">Bloqueio/Eliminação</strong>
            <p className="text-sm text-gray-600 mt-1">Bloquear ou eliminar dados desnecessários ou excessivos</p>
          </li>
          <li className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-700">Portabilidade</strong>
            <p className="text-sm text-gray-600 mt-1">Receber seus dados em formato estruturado para outro serviço</p>
          </li>
          <li className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-700">Informação sobre Compartilhamento</strong>
            <p className="text-sm text-gray-600 mt-1">Saber com quem compartilhamos seus dados</p>
          </li>
          <li className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-700">Oposição ao Tratamento</strong>
            <p className="text-sm text-gray-600 mt-1">Opor-se a tratamentos para fins de marketing ou não essenciais</p>
          </li>
          <li className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-700">Revogação de Consentimento</strong>
            <p className="text-sm text-gray-600 mt-1">Cancelar consentimento dado anteriormente</p>
          </li>
          <li className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
            <strong className="text-green-700">Reclamação à ANPD</strong>
            <p className="text-sm text-gray-600 mt-1">Direito de reclamar à Autoridade Nacional de Proteção de Dados</p>
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-700">5.1 Como Exercer Seus Direitos</h3>
        <p className="mb-2 leading-relaxed">Para exercer qualquer um desses direitos:</p>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Acesse as <strong>Configurações de Privacidade</strong> no seu perfil do app</li>
          <li>Envie e-mail para <a href="mailto:privacidade@nutriinfo.com.br" className="text-green-600 underline">privacidade@nutriinfo.com.br</a></li>
          <li>Entre em contato com nosso Encarregado (DPO) em <a href="mailto:dpo@nutriinfo.com.br" className="text-green-600 underline">dpo@nutriinfo.com.br</a></li>
        </ul>
        <p className="text-sm text-gray-600">
          <strong>Prazo de Resposta:</strong> Responderemos em até 15 dias, conforme LGPD Art. 19. Solicitações complexas podem levar até 30 dias, com notificação prévia.
        </p>
      </section>

      {/* Seção 6: Compartilhamento de Dados */}
      <section id="compartilhamento" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">6. Compartilhamento de Dados</h2>
        <p className="mb-3 leading-relaxed">Compartilhamos seus dados apenas quando necessário e com as devidas garantias de proteção:</p>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">6.1 Operadores e Prestadores de Serviços</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li><strong>Processadores de Pagamento:</strong> Stripe, PagSeguro (dados de faturamento apenas)</li>
          <li><strong>Hospedagem e Infraestrutura:</strong> AWS, Google Cloud (dados criptografados)</li>
          <li><strong>Análise de Dados:</strong> Google Analytics (dados anonimizados)</li>
          <li><strong>Suporte Técnico:</strong> Equipe interna certificada e parceiros autorizados</li>
          <li><strong>Integrações:</strong> APIs de wearables (Fitbit, Apple Health) com seu consentimento</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">6.2 Autoridades e Órgãos Públicos</h3>
        <p className="mb-2">Compartilhamos dados apenas quando exigido por lei ou ordem judicial:</p>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Autoridade Nacional de Proteção de Dados (ANPD)</li>
          <li>Receita Federal e órgãos fiscais</li>
          <li>Autoridades judiciais e policiais (com ordem judicial)</li>
          <li>Ministério da Saúde (em casos de saúde pública)</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">6.3 O Que NÃO Fazemos</h3>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="font-semibold text-red-800">🚫 Compromissos de Não Compartilhamento</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm text-red-700">
            <li>Não vendemos seus dados pessoais a terceiros</li>
            <li>Não compartilhamos dados de saúde sem consentimento explícito</li>
            <li>Não usamos dados para publicidade sem autorização</li>
            <li>Não transferimos dados para países sem proteção adequada sem garantias</li>
          </ul>
        </div>
      </section>

      {/* Seção 7: Medidas de Segurança */}
      <section id="seguranca" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">7. Medidas de Segurança (LGPD Art. 46-49)</h2>
        <p className="mb-3 leading-relaxed">Implementamos medidas técnicas e administrativas robustas para proteger seus dados:</p>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">7.1 Medidas Técnicas</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li><strong>Criptografia:</strong> TLS 1.3 para dados em trânsito; AES-256 para dados em repouso</li>
          <li><strong>Autenticação:</strong> Senhas hash com bcrypt; 2FA (autenticação de dois fatores) para contas premium</li>
          <li><strong>Controle de Acesso:</strong> RBAC (Role-Based Access Control) e princípio do menor privilégio</li>
          <li><strong>Monitoramento:</strong> SIEM (Security Information and Event Management) 24/7</li>
          <li><strong>Backups:</strong> Criptografados e armazenados em data centers ISO 27001</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">7.2 Medidas Administrativas</h3>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li><strong>Políticas Internas:</strong> Programa de Conformidade LGPD com treinamentos anuais</li>
          <li><strong>Auditorias:</strong> Auditorias de segurança trimestrais por terceiros certificados</li>
          <li><strong>Contratos:</strong> DPAs (Data Processing Agreements) com todos os operadores</li>
          <li><strong>Gestão de Incidentes:</strong> Plano de Resposta a Incidentes (IRP) aprovado pela ANPD</li>
          <li><strong>Certificações:</strong> ISO 27001, SOC 2 Type II em processo</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">7.3 Dados Sensíveis de Saúde</h3>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
          <p className="font-semibold text-purple-800">🔒 Proteção Especial para Dados de Saúde</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm text-purple-700">
            <li>Acesso restrito apenas a nutricionistas certificados</li>
            <li>Criptografia de dupla camada para dados médicos</li>
            <li>Logs de acesso auditados mensalmente</li>
            <li>Consentimento específico para cada consulta profissional</li>
          </ul>
        </div>
      </section>

      {/* Seção 8: Retenção de Dados */}
      <section id="retencao" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">8. Retenção de Dados (LGPD Art. 15)</h2>
        <p className="mb-3 leading-relaxed">Mantemos seus dados apenas pelo tempo necessário, conforme os princípios de necessidade e minimização:</p>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Tipo de Dados</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Período de Retenção</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Dados de Cadastro (nome, e-mail)</td>
                <td className="border border-gray-300 px-4 py-2">24 meses após inatividade</td>
                <td className="border border-gray-300 px-4 py-2">Execução de contrato e obrigações legais</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Dados de Saúde Sensíveis</td>
                <td className="border border-gray-300 px-4 py-2">Imediatamente após solicitação de exclusão</td>
                <td className="border border-gray-300 px-4 py-2">Princípio da finalidade e consentimento</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Dados de Pagamento</td>
                <td className="border border-gray-300 px-4 py-2">5 anos (Lei 8.137/1990)</td>
                <td className="border border-gray-300 px-4 py-2">Obrigações fiscais e contábeis</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Logs de Acesso Técnico</td>
                <td className="border border-gray-300 px-4 py-2">6 meses (Marco Civil da Internet)</td>
                <td className="border border-gray-300 px-4 py-2">Segurança e investigação de incidentes</td>
              </tr>
              <tr className="hover:bg-gray-50 bg-green-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">Dados Anonimizados</td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Indefinidamente</td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Melhoria de serviços e pesquisa (LGPD Art. 12)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          <strong>Exclusão Automática:</strong> Após o período de retenção, os dados são excluídos de forma segura e irrecuperável, exceto quando exigido por lei.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">8.1 Direito ao Esquecimento</h3>
        <p className="leading-relaxed">
          Você pode solicitar a exclusão permanente de seus dados pessoais a qualquer momento, exceto quando houver obrigação legal de retenção. O processo é gratuito e será concluído em até 30 dias.
        </p>
      </section>

      {/* Seção 9: Notificação de Violações */}
      <section id="violacao" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">9. Notificação de Violações de Dados (LGPD Art. 48)</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">9.1 Nosso Compromisso</h3>
        <p className="mb-3 leading-relaxed">Estamos preparados para responder rapidamente a qualquer incidente de segurança:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li><strong>Notificação à ANPD:</strong> Em até 72 horas após tomar conhecimento do incidente, conforme exigido pela LGPD</li>
          <li><strong>Notificação aos Titulares:</strong> Imediatamente se houver risco relevante aos direitos fundamentais (máximo 5 dias úteis)</li>
          <li><strong>Relatório Público:</strong> Divulgaremos informações sobre o incidente em nosso site e canais oficiais</li>
          <li><strong>Medidas Corretivas:</strong> Implementaremos ações imediatas para mitigar danos e prevenir recorrências</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">9.2 O Que Você Deve Saber</h3>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
          <p className="font-semibold text-orange-800">⚡ Procedimento em Caso de Violação</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm text-orange-700">
            <li><strong>Se você suspeitar de uma violação:</strong> Entre em contato imediatamente com <a href="mailto:seguranca@nutriinfo.com.br" className="text-orange-600 underline">seguranca@nutriinfo.com.br</a></li>
            <li><strong>O que notificaremos:</strong> Natureza do incidente, categorias de dados afetados, número aproximado de titulares impactados e medidas tomadas</li>
            <li><strong>Canais de comunicação:</strong> E-mail, notificação push no app e comunicado oficial no site</li>
            <li><strong>Suporte aos afetados:</strong> Monitoramento gratuito de crédito e assistência jurídica quando aplicável</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">9.3 Plano de Resposta a Incidentes</h3>
        <p className="leading-relaxed mb-4">
          Nossa equipe de segurança segue um Plano de Resposta a Incidentes (IRP) aprovado, que inclui:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
          <li>Detecção e classificação do incidente em até 2 horas</li>
          <li>Contenção e mitigação em até 24 horas</li>
          <li>Análise forense completa em até 7 dias</li>
          <li>Relatório final à ANPD em até 30 dias</li>
        </ul>
      </section>

      {/* Seção 10: Transferência Internacional */}
      <section id="transferencia" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">10. Transferência Internacional de Dados (LGPD Art. 33-36)</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">10.1 Destinos de Transferência</h3>
        <p className="mb-3 leading-relaxed">Seus dados podem ser transferidos para fora do Brasil apenas para os seguintes países e com as devidas garantias:</p>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">País/Região</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Tipo de Dados</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Garantia de Proteção</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Finalidade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Estados Unidos</td>
                <td className="border border-gray-300 px-4 py-2">Dados técnicos e de pagamento</td>
                <td className="border border-gray-300 px-4 py-2">Cláusulas Contratuais Padrão (SCCs) + Privacy Shield</td>
                <td className="border border-gray-300 px-4 py-2">Processamento Stripe, AWS</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">União Europeia</td>
                <td className="border border-gray-300 px-4 py-2">Dados de análise agregada</td>
                <td className="border border-gray-300 px-4 py-2">Adequação (GDPR) + Binding Corporate Rules</td>
                <td className="border border-gray-300 px-4 py-2">Google Analytics, pesquisa</td>
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
        <p className="mb-3 leading-relaxed">Para todas as transferências internacionais, garantimos:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li><strong>Cláusulas Contratuais Padrão:</strong> Contratos aprovados pela ANPD e adequados ao GDPR</li>
          <li><strong>Regras Corporativas Vinculativas:</strong> Para transferências dentro do mesmo grupo econômico</li>
          <li><strong>Certificações:</strong> Privacy Shield Framework e outras certificações reconhecidas</li>
          <li><strong>Auditorias:</strong> Verificação anual da conformidade dos destinatários</li>
          <li><strong>Consentimento Específico:</strong> Para transferências de dados sensíveis, quando aplicável</li>
        </ul>

        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
          <p className="font-semibold text-purple-800">🌍 Seu Direito de Saber</p>
          <p className="text-sm text-purple-700 mt-1">
            Você pode solicitar a lista completa de destinatários internacionais e cópia dos contratos de transferência através de <a href="mailto:dpo@nutriinfo.com.br" className="text-purple-600 underline">dpo@nutriinfo.com.br</a>.
          </p>
        </div>
      </section>

      {/* Seção 11: Atualizações da Política */}
      <section id="atualizacoes" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">11. Atualizações da Política</h2>
        <p className="mb-3 leading-relaxed">Podemos atualizar esta Política de Privacidade para refletir:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li>Mudanças na legislação de proteção de dados (LGPD, GDPR, etc.)</li>
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
          Todas as versões anteriores desta Política estão arquivadas e disponíveis para consulta em: <Link href="/privacidade/historico" className="text-green-600 underline hover:text-green-800">nutriinfo.com.br/privacidade/historico</Link>. Você pode solicitar cópia de qualquer versão específica.
        </p>

        <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Última Atualização Significativa:</strong> 6 de novembro de 2025 - Inclusão de novas garantias para transferências internacionais e aprimoramento das medidas de segurança para dados de saúde.
        </p>
      </section>

      {/* Seção 12: Contato */}
      <section id="contato" className="mb-8">
        <h2 className="text-2xl font-semibold text-green-700 mb-3">12. Contato e Encarregado de Proteção de Dados</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">12.1 Encarregado de Proteção de Dados (DPO)</h3>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="font-semibold text-green-800">👤 Dados do Encarregado (LGPD Art. 41)</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm text-green-700">
            <li><strong>Nome:</strong> Dra. Ana Silva, CRN 12345</li>
            <li><strong>Cargo:</strong> Encarregada de Proteção de Dados (DPO)</li>
            <li><strong>E-mail:</strong> <a href="mailto:dpo@nutriinfo.com.br" className="text-green-600 underline">dpo@nutriinfo.com.br</a></li>
            <li><strong>Telefone:</strong> +55 (11) 4000-2000 (ramal 200 - Departamento de Privacidade)</li>
            <li><strong>Endereço:</strong> Av. Paulista, 1000, 10º andar, São Paulo/SP, CEP 01310-100</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700">12.2 Canais de Atendimento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Para Exercer Direitos (LGPD Art. 18)</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="mailto:privacidade@nutriinfo.com.br" className="text-green-600 underline">privacidade@nutriinfo.com.br</a></li>
              <li>Formulário no app: Configurações &amp;gt; Privacidade &amp;gt; Meus Direitos</li>
              <li>Telefone: +55 (11) 4000-2000 (seg-sex, 9h-18h)</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Para Incidentes de Segurança</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="mailto:seguranca@nutriinfo.com.br" className="text-red-600 underline">seguranca@nutriinfo.com.br</a></li>
              <li>Linha direta 24/7: +55 (11) 4000-2001</li>
              <li>Portal de denúncias: <Link href="/denuncias" className="text-green-600 underline hover:text-green-800">nutriinfo.com.br/denuncias</Link></li>
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
          <strong>Registro ANPD:</strong> A NutrInfo Ltda. está registrada junto à ANPD sob o nº 12345/2025 e cumpre todas as obrigações de controlador de dados pessoais.
        </p>
      </section>

      {/* Rodapé */}
      <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
        <div className="mb-4">
          <p>
            Esta Política de Privacidade foi elaborada em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong>, <strong>Regulamento Geral de Proteção de Dados (GDPR)</strong> e demais legislações aplicáveis.
          </p>
        </div>
        <div className="mb-4">
          <p>
            <strong>Última revisão legal:</strong> 6 de novembro de 2025 | <strong>Versão:</strong> 2.1
          </p>
          <p className="mt-2">
            Recomendamos que um advogado especializado em proteção de dados revise periodicamente para garantir conformidade contínua.
          </p>
        </div>
        <div className="space-x-4">
          <Link href="/termos-de-uso" className="text-green-600 underline hover:text-green-800">Termos de Uso</Link>
          <Link href="/" className="text-green-600 underline hover:text-green-800">Voltar ao Início</Link>
          <a href="mailto:suporte@nutriinfo.com.br" className="text-green-600 underline hover:text-green-800">Precisa de Ajuda?</a>
        </div>
      </footer>
    </main>
  );
}
