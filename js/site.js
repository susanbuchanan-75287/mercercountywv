/* Mercer County Commission — shared site behavior (matches Visit Mercer County design system) */

/* --- Origin guard -------------------------------------------------------
   Deters casual clone-and-rehost: on any host that isn't authorized, the
   page wipes itself and shows an "unauthorized copy" notice.
   NOTE: this is a DETERRENT, not security. */
(function () {
  var ALLOWED = [
    "susanbuchanan-75287.github.io",   // live GitHub Pages host
    "localhost", "127.0.0.1",          // local development
    "mercercountywv.com",              // official custom domain
    "www.mercercountywv.com"
  ];
  var host = location.hostname;
  if (host === "" || ALLOWED.indexOf(host) !== -1) return;

  try {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        regs.forEach(function (r) { r.unregister(); });
      });
      if (window.caches && caches.keys) {
        caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); });
      }
    }
  } catch (e) {}

  var official = "https://mercercountywv.com/";
  document.documentElement.innerHTML =
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Unauthorized copy</title></head>' +
    '<body style="margin:0;min-height:100vh;display:grid;place-items:center;' +
    'background:#071b34;color:#f6f1e7;font-family:system-ui,-apple-system,Segoe UI,sans-serif;text-align:center">' +
    '<div style="max-width:44ch;padding:36px 28px">' +
    '<div style="font-size:2rem;margin-bottom:10px">\u26a0\ufe0f</div>' +
    '<h1 style="font-size:1.35rem;margin:0 0 12px">This is an unauthorized copy</h1>' +
    '<p style="opacity:.85;line-height:1.65;margin:0 0 18px">This deployment of the ' +
    '<b>Mercer County Commission</b> website is not authorized.</p>' +
    '<a href="' + official + '" style="color:#f0b429;font-weight:700;text-decoration:none">Go to the official site &rarr;</a>' +
    '</div></body>';
  throw new Error("Unauthorized host: " + host);
})();

(() => {
  const KEY = "mc-theme";
  const param = new URLSearchParams(location.search).get("scoutTheme");
  const saved = localStorage.getItem(KEY);
  const initial = saved || param ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", initial);

  window.mcToggleTheme = () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".menu-btn");
    const ul = document.querySelector("nav.main ul");
    if (btn && ul) btn.addEventListener("click", () => {
      const open = ul.style.display === "flex";
      ul.style.display = open ? "" : "flex";
      btn.setAttribute("aria-expanded", String(!open));
      ul.style.flexDirection = "column";
      ul.style.position = "absolute";
      ul.style.top = "72px"; ul.style.right = "24px";
      ul.style.background = "var(--mc-cream)";
      ul.style.padding = "16px 22px";
      ul.style.borderRadius = "14px";
      ul.style.border = "1px solid var(--mc-line)";
      ul.style.boxShadow = "var(--mc-shadow)";
    });

    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("nav.main a").forEach(a => {
      const href = a.getAttribute("href");
      if (href === here || (here === "" && href === "index.html")) a.classList.add("active");
    });

    document.querySelectorAll("[data-tabgroup]").forEach(group => {
      const buttons = group.querySelectorAll("[data-tab]");
      buttons.forEach(b => b.addEventListener("click", () => {
        const id = b.getAttribute("data-tab");
        buttons.forEach(x => x.classList.toggle("active", x === b));
        group.querySelectorAll("[data-panel]").forEach(p =>
          p.classList.toggle("active", p.getAttribute("data-panel") === id));
      }));
    });

    const nav = document.querySelector("header.nav");
    if (nav) {
      const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // Directory filter (offices/agencies/boards search box)
    const filter = document.querySelector("[data-dirfilter]");
    if (filter) {
      const cards = Array.from(document.querySelectorAll("[data-dircard]"));
      const empty = document.querySelector("[data-dirempty]");
      filter.addEventListener("input", () => {
        const q = filter.value.trim().toLowerCase();
        let shown = 0;
        cards.forEach(c => {
          const hit = !q || c.textContent.toLowerCase().includes(q);
          c.style.display = hit ? "" : "none";
          if (hit) shown++;
        });
        if (empty) empty.style.display = shown ? "none" : "block";
      });
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetSel = ".head,.card,.att,.citycard,.day,.event,.hero-copy,.hero-art,.cta-band,[data-reveal]";
    const targets = Array.from(document.querySelectorAll(targetSel));
    targets.forEach(el => el.setAttribute("data-reveal", ""));

    if (reduce || !("IntersectionObserver" in window) || !targets.length) {
      targets.forEach(el => el.classList.add("in"));
    } else {
      document.body.classList.add("reveal-ready");
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
      targets.forEach(el => io.observe(el));
      setTimeout(() => targets.forEach(el => el.classList.add("in")), 1500);
    }
  });
})();
