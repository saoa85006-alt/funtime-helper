// Офлайн-кэш. Версия меняется при каждой публикации, поэтому обновления доходят до пользователей.
const CACHE = 'ft-e5edac9f4b';
const ASSETS = ["./", "app.js", "apple-touch-icon.png", "craft.js", "custom.js", "farms.js", "fonts/pressstart-cyrillic.woff2", "fonts/pressstart-latin.woff2", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "icon.svg", "img/farms/golem-1.jpg", "img/farms/golem-2.jpg", "img/farms/golem-3.jpg", "img/farms/golem-4.jpg", "img/farms/golem-5.jpg", "img/farms/golem-6.jpg", "img/farms/golem-7.jpg", "img/farms/golem-8.jpg", "img/farms/golem-top.jpg", "img/ing/apple.png", "img/ing/blaze.png", "img/ing/breeze.png", "img/ing/cane.png", "img/ing/dblock.png", "img/ing/diamond.png", "img/ing/emerald.png", "img/ing/eye.png", "img/ing/gblock.png", "img/ing/gingot.png", "img/ing/gunp.png", "img/ing/log.png", "img/ing/magma.png", "img/ing/milk.png", "img/ing/ningot.png", "img/ing/nstar.png", "img/ing/obsidian.png", "img/ing/puffer.png", "img/ing/rod.png", "img/ing/snowball.png", "img/ing/stick.png", "img/ing/sugar.png", "img/ing/xp.png", "img/items/aura.png", "img/items/boots.png", "img/items/chest.png", "img/items/crossbow.png", "img/items/disorient.png", "img/items/dust.png", "img/items/egapple.png", "img/items/elytra.png", "img/items/emerald_axe.png", "img/items/emerald_boots.png", "img/items/emerald_chestplate.png", "img/items/emerald_helmet.png", "img/items/emerald_leggings.png", "img/items/emerald_pickaxe.png", "img/items/emerald_sword.png", "img/items/fireball.png", "img/items/gapple.png", "img/items/helmet.png", "img/items/iron_ingot.png", "img/items/legs.png", "img/items/mace.png", "img/items/pickaxe.png", "img/items/plast.png", "img/items/snowball.png", "img/items/sphere0.png", "img/items/sphere1.png", "img/items/sphere2.png", "img/items/sphere3.png", "img/items/sphere4.png", "img/items/sphere5.png", "img/items/sphere6.png", "img/items/sphere7.png", "img/items/sphere8.png", "img/items/sword.png", "img/items/talisman0.png", "img/items/talisman1.png", "img/items/talisman2.png", "img/items/talisman3.png", "img/items/talisman4.png", "img/items/talisman5.png", "img/items/talisman6.png", "img/items/talisman7.png", "img/items/totem.png", "img/items/trap.png", "img/items/windcharge.png", "img/lava.png", "img/set1.png", "img/set10.png", "img/set11.png", "img/set2.png", "img/set3.png", "img/set4.png", "img/set5.png", "img/set6.png", "img/set7.png", "img/set8.png", "img/set9.png", "income.js", "index.html", "items.js", "manifest.webmanifest", "plans.js", "profit.js", "style.css"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(ASSETS.map(a => fetch(a, { cache: 'reload' }).then(r => r.ok && c.put(a, r)).catch(() => {})))
  ).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
// сначала сеть (свежие файлы), при отсутствии интернета берём из кэша
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && new URL(e.request.url).origin === location.origin) {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
    }
    return r;
  }).catch(() => caches.match(e.request).then(m => m || caches.match('./'))));
});
