const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

//images not added due to cache limit
const FILES_TO_CACHE = [
    "./index.html",
    "./public/css/style.css",
    "./js/index.js"
];

//serive-wrokers run before window object, hence self keyword
self.addEventListener('install', function (e) {
    // e.waitUntil tells the browser to wait until the work is complete before terminating the service worker. This ensures that the service worker doesn't move on from the installing phase until it's finished executing all of its code.
    e.waitUntil(
        //We use caches.open to find the specific cache by name, then add every file in the FILES_TO_CACHE array to the cache.
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

// application knowing how to retrieve information from the cache
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        // determine if the resource already exists in caches
        // If it does, we'll log the URL to the console with a message and then return the cached resource
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ' + e.request.url)
                return request
            }
            //  if the resource is not in caches, we allow the resource to be retrieved from the online network as usual
            else {
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }

            // You can omit if/else for console.log & put one line below like this too.
            // return request || fetch(e.request)
        })
    )
})
