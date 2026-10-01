const CACHE = 'prosthuti-local-v1';
const FILES = [
  './',
  './index.html',
  './src/app/style.css',
  './src/app/app.js',
  './src/app/demo-content.js',
  './src/app/learning.js',
  './src/app/study.js',
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin)
    return;
  if (
    !FILES.some(
      (file) =>
        new URL(file, self.registration.scope).pathname === url.pathname,
    )
  )
    return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE).then((cache) => cache.put(event.request, copy)),
          );
        }
        return response;
      })
      .catch(
        async () => (await caches.match(event.request)) || Response.error(),
      ),
  );
});
