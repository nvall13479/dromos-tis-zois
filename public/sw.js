// Service worker για offline ανάγνωση επισκεφθέντων σελίδων.
// Στρατηγική: network-first για πλοήγηση, cache-first για στατικά assets.

const CACHE_NAME = 'dromos-tis-zois-v1';
const OFFLINE_URL = '/offline';
const PRECACHE_URLS = ['/', OFFLINE_URL, '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

async function cacheResponse(request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return response;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:css|js|mjs|png|jpe?g|svg|webp|avif|woff2?|otf|ttf)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => cacheResponse(request, response))
      )
    );
    return;
  }

  if (url.searchParams.has('_rsc')) {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(
          async () =>
            (await caches.match(request)) ||
            new Response('', { status: 503, statusText: 'Offline' })
        )
    );
  }
});
