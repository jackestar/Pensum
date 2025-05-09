// Cache resources
const CACHE_NAME = "PWA-cache-v2"; // Updated cache name to avoid conflicts
const urlsToCache = [
    "/",
    "/favicon.svg",
    "/pensum.json",
    "/create.html",
    "/styles/stylesP.css",
    "/pensums/list.json",
    "/pensums/electronica.json",
    "/view.html",
    "/index.html",
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
    "/icons/article_256.svg",
    "/icons/draw.svg",
    "/icons/visibility.svg",
    "/icons/gesture_select.svg",
    "/icons/ink_selection.svg",
    "/icons/new_window.svg",
    "/icons/new_window_256.svg",
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

// Install event: cache resources first
self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(err => console.error(`Cache addAll failed: ${err}`))
    );
});

// Fetch event: try network, fallback to cache (or index) if offline
self.addEventListener("fetch", event => {
    event.respondWith(
        caches
            .match(event.request)
            .then(response => {
                return (
                    response ||
                    fetch(event.request).then(res => {
                        // Cache the response if valid and same-origin
                        if (res.ok && event.request.url.startsWith(self.location.origin)) {
                            const clone = res.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                        }
                        return res;
                    })
                );
            })
            .catch(() => {
                // Fallback to index.html for navigation requests
                if (event.request.mode === "navigate") {
                    return caches.match("/index.html");
                }
            })
    );
});

// Activate event: delete old caches
self.addEventListener("activate", event => {
    console.log("activate", event);
    clients.claim();
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log("Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
