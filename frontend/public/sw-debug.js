// frontend/public/sw-debug.js
self.addEventListener('install', event => {
  console.log('[SW-DEBUG] installed');
});
self.addEventListener('activate', event => {
  console.log('[SW-DEBUG] activated');
});
self.addEventListener('fetch', event => {
  try {
    const url = new URL(event.request.url);
    if (url.searchParams.get('bypass-sw') === 'true' || url.searchParams.get('bypass') === 'true') {
      console.log('[SW-DEBUG] bypass flag in request:', event.request.url);
    }
  } catch (e) { /* ignore */ }
  // apenas logging — não chame event.respondWith aqui para não alterar comportamento
});
