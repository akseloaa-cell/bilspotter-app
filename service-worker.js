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

self.addEventListener("push", (event) => {
  let data = {
    title: "Bilspotter",
    body: "Du har en ny utfordring!",
  };

  if (event.data) {
    data = event.data.json();
  }

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "./b98ab4e3-b4bf-417e-a76a-b7bb691b1da5.png",
    badge: "./b98ab4e3-b4bf-417e-a76a-b7bb691b1da5.png"
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow("./")
  );
});
