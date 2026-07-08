/* Mercer County Commission — app-shell service worker */
const CACHE = "mcc-v5";
const SHELL = [
  "./", "./index.html", "./government.html", "./offices.html", "./agencies.html", "./animal-shelter.html",
  "./boards.html", "./meetings.html", "./news.html", "./notices.html", "./contact.html",
  "./about.html", "./emergency.html", "./resources.html", "./search.html", "./404.html",
  "./css/styles.css", "./css/gov.css", "./js/site.js", "./manifest.json",
  "./search-index.json", "./img/mcc/seal-white.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  // Never intercept API, auth, cross-origin, or non-GET requests
  if (req.method !== "GET" || url.origin !== location.origin ||
      url.pathname.startsWith("/api") || url.pathname.startsWith("/.auth")) return;

  // Network-first for navigations/HTML (fresh content), fall back to cache
  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  if (isHTML) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => hit))
  );
});
