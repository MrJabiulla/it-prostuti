const CACHE = 'prosthuti-next-v1';
const LEGACY_CACHE = 'prosthuti-local-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const response = await fetch('/', { cache: 'reload' });
      if (!response.ok) throw new Error('App download failed.');
      const html = await response.clone().text();
      const assets = new Set(['/student.js']);
      for (const match of html.matchAll(/(?:src|href)="([^"\s]+)"/g)) {
        const url = new URL(
          match[1].replaceAll('&amp;', '&'),
          self.location.origin,
        );
        if (
          url.origin === self.location.origin &&
          url.pathname.startsWith('/_next/static/')
        ) {
          assets.add(url.pathname + url.search);
        }
      }
      const cache = await caches.open(CACHE);
      await cache.addAll([...assets]);
      await cache.put('/', response);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await caches.delete(LEGACY_CACHE);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin)
    return;
  const isPage =
    event.request.mode === 'navigate' &&
    ['/', '/index.html'].includes(url.pathname);
  if (isPage && url.pathname === '/index.html') {
    event.respondWith(Response.redirect(new URL('/', url).href, 307));
    return;
  }
  const isAsset =
    url.pathname === '/student.js' || url.pathname.startsWith('/_next/static/');
  if (!isPage && !isAsset) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const key = isPage ? '/' : event.request;
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          await cache.put(key, response.clone());
          return response;
        }
        return (await cache.match(key)) || response;
      } catch {
        return (await cache.match(key)) || Response.error();
      }
    })(),
  );
});
