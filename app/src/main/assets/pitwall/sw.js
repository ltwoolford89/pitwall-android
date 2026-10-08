/* PITWALL V5: Offline app shell. Live API calls remain network-owned; app saves verified data in local storage. */
const STATIC_CACHE='pitwall-static-v5-4-2026-10-08';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./logo.svg','./v2.js','./v3.js','./v3.css','./v4.js','./v4.css','./v4_1.js','./v4_1_profiles.js','./v4_1.css','./v4_2.js','./v4_2.css','./v4_3.js','./v4_3.css','./v4_4.js','./v4_4.css','./v5.js','./v5.css','./v5_1.js','./v5_1.css','./v5_2.js','./v5_2.css','./v5_3.js?v=5.4','./v5_3.css?v=5.4','./v5_4.js?v=5.4','./v5_4.css?v=5.4'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pitwall-')&&k!==STATIC_CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const u=new URL(request.url);
 if(u.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(STATIC_CACHE).then(c=>c.put('./index.html',copy));}return resp;}).catch(async()=>await caches.match('./index.html')||Response.error()));
  return;
 }
 event.respondWith(caches.match(request).then(async cached=>cached||fetch(request).then(response=>{if(response.ok)caches.open(STATIC_CACHE).then(c=>c.put(request,response.clone()));return response;})));
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
