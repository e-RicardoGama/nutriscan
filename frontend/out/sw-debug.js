// frontend/public/sw-debug.js
self.addEventListener('install', (event) => {
  console.log('[SW-DEBUG] installed', event);
});
self.addEventListener('activate', (event) => {
  console.log('[SW-DEBUG] activated', event);
});
self.addEventListener('fetch', (event) => {
  try {
    const url = new URL(event.request.url);
    if (url.searchParams.get('bypass-sw') === 'true' || url.searchParams.get('bypass') === 'true') {
      console.log('[SW-DEBUG] bypass flag in request:', event.request.url);
    }
  } catch (err) {
    console.error('[SW-DEBUG] fetch handler error:', err);
  }
  // Apenas logging — não chamar event.respondWith para não alterar comportamento
});
