// Shared layout: head, topbar, nav, alert bar, footer, scripts
import { county, nav, quicklinks, policies } from "./data.mjs";
import { icon } from "./icons.mjs";

export const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

export function head(page){
  const title = page.title ? `${page.title} · ${county.name}` : county.name;
  const desc = esc(page.desc || county.tagline);
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#0c2a4d">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="img/mcc/seal-map-dark.webp">
<link rel="icon" href="img/mcc/seal-white.png">
<script type="application/ld+json">${JSON.stringify({
  "@context":"https://schema.org","@type":"GovernmentOrganization",
  name:county.name, url:"https://mercercountywv.com/",
  logo:"https://mercercountywv.com/img/mcc/seal-white.png",
  telephone:county.phone, slogan:county.tagline,
  address:{"@type":"PostalAddress",streetAddress:"1501 West Main Street",addressLocality:"Princeton",addressRegion:"WV",postalCode:"24740",addressCountry:"US"},
  areaServed:{"@type":"AdministrativeArea",name:"Mercer County, West Virginia"}
})}</script>
<link rel="apple-touch-icon" href="icons/icon-192.png">
<link rel="manifest" href="manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="css/gov.css">
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>`;
}

export function govBanner(){
  return `<div class="govbanner">
  <div class="wrap gb-in">
    <span class="gb-flag" aria-hidden="true">🏛️</span>
    <span>An official website of <strong>Mercer County, West Virginia</strong></span>
    <button class="gb-how" id="gbHow" aria-expanded="false">Here's how you know ▾</button>
  </div>
  <div class="gb-detail" id="gbDetail" hidden>
    <div class="wrap gb-detail-in">
      <p><strong>🔒 Official.</strong> This is the official government website of the ${esc(county.name)}.</p>
      <p><strong>🛡️ Secure.</strong> A secure connection (https://) means your data is encrypted in transit.</p>
    </div>
  </div>
</div>`;
}

export function topbar(){
  return `<div class="topbar">
  <div class="wrap topbar-in">
    <span class="tb-item">${icon("home","tb-ic")} ${esc(county.address)}</span>
    <span class="tb-sep">·</span>
    <a class="tb-item" href="tel:${county.phoneRaw}">${icon("headset","tb-ic")} ${esc(county.phone)}</a>
    <span class="tb-sep">·</span>
    <span class="tb-item">${icon("calendar","tb-ic")} ${esc(county.hours)}</span>
    <span class="tb-spacer"></span>
    <a class="tb-item" href="portal.html">${icon("lock","tb-ic")} Board Portal</a>
    <button class="tb-item theme-toggle" id="themeToggle" aria-label="Toggle dark mode" title="Toggle dark mode">🌙</button>
  </div>
</div>`;
}

export function header(active){
  const links = nav.map(n =>
    `<a href="${n.href}"${n.href===active?' aria-current="page"':''}>${esc(n.label)}</a>`
  ).join("");
  return `<header class="nav" id="nav">
  <div class="wrap nav-in">
    <a class="brand" href="index.html" aria-label="${esc(county.name)} home">
      <img class="seal-img" src="img/mcc/seal-white.png" alt="Mercer County seal" width="46" height="46">
      <span class="brand-txt"><strong>Mercer County</strong><small>West Virginia · Est. ${county.founded}</small></span>
    </a>
    <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="menu" aria-label="Open menu">☰</button>
    <nav class="menu" id="menu" aria-label="Primary">${links}
      <form class="navsearch" role="search" action="search.html">
        <input type="search" name="q" placeholder="Search…" aria-label="Search the site">
        <button type="submit" aria-label="Search">${icon("search")}</button>
      </form>
    </nav>
  </div>
</header>`;
}

export function alertbar(){
  return `<div class="alertbar" id="alertbar" hidden>
  <div class="wrap alert-in">
    <span class="alert-dot" aria-hidden="true"></span>
    <strong>Notice:</strong>
    <span id="alertText"></span>
    <a id="alertLink" href="notices.html" class="alert-more">Details →</a>
    <button class="alert-x" id="alertClose" aria-label="Dismiss">✕</button>
  </div>
</div>`;
}

export function footer(){
  const pol = policies.map(p=>`<a href="policies/${p.id}.html">${esc(p.title)}</a>`).join("");
  return `<footer class="foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <img class="seal-img" src="img/mcc/seal-white.png" alt="" width="54" height="54">
      <div>
        <strong>${esc(county.name)}</strong>
        <p>${esc(county.tagline)}</p>
        <p class="foot-addr">${esc(county.address)}<br>${esc(county.phone)} · ${esc(county.hours)}</p>
      </div>
    </div>
    <div class="foot-col">
      <h4>Government</h4>
      <a href="government.html">The Commission</a>
      <a href="offices.html">Elected Offices</a>
      <a href="agencies.html">Departments & Agencies</a>
      <a href="boards.html">Boards & Authorities</a>
      <a href="meetings.html">Meetings & Minutes</a>
      <a href="ordinances.html">Ordinances</a>
    </div>
    <div class="foot-col">
      <h4>Services</h4>
      <a href="notices.html">Public Notices</a>
      <a href="bids.html">Bids & Proposals</a>
      <a href="careers.html">Careers</a>
      <a href="documents.html">Documents & Budgets</a>
      <a href="parks.html">Parks & Recreation</a>
      <a href="animal-shelter.html">Animal Shelter & Adoption</a>
      <a href="contact.html#foia">Records / FOIA</a>
    </div>
    <div class="foot-col">
      <h4>Explore</h4>
      <a href="${county.visitUrl}" target="_blank" rel="noopener">Visit Mercer County ↗</a>
      <a href="${county.cvbUrl}" target="_blank" rel="noopener">Convention & Visitors Bureau ↗</a>
      <a href="about.html">About the County</a>
      <a href="portal.html">Board Portal</a>
    </div>
  </div>
  <div class="wrap foot-bottom">
    <p>© ${new Date().getFullYear()} ${esc(county.name)}. All rights reserved.</p>
    <nav class="foot-policies" aria-label="Legal"><a href="site-map.html">Site Map</a>${pol}</nav>
  </div>
</footer>
<button class="totop" id="toTop" aria-label="Back to top" title="Back to top">↑</button>`;
}

export function scripts(){
  return `<script src="js/site.js" defer></script>
</body>
</html>`;
}

// Assemble a full page. depth>0 for pages in subfolders (policies/*) → prefix "../"
export function page(p){
  let html = head(p) + govBanner() + topbar() + header(p.active||"") + alertbar() +
    `<main id="main">` + p.body + `</main>` + footer() + scripts();
  if(p.depth){
    const pre = "../".repeat(p.depth);
    // rewrite root-relative asset/link refs for subfolder pages
    html = html
      .replace(/(href|src)="(css\/|js\/|img\/|icons\/|manifest\.json)/g, `$1="${pre}$2`)
      .replace(/(href|action)="([a-z0-9][a-z0-9-]*)\.html/g, `$1="${pre}$2.html`)
      .replace(/(href|action)="policies\//g, `$1="`);
  }
  return html;
}
