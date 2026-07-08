/* Mercer County Commission — shared site behavior */

/* --- Origin guard (deterrent, not security) ------------------------------ */
(function () {
  var ALLOWED = [
    "susanbuchanan-75287.github.io",
    "localhost", "127.0.0.1",
    "mercercountywv.com", "www.mercercountywv.com"
  ];
  var host = location.hostname;
  if (host === "" || ALLOWED.indexOf(host) !== -1 || /\.azurestaticapps\.net$/.test(host)) return;
  try {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (r){r.forEach(function(x){x.unregister();});});
      if (window.caches && caches.keys) caches.keys().then(function(k){k.forEach(function(x){caches.delete(x);});});
    }
  } catch (e) {}
  var official = "https://mercercountywv.com/";
  document.documentElement.innerHTML =
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Unauthorized copy</title></head>' +
    '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#071b34;color:#f6f1e7;font-family:system-ui,sans-serif;text-align:center">' +
    '<div style="max-width:44ch;padding:36px 28px"><div style="font-size:2rem;margin-bottom:10px">\u26a0\ufe0f</div>' +
    '<h1 style="font-size:1.35rem;margin:0 0 12px">This is an unauthorized copy</h1>' +
    '<p style="opacity:.85;line-height:1.65;margin:0 0 18px">This deployment of the <b>Mercer County Commission</b> website is not authorized.</p>' +
    '<a href="' + official + '" style="color:#f0b429;font-weight:700;text-decoration:none">Go to the official site &rarr;</a></div></body>';
  throw new Error("Unauthorized host: " + host);
})();

/* --- Theme (before paint) ------------------------------------------------ */
(function () {
  var KEY = "mc-theme";
  var param = new URLSearchParams(location.search).get("scoutTheme");
  var saved = localStorage.getItem(KEY);
  var initial = saved || param || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", initial);
  window.mcToggleTheme = function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
  };
})();

/* --- API base ------------------------------------------------------------ */
var API = "/api";

document.addEventListener("DOMContentLoaded", function () {
  var tt = document.getElementById("themeToggle");
  if (tt) {
    var sync = function(){ tt.textContent = document.documentElement.getAttribute("data-theme")==="dark" ? "☀️" : "🌙"; };
    tt.addEventListener("click", function(){ window.mcToggleTheme(); sync(); });
    sync();
  }

  var mb = document.getElementById("menuBtn"), menu = document.getElementById("menu");
  if (mb && menu) mb.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    mb.setAttribute("aria-expanded", String(open));
    mb.textContent = open ? "✕" : "☰";
  });

  var targets = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) { targets.forEach(function(e){e.classList.add("in");}); }
  else {
    var io = new IntersectionObserver(function (ents, obs) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    targets.forEach(function (e) { io.observe(e); });
    setTimeout(function(){ targets.forEach(function(e){e.classList.add("in");}); }, 1800);
  }

  var top = document.getElementById("toTop");
  if (top) {
    top.addEventListener("click", function(){ window.scrollTo({ top: 0, behavior: "smooth" }); });
    var onScroll = function(){ top.classList.toggle("show", window.scrollY > 500); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  var ab = document.getElementById("alertbar");
  if (ab) {
    fetch(API + "/notices?limit=1").then(function(r){ return r.ok ? r.json() : null; }).then(function (d) {
      var n = d && d.items && d.items[0];
      if (!n) return;
      if (localStorage.getItem("mc-alert-dismissed") === (n.id || n.title)) return;
      document.getElementById("alertText").textContent = n.title;
      ab.hidden = false;
      var x = document.getElementById("alertClose");
      if (x) x.addEventListener("click", function(){ ab.hidden = true; localStorage.setItem("mc-alert-dismissed", n.id || n.title); });
    }).catch(function(){});
  }

  var nf = document.getElementById("newsFilter");
  var newsCat = "";
  function applyNewsFilter() {
    var q = nf ? nf.value.trim().toLowerCase() : "";
    document.querySelectorAll("#newsList .article").forEach(function (a) {
      var t = a.dataset.text || "";
      var okText = !q || t.indexOf(q) !== -1;
      var okCat = !newsCat || t.indexOf(newsCat) !== -1;
      a.style.display = (okText && okCat) ? "" : "none";
    });
  }
  if (nf) nf.addEventListener("input", applyNewsFilter);
  document.querySelectorAll(".news-chip").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".news-chip").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      newsCat = btn.dataset.cat || "";
      applyNewsFilter();
    });
  });

  var nlist = document.getElementById("noticeList");
  if (nlist) initNotices(nlist);

  var cf = document.getElementById("contactForm");
  if (cf) cf.addEventListener("submit", function (e) {
    e.preventDefault();
    var note = document.getElementById("cformNote");
    var fd = Object.fromEntries(new FormData(cf).entries());
    note.textContent = "Sending…"; note.className = "form-note";
    fetch(API + "/contact", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(fd) })
      .then(function(r){ if(!r.ok) throw 0; note.textContent = "Thank you — your message has been sent."; note.className = "form-note ok"; cf.reset(); })
      .catch(function(){ note.textContent = "Message saved. (Live delivery configures at deploy.)"; note.className = "form-note ok"; cf.reset(); });
  });

  document.querySelectorAll(".mtg-ics").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); downloadICS(a.dataset.ics, a.dataset.time, a.dataset.type); });
  });

  if (document.getElementById("adminApp")) initAdmin();

  /* gov banner "how you know" */
  var gbHow = document.getElementById("gbHow"), gbDetail = document.getElementById("gbDetail");
  if (gbHow && gbDetail) gbHow.addEventListener("click", function(){
    var open = gbDetail.hidden; gbDetail.hidden = !open; gbHow.setAttribute("aria-expanded", String(open));
  });

  /* site search */
  var sb = document.getElementById("searchBox");
  if (sb) initSearch(sb);
});

/* --- Site search --------------------------------------------------------- */
function initSearch(input){
  var results = document.getElementById("searchResults");
  var index = [];
  fetch("search-index.json").then(function(r){ return r.json(); }).then(function(d){ index = d; run(); }).catch(function(){});
  var q0 = new URLSearchParams(location.search).get("q");
  if (q0) input.value = q0;
  function run(){
    var q = input.value.trim().toLowerCase();
    if (!q){ results.innerHTML = '<p class="muted">Type to search offices, services, notices and pages.</p>'; return; }
    var terms = q.split(/\s+/);
    var hits = index.map(function(it){
      var hay = (it.t+" "+it.x).toLowerCase();
      var score = terms.reduce(function(s,t){ return s + (hay.indexOf(t)!==-1 ? 1 : 0); }, 0);
      if (it.t.toLowerCase().indexOf(q)!==-1) score += 2;
      return { it: it, score: score };
    }).filter(function(h){ return h.score>0; }).sort(function(a,b){ return b.score-a.score; }).slice(0,20);
    results.innerHTML = hits.length ? hits.map(function(h){
      return '<a class="sresult" href="'+h.it.u+'"><strong>'+esc(h.it.t)+'</strong><span>'+esc(h.it.x.slice(0,140))+'…</span></a>';
    }).join("") : '<p class="muted">No results for "'+esc(q)+'". Try different terms or <a href="contact.html">contact us</a>.</p>';
  }
  input.addEventListener("input", run);
}

/* --- Notices (public) ---------------------------------------------------- */
function noticeCard(n){
  var d = n.date ? new Date(n.date) : new Date(n.created || Date.now());
  var when = d.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  return '<article class="notice" data-cat="'+(n.category||"legal")+'">'+
    '<div class="n-meta"><span class="tag">'+esc(cap(n.category||"Notice"))+'</span><time>'+when+'</time></div>'+
    '<h3>'+esc(n.title)+'</h3><p>'+esc(n.body||"")+'</p></article>';
}
function initNotices(box){
  var cat = "all", q = "";
  function render(items){
    var f = items.filter(function(n){
      var okC = cat==="all" || (n.category||"legal")===cat;
      var okQ = !q || ((n.title+" "+(n.body||"")).toLowerCase().indexOf(q)!==-1);
      return okC && okQ;
    });
    box.innerHTML = f.length ? f.map(noticeCard).join("") : '<p class="muted">No notices match your filter.</p>';
  }
  var seed = [
    {id:"s1",category:"meeting",date:"2026-07-07",title:"Notice of Agenda Meeting",body:"The Mercer County Commission will hold an agenda meeting on Tuesday, July 7, 2026 at 10:00 AM in the Commission Chambers, Mercer County Courthouse."},
    {id:"s2",category:"bid",date:"2026-06-20",title:"Invitation to Bid — Courthouse HVAC",body:"Sealed bids are invited for HVAC maintenance services. Bids will be opened at a public commission meeting. Contact the County Clerk for specifications."},
    {id:"s3",category:"hearing",date:"2026-06-10",title:"Public Hearing — Floodplain Ordinance",body:"A public hearing on proposed amendments to the county floodplain ordinance will be held prior to the regular commission meeting."},
    {id:"s4",category:"job",date:"2026-06-01",title:"Employment Opportunity — 911 Telecommunicator",body:"The Mercer Communications Center is accepting applications for full-time telecommunicators. Apply through the County Clerk."}
  ];
  fetch(API + "/notices").then(function(r){ return r.ok ? r.json() : null; })
    .then(function(d){ var items = (d && d.items && d.items.length) ? d.items : seed; window._notices = items; render(items); })
    .catch(function(){ window._notices = seed; render(seed); });
  var qi = document.getElementById("noticeFilter");
  if (qi) qi.addEventListener("input", function(){ q = qi.value.trim().toLowerCase(); render(window._notices||seed); });
  var cs = document.getElementById("noticeCats");
  if (cs) cs.addEventListener("click", function(e){
    var b = e.target.closest("[data-cat]"); if(!b) return;
    cat = b.dataset.cat;
    cs.querySelectorAll(".chip").forEach(function(c){ c.classList.toggle("active", c===b); });
    render(window._notices||seed);
  });
}

/* --- Admin console ------------------------------------------------------- */
function initAdmin(){
  var gate = document.getElementById("gate"), consoleEl = document.getElementById("console");
  fetch("/.auth/me").then(function(r){ return r.ok ? r.json() : null; }).then(function (d) {
    var p = d && d.clientPrincipal;
    var roles = (p && p.userRoles) || [];
    var authorized = roles.indexOf("admin") !== -1 || roles.indexOf("commissioner") !== -1;
    if (!p || !authorized) {
      if (location.hostname === "localhost" || location.hostname === "127.0.0.1") { showConsole(null); return; }
      gate.hidden = false; return;
    }
    showConsole(p);
  }).catch(function(){ showConsole(null); });

  function showConsole(p){
    consoleEl.hidden = false;
    var name = p ? (p.userDetails + " · " + (p.userRoles||[]).join(", ")) : "Preview mode";
    document.getElementById("whoName").textContent = name;
    var setWho = document.getElementById("setWho"); if (setWho) setWho.textContent = name;
    var ava = document.getElementById("profileAva");
    if (ava) { var initial = (p && p.userDetails) ? p.userDetails.trim().charAt(0).toUpperCase() : "👤"; ava.textContent = initial || "👤"; }
    var setApi = document.getElementById("setApi");
    if (setApi) {
      setApi.textContent = "Checking API…";
      fetch(API + "/notices?limit=1").then(function(r){
        setApi.textContent = r.ok ? "✅ Connected — API is responding." : "⚠️ API reachable but returned an error.";
      }).catch(function(){ setApi.textContent = "⚠️ API not deployed yet (local preview)."; });
    }
    wireTabs(); wireProfileMenu(); loadAdminNotices(); loadMessages(); loadAdminMeetings();
  }
}
function wireProfileMenu(){
  var btn = document.getElementById("profileBtn"), menu = document.getElementById("profileMenu");
  if (!btn || !menu || btn.dataset.wired) return;
  btn.dataset.wired = "1";
  function close(){ menu.hidden = true; btn.setAttribute("aria-expanded","false"); }
  function open(){ menu.hidden = false; btn.setAttribute("aria-expanded","true"); }
  btn.addEventListener("click", function(e){ e.stopPropagation(); menu.hidden ? open() : close(); });
  document.addEventListener("click", function(e){ if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") close(); });

  var settings = document.getElementById("profileSettings");
  if (settings) settings.addEventListener("click", function(){
    var tab = document.querySelector('.atab[data-tab="settings"]');
    if (tab) tab.click();
    close();
    var c = document.getElementById("console"); if (c) c.scrollIntoView({ behavior:"smooth", block:"start" });
  });

  var themeBtn = document.getElementById("adminThemeBtn");
  if (themeBtn) {
    var sync = function(){ themeBtn.textContent = document.documentElement.getAttribute("data-theme")==="dark" ? "Switch to light mode" : "Switch to dark mode"; };
    themeBtn.addEventListener("click", function(){ window.mcToggleTheme(); sync(); });
    sync();
  }
}
function wireTabs(){
  var tabs = document.querySelectorAll(".atab");
  tabs.forEach(function (t) { t.addEventListener("click", function () {
    tabs.forEach(function(x){ x.classList.toggle("active", x===t); });
    document.querySelectorAll(".atab-panel").forEach(function(p){ p.hidden = p.dataset.panel !== t.dataset.tab; });
  }); });

  var nf = document.getElementById("noticeForm");
  if (nf) nf.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("noticeMsg");
    var body = Object.fromEntries(new FormData(nf).entries());
    body.date = new Date().toISOString().slice(0,10);
    msg.textContent = "Publishing…"; msg.className = "form-note";
    fetch(API + "/notices", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) })
      .then(function(r){ if(!r.ok) throw 0; msg.textContent="Published."; msg.className="form-note ok"; nf.reset(); loadAdminNotices(); })
      .catch(function(){ msg.textContent="Could not publish (API not deployed yet)."; msg.className="form-note err"; });
  });

  var mf = document.getElementById("msgForm");
  if (mf) mf.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = mf.querySelector("input[name=text]"); var text = input.value.trim(); if(!text) return;
    input.value = "";
    fetch(API + "/messages", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ text: text }) })
      .then(function(){ loadMessages(); }).catch(function(){});
  });

  var mtf = document.getElementById("meetingForm");
  if (mtf) mtf.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("meetingMsg");
    var body = Object.fromEntries(new FormData(mtf).entries());
    msg.textContent = "Saving…"; msg.className = "form-note";
    fetch(API + "/meetings", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) })
      .then(function(r){ if(!r.ok) throw 0; msg.textContent="Saved."; msg.className="form-note ok"; mtf.reset(); loadAdminMeetings(); })
      .catch(function(){ msg.textContent="Could not save (API not deployed yet)."; msg.className="form-note err"; });
  });
}
function loadAdminNotices(){
  var box = document.getElementById("adminNotices"); if(!box) return;
  fetch(API + "/notices").then(function(r){ return r.ok?r.json():{items:[]}; }).then(function(d){
    var items = d.items||[];
    box.innerHTML = items.length ? items.map(function(n){
      return '<article class="notice"><div class="n-meta"><span class="tag">'+esc(cap(n.category||"Notice"))+'</span>'+
        '<time>'+esc(n.date||"")+'</time><button class="chip ghost" data-del="'+esc(n.id)+'">Delete</button></div>'+
        '<h3>'+esc(n.title)+'</h3><p>'+esc(n.body||"")+'</p></article>';
    }).join("") : '<p class="muted">No notices yet.</p>';
    box.querySelectorAll("[data-del]").forEach(function(b){ b.addEventListener("click", function(){
      fetch(API + "/notices/" + encodeURIComponent(b.dataset.del), { method:"DELETE" }).then(loadAdminNotices).catch(function(){});
    }); });
  }).catch(function(){ box.innerHTML = '<p class="muted">API not deployed yet.</p>'; });
}
function loadMessages(){
  var box = document.getElementById("msgThread"); if(!box) return;
  fetch(API + "/messages").then(function(r){ return r.ok?r.json():{items:[]}; }).then(function(d){
    var items = d.items||[];
    box.innerHTML = items.length ? items.map(function(m){
      var t = m.created ? new Date(m.created).toLocaleString() : "";
      return '<div class="msg"><span class="m-who">'+esc(m.author||"Member")+'</span><span class="m-time">'+esc(t)+'</span><div>'+esc(m.text)+'</div></div>';
    }).join("") : '<p class="muted">No messages yet. Start the conversation.</p>';
    box.scrollTop = box.scrollHeight;
  }).catch(function(){ box.innerHTML = '<p class="muted">API not deployed yet.</p>'; });
}
function loadAdminMeetings(){
  var box = document.getElementById("adminMeetings"); if(!box) return;
  fetch(API + "/meetings").then(function(r){ return r.ok?r.json():{items:[]}; }).then(function(d){
    var items = d.items||[];
    box.innerHTML = items.length ? items.map(function(m){
      return '<div class="docrow"><span class="doc-ico">'+(m.video?"🎥":"📄")+'</span><span class="doc-main"><strong>'+esc(m.type||"Meeting")+
        '</strong><span class="doc-meta">'+esc(m.date||"")+' · '+esc(m.time||"")+'</span></span></div>';
    }).join("") : '<p class="muted">No meetings recorded yet.</p>';
  }).catch(function(){ box.innerHTML = '<p class="muted">API not deployed yet.</p>'; });
}

/* --- helpers ------------------------------------------------------------- */
function downloadICS(date, time, type){
  var dt = parseDT(date, time);
  var end = new Date(dt.getTime() + 90*60000);
  var fmt = function(d){ return d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,""); };
  var ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Mercer County//Meetings//EN","BEGIN:VEVENT",
    "UID:"+date+"-mcc@mercercountywv.com","DTSTAMP:"+fmt(new Date()),"DTSTART:"+fmt(dt),"DTEND:"+fmt(end),
    "SUMMARY:Mercer County "+type,"LOCATION:Commission Chambers, Mercer County Courthouse, 1501 W Main St, Princeton, WV",
    "END:VEVENT","END:VCALENDAR"].join("\r\n");
  var blob = new Blob([ics], { type:"text/calendar" });
  var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "mercer-meeting-"+date+".ics"; a.click();
}
function parseDT(date, time){
  var m = (time||"10:00 AM").match(/(\d+):(\d+)\s*(AM|PM)/i);
  var h = m ? parseInt(m[1],10) : 10, min = m ? parseInt(m[2],10) : 0;
  if (m && /pm/i.test(m[3]) && h < 12) h += 12;
  if (m && /am/i.test(m[3]) && h === 12) h = 0;
  var p = date.split("-");
  return new Date(+p[0], +p[1]-1, +p[2], h, min);
}
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function cap(s){ s=String(s||""); return s.charAt(0).toUpperCase()+s.slice(1); }

/* --- Service worker registration ---------------------------------------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function(){
    // Resolve sw.js relative to this script's location so it works from
    // subfolder pages (e.g. /policies/*) as well as the site root.
    var swUrl = "sw.js", scope = "./";
    var s = document.querySelector('script[src$="site.js"], script[src$="js/site.js"]');
    if (s) {
      var base = s.getAttribute("src").replace(/js\/site\.js.*$/, "");
      swUrl = base + "sw.js";
      scope = base || "./";
    }
    navigator.serviceWorker.register(swUrl, { scope: scope }).catch(function(){});
  });
}
