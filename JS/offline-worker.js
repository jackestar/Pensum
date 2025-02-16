// Cache resources
const CACHE_NAME = 'PWA-cache';
const urlsToCache = [
    "/",
    "favicon.svg",
    "pensum.json",
    "create.html",
    "styles/stylesP.css",
    "pensums/list.json",
    "pensums/electronica.json",
    "view.html",
    "index.html",
    "icons/edit_square.svg",
    "icons/light_mode.svg",
    "icons/dark_mode.svg",
    "icons/open.svg",
    "icons/delete.svg",
    "icons/info.svg",
    "icons/experiment.svg",
    "icons/arrow_back.svg",
    "icons/help.svg",
    "icons/file_open.svg",
    "icons/book.svg",
    "icons/article.svg",
    "icons/draw.svg",
    "icons/visibility.svg",
    "icons/gesture_select.svg",
    "icons/ink_selection.svg",
    "icons/new_window.svg",
    "icons/quick_reference.svg",
    "icons/hide_source.svg",
    "icons/splitscreen_vertical.svg",
    "icons/save.svg",
    "icons/splitscreen_add.svg",
    "icons/add.svg",
    "JS/pdf.mjs",
    "JS/pdf.worker.mjs",
    "JS/offline-worker.js",
    "JS/load.js",
    "JS/pensum.js",
    "aside.html"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Handle offline requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request);
      })
  );
});