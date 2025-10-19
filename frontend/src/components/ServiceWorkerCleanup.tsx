// src/components/ServiceWorkerCleanup.tsx - VERSÃO CORRIGIDA
'use client';
import { useEffect } from 'react';

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    const cleanupServiceWorkers = async () => {
      console.log('Iniciando limpeza de Service Workers...');
      
      if ('serviceWorker' in navigator) {
        try {
          // 1. Tenta obter o SW atual
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            console.log('Service Worker encontrado, removendo...', registration);
            await registration.unregister();
          }

          // 2. Remove TODOS os registros (usando CONST)
          const registrations = await navigator.serviceWorker.getRegistrations();
          console.log(`Encontrados ${registrations.length} Service Workers`);
          
          for (const reg of registrations) { // ✅ 'const' em vez de 'let'
            await reg.unregister();
            console.log('Service Worker removido:', reg);
          }

          // 3. Limpa TODOS os caches (usando CONST)
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            console.log(`Encontrados ${cacheNames.length} caches`);
            
            for (const cacheName of cacheNames) { // ✅ 'const' em vez de 'let'
              await caches.delete(cacheName);
              console.log('Cache removido:', cacheName);
            }
          }

          console.log('Limpeza completa!');
          
          // 4. Se ainda estiver na URL com bypass, redireciona
          if (window.location.search.includes('bypass-sw')) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState(null, '', cleanUrl);
            console.log('Redirecionado para URL limpa');
          }
        } catch (error) {
          console.error('Erro na limpeza:', error);
        }
      }
    };

    cleanupServiceWorkers();
  }, []);

  return null;
}