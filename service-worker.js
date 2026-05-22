const CACHE_NAME = "bilspotter-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting(); // 🔥 tvinger ny SW til å bli aktiv med en gang

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // 🧹 sletter gammel cache
          }
        })
      )
    )
  );

  self.clients.claim(); // tar over alle åpne sider
});

// FETCH
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
