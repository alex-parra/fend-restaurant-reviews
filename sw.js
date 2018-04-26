
const cacheName = 'v0.99.1';
const baseFiles = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/js/dbhelper.js',
  '/js/main.js',
  '/css/styles.css',
]

self.addEventListener('install', function(e) {
  console.log('SW: Installing...');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('SW: Init Cache', cacheName);
      return cache.addAll(baseFiles).then(() => {
        console.log('SW: Installed!')
        self.skipWaiting();
      })
    })
  ); // end e.waitUntil
})



self.addEventListener('activate', function(e) {
  console.log('SW: Activating...');
  clients.claim();
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(thisCacheName) {
        if (thisCacheName !== cacheName) {
          console.log('SW: Delete Cache', thisCacheName);
          return caches.delete(thisCacheName);
        }
      })).then(() => console.log('SW: Activated!'));
    })
  );
})



self.addEventListener('fetch', function(e) {
  if( /googleapis|gstatic/.test(e.request.url) ) {
    return
  }

  e.respondWith(
    caches.open(cacheName).then(function(cache) {
      return cache.match(e.request).then(function (response) {
        const MSG = response ? 'SW: Found in Cache' : 'SW: Fetching and Caching'
        console.log(MSG, e.request.url)
        return response || fetch(e.request).then(function(response) {
          console.log('SW: Fetched. Caching...', e.request.url)
          cache.put(e.request, response.clone());
          return response;
        })
      });
    })
  );

})
