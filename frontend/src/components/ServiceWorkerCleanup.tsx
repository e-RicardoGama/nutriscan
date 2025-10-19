// src/components/ServiceWorkerCleanup.tsx
'use client';
import { useEffect } from 'react';

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    // Remove service workers problemáticos
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
          console.log('Service Worker removido:', registration);
        });
      });
      
      // Limpa caches antigos
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        });
      }
    }
  }, []);

  return null;
}