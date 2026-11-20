// Minimal PWA Service Worker for Aviko AI v2
const CACHE_NAME = 'aviko-ai-v2-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network requests pass through normally
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
