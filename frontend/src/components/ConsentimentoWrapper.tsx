// /components/ConsentimentoWrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import ConsentimentoModal from './ConsentimentoModal';

export default function ConsentimentoWrapper() {
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Verifica se o usuário precisa aceitar novos termos
    const checkConsent = () => {
      const lastConsentVersion = localStorage.getItem('consentVersion');
      const currentVersion = '2.1';
      
      // Verifica se há usuário logado
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          
          // Se a versão do consentimento mudou, mostra o modal
          if (lastConsentVersion !== currentVersion) {
            setUserEmail(user.email || 'usuario@exemplo.com');
            setShowConsentModal(true);
          }
        } catch (error) {
          console.error('Erro ao verificar consentimento:', error);
        }
      }
    };

    // Aguarda um pouco para garantir que o localStorage está acessível
    const timer = setTimeout(checkConsent, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!showConsentModal) return null;

  return <ConsentimentoModal userEmail={userEmail} />;
}
