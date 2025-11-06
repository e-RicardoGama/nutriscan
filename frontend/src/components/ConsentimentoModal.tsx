// /components/ConsentimentoModal.tsx
'use client';

import { useState } from 'react';
import ConsentimentoOnboarding from './ConsentimentoOnboarding';

interface ConsentimentoModalProps {
  userEmail: string;
}

export default function ConsentimentoModal({ userEmail }: ConsentimentoModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    // Salva que o usuário fechou sem aceitar (opcional)
    localStorage.setItem('consentDismissed', new Date().toISOString());
  };

  const handleConsentGiven = () => {
    setIsOpen(false);
    // Salva a versão aceita
    localStorage.setItem('consentVersion', '2.1');
    // Recarrega a página para aplicar mudanças
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop com blur */}
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative my-8">
          {/* Botão fechar (X) */}
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10 transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Componente de Consentimento */}
          <div className="max-w-2xl">
            <ConsentimentoOnboarding 
              isModal={true}
              userEmail={userEmail}
              onConsentGiven={handleConsentGiven}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>
    </>
  );
}
