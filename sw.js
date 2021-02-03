self.addEventListener("install",e=>{
    console.log("sw.js installed")
    e.waitUntil(
        caches.open("static").then(cache=>{
            return cache.addAll([]); //images
        });
    );
})

self.addEventListener("fetch",e=>{
    e.respondWith(
        caches.match(e.request).then(res=>{
            return res || fetch(e.request)
        });
    )
});