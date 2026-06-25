var CACHE="proseg-v1";
var SHELL=["./","./index.html","./manifest.webmanifest"];

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){if(k!==CACHE)return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET")return;
  var url=new URL(e.request.url);
  // Dados das rodovias: sempre rede; o app guarda offline via IndexedDB.
  if(url.pathname.indexOf("rodovias")>=0 && url.pathname.indexOf(".json")>=0) return;
  // Shell: cache primeiro, com atualização e fallback.
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(resp){
        if(resp && resp.status===200 && url.origin===location.origin){
          var cp=resp.clone(); caches.open(CACHE).then(function(c){c.put(e.request,cp);});
        }
        return resp;
      }).catch(function(){ return caches.match("./index.html"); });
    })
  );
});
