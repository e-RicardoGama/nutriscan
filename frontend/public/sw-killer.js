// Este ficheiro deve estar em /public/sw-killer.js

self.addEventListener('install', (e) => {
  // Pula a espera e força este novo SW a ativar-se imediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // 1. Reivindica o controlo de todas as páginas abertas
  e.waitUntil(
    self.clients.claim().then(() => {
      // 2. DESREGISTA-SE a si mesmo e a qualquer outro SW neste escopo
      return self.registration.unregister();
    }).then(() => {
      // 3. Obtém todas as páginas controladas
      return self.clients.matchAll({ type: 'window' });
    }).then(clients => {
      // 4. Força um reload em todas elas para que funcionem sem SW
      clients.forEach(client => {
        client.navigate(client.url);
      });
    })
  );
});