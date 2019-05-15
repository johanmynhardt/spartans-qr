self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request)
      .catch(function(error) {
        console.log("[Service Worker] Network request Failed. Serving content from cache: " + error);
      //Check to see if you have it in the cache
      //Return response
      //If not in the cache, then return error page
        return caches
          .open("https://spartanharriers.github.io/spartans-qr/scan.html")
          .then(function(cache) {
            console.info('testing cache', cache);
            return cache.match(event.request).then(function(matching) {
              return !matching || matching.status === 404
                ? Promise.reject("no-match")
                : matching;
          });
        });
    })
  );
});