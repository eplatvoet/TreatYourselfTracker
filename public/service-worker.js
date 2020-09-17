console.log("Hello from your SERVICE-WORKER.JS file! :) ");

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/index.js',
    '/styles.css'
];

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

//install
self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached sucessfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

//fetch
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        //If the response was good, clone it and store it in the cache
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        //Network request failed, try to get it from the cache
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }
    //if the request is not for the API, serve static assests using "offline-first" approach
    evt.respondWith(
        caches.match(evt.request).then(function(response) {
            return response || fetch(evt.request);
        })
    );
});