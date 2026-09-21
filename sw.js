const C="arabic-names-v16";
const A=["/","/index.html","/style.css","/app.js","/audio/Generated%20Audio%20September%2021%2C%202026%20-%201_41PM.wav","/audio/Generated%20Audio%20September%2021%2C%202026%20-%202_54PM.wav","/names.json","/manifest.webmanifest","/icons/icon-192.png","/icons/icon-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("arabic-names-")&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET"||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith((async()=>{
  const cache=await caches.open(C);
  try{
   const response=await fetch(e.request);
   if(response.ok&&response.type==="basic")await cache.put(e.request,response.clone());
   return response;
  }catch(err){
   const saved=await cache.match(e.request);
   if(saved)return saved;
   throw err;
  }
 })());
});