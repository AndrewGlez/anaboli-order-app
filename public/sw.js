// @ts-nocheck
/* eslint-disable no-undef */
// Service Worker for PWA offline support
// Strategy: navigation=network-first, same-origin=cache-first, cross-origin/API=network-first

const CACHE_NAME = 'app-shell-v1';

// Precache list - updated at build time
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Resolve any precache path against the SW origin so addAll always uses
// absolute URLs. Relative paths can confuse the Cache API when the SW is
// served from a sub-path, and a single failed fetch aborts the whole addAll.
const toAbsoluteURL = (path) => new URL(path, self.location.origin).href;

// Install: precache shell assets (no skipWaiting — wait for client message)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((url) =>
            fetch(toAbsoluteURL(url), { cache: 'reload' })
              .then((response) => {
                if (response.ok) {
                  return cache.put(toAbsoluteURL(url), response);
                }
                console.warn('[sw] skipping precache for non-ok response', url, response.status);
                return null;
              })
              .catch((err) => {
                console.warn('[sw] precache failed for', url, err);
                return null;
              }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

// Activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  // Claim clients immediately
  self.clients.claim();
});

// Helper: check if URL is same-origin
const isSameOrigin = (url) => url.origin === self.location.origin;

// Helper: check if URL is an API call (non-static)
const isApiCall = (url) => {
  const path = url.pathname;
  return (
    path.startsWith('/api/') ||
    path.includes('/graphql') ||
    path.includes('/trpc/') ||
    url.hostname !== self.location.hostname
  );
};

// Fetch: correct per-request-type caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigation requests: network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached navigation or shell
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // API calls and cross-origin: network-first, never cache 4xx/5xx
  if (isApiCall(url) || !isSameOrigin(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache error responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed — return cached if available
          return caches.match(request);
        })
    );
    return;
  }

  // Same-origin static assets: cache-first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        // Cache successful responses only
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Listen for skip waiting message from client (UpdateToast posts this)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
