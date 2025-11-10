// /components/ConsentimentoOnboarding.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ConsentimentoProps {
  onConsentGiven?: () => void;
  isModal?: boolean;
  userEmail?: string;
  onClose?: () => void;
}

export default function ConsentimentoOnboarding({
  onConsentGiven,
  isModal = false,
  userEmail,
  onClose
}: ConsentimentoProps) {
  const router = useRouter();
  const [consentimentos, setConsentimentos] = useState({
    termos: false,
    privacidade: false,
    marketing: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCheckboxChange = (key: keyof typeof consentimentos) => {
    setConsentimentos(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setError(''); // Limpa erro ao interagir
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação obrigatória (LGPD Art. 8º)
    if (!consentimentos.termos || !consentimentos.privacidade) {
      setError('Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Dados do consentimento para registro
      const consentData = {
        email: userEmail || 'anonimo@exemplo.com',
        consentimentos,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        version: '2.1',
        ip: 'obtido-no-servidor' // Será obtido no backend
      };

      // Envia para a API
      const response = await fetch('/api/consentimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData)
      });

      // Verifica se houve erro
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar');
      }

      // Pega o resultado (com o ID do registro)
      const result = await response.json();
      console.log('✅ Consentimento salvo no banco:', result);

      // Salva no localStorage (backup local)
      if (typeof window !== 'undefined') {
        localStorage.setItem('consentVersion', '2.1');
        localStorage.setItem('consentId', result.id?.toString() || '');
        localStorage.setItem('consentData', JSON.stringify({
          ...consentData,
          id: result.id
        }));
      }

      // Aguarda 500ms para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));

      // Callback ou navegação
      if (onConsentGiven) {
        onConsentGiven();
      } else {
        router.push('/dashboard'); // Ajuste para sua rota
      }

    } catch (err) {
      setError('Erro ao registrar seu consentimento. Tente novamente.');
      console.error('❌ Erro no consentimento:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const isFormValid = consentimentos.termos && consentimentos.privacidade;

  return (
    <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full ${
      isModal ? 'p-6' : 'p-8'
    }`}>
      {/* Header */}
      <div className="mb-6 text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-green-600 mb-2">
          {isModal ? 'Atualização Importante' : 'Bem-vindo à NutrInfo!'}
        </h2>
        <p className="text-gray-600 text-sm">
          {isModal 
            ? 'Atualizamos nossos Termos e Política de Privacidade. Leia e confirme para continuar.'
            : 'Para usar nossos serviços de nutrição personalizada, leia e aceite abaixo.'
          }
        </p>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Checkbox 1: Termos de Uso */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="termos"
              checked={consentimentos.termos}
              onChange={() => handleCheckboxChange('termos')}
              required
              className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="termos" className="block text-sm font-semibold text-gray-900 cursor-pointer">
                Aceito os Termos de Uso <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mt-1 mb-2">
                Regras de uso do app, pagamentos e responsabilidades.
              </p>
              <Link 
                href="/termos-de-uso" 
                target="_blank"
                className="text-green-600 text-xs font-medium underline hover:text-green-800 inline-flex items-center"
              >
                Ler documento completo
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Checkbox 2: Política de Privacidade */}
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="privacidade"
              checked={consentimentos.privacidade}
              onChange={() => handleCheckboxChange('privacidade')}
              required
              className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="privacidade" className="block text-sm font-semibold text-gray-900 cursor-pointer">
                Aceito a Política de Privacidade <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mt-1 mb-2">
                Como protegemos seus dados de saúde conforme LGPD.
              </p>
              <Link 
                href="/politica-privacidade" 
                target="_blank"
                className="text-blue-600 text-xs font-medium underline hover:text-blue-800 inline-flex items-center"
              >
                Ler documento completo
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          {isModal && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
              isFormValid && !isSubmitting
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              isModal ? 'Aceitar e Continuar' : 'Continuar Cadastro'
            )}
          </button>
        </div>

        {/* Informações legais */}
        <div className="pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            <strong>Versão:</strong> 2.1 | <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Consentimento registrado conforme LGPD (Lei 13.709/2018)
          </p>
          {userEmail && (
            <p className="text-xs text-gray-400 mt-1">
              <strong>Conta:</strong> {userEmail}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
