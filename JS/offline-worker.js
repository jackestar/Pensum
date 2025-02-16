// Cache resources
const CACHE_NAME = "PWA-cache";
const urlsToCache = [
    "/",
    "/favicon.svg",
    "/pensum.json",
    "/create.html",
    "/create",
    "/styles/stylesP.css",
    "/pensums/list.json",
    "/pensums/electronica.json",
    "/view.html",
    "/view",
    "/index.html",
    "/index",
    "/icons/edit_square.svg",
    "/icons/light_mode.svg",
    "/icons/dark_mode.svg",
    "/icons/open.svg",
    "/icons/delete.svg",
    "/icons/info.svg",
    "/icons/experiment.svg",
    "/icons/arrow_back.svg",
    "/icons/help.svg",
    "/icons/file_open.svg",
    "/icons/book.svg",
    "/icons/article.svg",
    "/icons/draw.svg",
    "/icons/visibility.svg",
    "/icons/gesture_select.svg",
    "/icons/ink_selection.svg",
    "/icons/new_window.svg",
    "/icons/quick_reference.svg",
    "/icons/hide_source.svg",
    "/icons/splitscreen_vertical.svg",
    "/icons/save.svg",
    "/icons/splitscreen_add.svg",
    "/icons/add.svg",
    "/JS/pdf.mjs",
    "/JS/pdf.worker.mjs",
    "/JS/offline-worker.js",
    "/JS/load.js",
    "/JS/pensum.js",
    "/aside.html",
];

// Instalar el Service Worker y cachear los recursos
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Archivos cacheados");
            return cache.addAll(urlsToCache);
        })
    );
});

// Interceptar las solicitudes y responder desde el cache
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Devuelve el recurso del cache si existe, si no, sigue la solicitud normal
            return response || fetch(event.request).then(response => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});

// Actualizar el cache cuando cambien los archivos
self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log("Cache viejo eliminado:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
