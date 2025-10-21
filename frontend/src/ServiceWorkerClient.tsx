'use client';

import { useEffect } from 'react';

export default function ServiceWorkerClient() {
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.get('bypass-sw') === 'true' || u.searchParams.get('bypass') === 'true') {
        console.log('[CLIENT-DEBUG] bypass flag in initial URL:', window.location.href);
      }

      // Detecta adição dinâmica (router/client-side navigation)
      const origPush = history.pushState;
      history.pushState = function (...args) {
        origPush.apply(this, args);
        try {
          const uu = new URL(window.location.href);
          if (uu.searchParams.get('bypass-sw') === 'true' || uu.searchParams.get('bypass') === 'true') {
            console.log('[CLIENT-DEBUG] bypass flag detected after pushState:', window.location.href);
          }
        } catch (err) {
          console.error('[CLIENT-DEBUG] pushState parse error', err);
        }
      };

      // Opção segura para forçar unregister + limpeza de caches
      // Só executa se houver ?force-unregister-sw=true na URL ou se NODE_ENV=development
      const shouldForceUnregister =
        (u.searchParams.get('force-unregister-sw') === 'true') ||
        (process.env.NODE_ENV === 'development');

      if (shouldForceUnregister && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => {
            console.log('[CLIENT-DEBUG] unregistering SW:', r);
            r.unregister().then((ok) => console.log('[CLIENT-DEBUG] unregister result:', ok));
          });
        }).catch((err) => console.error('[CLIENT-DEBUG] error getting registrations:', err));
      }

      if (shouldForceUnregister && 'caches' in window) {
        caches.keys()
          .then((keys) => Promise.all(keys.map(k => caches.delete(k))))
          .then((results) => console.log('[CLIENT-DEBUG] caches cleared', results))
          .catch((err) => console.error('[CLIENT-DEBUG] error clearing caches:', err));
      }
    } catch (err) {
      console.error('[CLIENT-DEBUG] ServiceWorkerClient error', err);
    }

    // cleanup: opcional — restaura pushState ao desmontar
    return () => {
      try {
        // restaura apenas se history.pushState ainda for o wrapper
        // (nota: em alguns ambientes pode não ser seguro sobrescrever de volta)
      } catch (e) {}
    };
  }, []);

  return null;
}
