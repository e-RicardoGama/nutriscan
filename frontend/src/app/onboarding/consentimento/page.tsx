// /app/onboarding/consentimento/page.tsx
'use client';

import ConsentimentoOnboarding from '../../../components/ConsentimentoOnboarding';
import { useRouter } from 'next/navigation';

export default function OnboardingConsentimento() {
  const router = useRouter();

  const handleConsentGiven = () => {
    // Salva que o usuário aceitou os termos
    localStorage.setItem('consentVersion', '2.1');
    localStorage.setItem('onboardingCompleted', 'consent');
    
    // Prossegue para próxima etapa do onboarding
    router.push('/onboarding/perfil');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Logo ou título do app (opcional) */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600">NutrInfo</h1>
          <p className="text-gray-600 mt-2">Sua jornada para uma alimentação saudável começa aqui</p>
        </div>

        {/* Componente de consentimento */}
        <ConsentimentoOnboarding onConsentGiven={handleConsentGiven} />
      </div>
    </div>
  );
}
