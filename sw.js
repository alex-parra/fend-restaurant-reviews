
const cacheName = 'v1';
const baseFiles = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/js/register-sw.js',
  '/js/dbhelper.js',
  '/js/main.js',
  '/css/styles.css',
];

self.addEventListener('install', e => {
  console.log('SW: Installing...');
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: Init Cache', cacheName);
      return cache.addAll(baseFiles).then(() => {
        console.log('SW: Installed!')
        self.skipWaiting();
      });
    })
  ); // end e.waitUntil
});



self.addEventListener('activate', e => {
  console.log('SW: Activating...');
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(thisCacheName => {
        if (thisCacheName !== cacheName) {
          console.log('SW: Delete Cache', thisCacheName);
          return caches.delete(thisCacheName);
        }
      })).then(() => {
        self.clients.claim();
        console.log('SW: Activated!')
      });
    })
  );
})



self.addEventListener('fetch', e => {

  // Google Maps URLs behaved weirdly.
  // Keep getting "Quota exceeded" when served by CacheOrFetch
  if( /googleapis|gstatic/.test(e.request.url) ) {
    return
  }

  // the restaurant view pages have query params
  // respond to all urls as just restaurant.html since the html does not change based on those query params
  if( /restaurant\.html/.test(e.request.url) ) {
    e.respondWith(fetchAndCache(new Request('/restaurant.html')))
  }

  // All other URLs can be cached
  e.respondWith(fetchAndCache(e.request));

})


function fetchAndCache(request) {
  return caches.open(cacheName).then(cache => {
    return cache.match(request).then(response => {
      const MSG = response ? 'SW: Found in Cache' : 'SW: Fetching and Caching'
      console.log(MSG, request.url);
      return response || fetch(request).then(response => {
        console.log('SW: Fetched. Caching...', request.url)
        cache.put(request, response.clone());
        return response;
      });
    });
  })
}
