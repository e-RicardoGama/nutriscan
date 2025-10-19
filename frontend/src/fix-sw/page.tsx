// src/app/fix-sw/page.tsx - VERSÃO CORRIGIDA
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FixServiceWorker() {
  const router = useRouter();

  useEffect(() => {
    const fix = async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) { // ✅ 'const' em vez de 'let'
          await reg.unregister();
        }
        
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const name of cacheNames) { // ✅ 'const' em vez de 'let'
            await caches.delete(name);
          }
        }
        
        // Redireciona para a página principal
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };

    fix();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">🛠️ Corrigindo App...</h1>
        <p className="text-gray-600">Limpando cache e Service Workers...</p>
        <p className="text-sm text-gray-500 mt-4">Você será redirecionado automaticamente</p>
      </div>
    </div>
  );
}