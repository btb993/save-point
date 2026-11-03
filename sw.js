// Save Point: lets the app open offline and remembers game covers.
const SHELL = "savepoint-shell-v71", COVERS = "savepoint-covers-v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192-h2.png", "icon-512-h2.png", "icon-maskable-512-h2.png", "apple-touch-icon-h2.png", "favicon-64-h2.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("savepoint-") && ![SHELL, COVERS].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // the app itself: always try for the newest version, fall back to the saved copy when offline
  if (url.origin === location.origin) {
    e.respondWith(fetch(req, { cache: "no-cache" }).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(SHELL).then(c => c.put(req.mode === "navigate" ? "index.html" : req, copy)); }
      return r;
    }).catch(() => caches.match(req.mode === "navigate" ? "index.html" : req, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
    return;
  }
  // game covers, fonts and the sync library: keep a copy once loaded
  if (/steamstatic\.com|steampowered\.com|upload\.wikimedia\.org|fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(url.host)) {
    e.respondWith(caches.open(COVERS).then(async c => {
      const hit = await c.match(req); if (hit) return hit;
      const r = await fetch(req);
      if (r.ok || r.type === "opaque") c.put(req, r.clone()).catch(() => {});
      return r;
    }).catch(() => fetch(req)));
  }
});
