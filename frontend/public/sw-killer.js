// Localização: /public/sw-killer.js
// VERSÃO 2.1 (Ajustada para o linter)

// O 'install' não usa o evento 'e', por isso removemo-lo
self.addEventListener('install', () => {
  // Pula a espera e força este novo SW a ativar-se imediatamente
  self.skipWaiting();
});

// O 'activate' USA o evento (e.waitUntil), por isso mantemos o '(e)'
self.addEventListener('activate', (e) => {
  // Quando ativado, apenas desregistra a si mesmo e ao zumbi.
  e.waitUntil(
    self.clients.claim().then(() => {
      console.log('SW "Assassino" ativado. A desregistar tudo...');
      return self.registration.unregister();
    })
  );
});