import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { page, esc } from "./layout.mjs";
import { icon } from "./icons.mjs";
import * as D from "./data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..");

/* ---------- harvested detail content (mirror of official county site) ---------- */
const contentPath = join(__dirname, "gov-content.json");
const content = existsSync(contentPath) ? JSON.parse(readFileSync(contentPath, "utf8")) : [];
const bySection = { offices:[], agencies:[], boards:[], ordinances:[], documents:[], bids:[], careers:[], parks:[] };
for (const e of content) { if (bySection[e.section]) bySection[e.section].push(e); }
// entities that get their own detail page (non-empty slug, not a section index)
const detailEntities = content.filter(e =>
  ["offices","agencies","boards","ordinances"].includes(e.section) && e.slug && e.slug !== e.section);
const detailFile = (section, slug) => `${section}-${slug}.html`;
const hasDetail = new Set(detailEntities.map(e => detailFile(e.section, e.slug)));
// reconcile directory ids (data.mjs) with harvested slugs (official site)
const OFFICE_ALIAS = { "circuit-court":"circuit-court-judges", "family-court":"family-court-judges", magistrate:"magistrate-judges" };
const AGENCY_ALIAS = { hatfield:"hatfield-mccoy-trails" };
const officeHref = id => { const s = OFFICE_ALIAS[id] || id; const f = detailFile("offices", s); return hasDetail.has(f) ? f : undefined; };
const agencyHref = id => {
  if (id === "parks") return "parks.html";
  const s = AGENCY_ALIAS[id] || id; const f = detailFile("agencies", s); return hasDetail.has(f) ? f : undefined;
};
const SECTION_META = {
  offices:{ label:"Elected Offices", index:"offices.html", eyebrow:"Government" },
  agencies:{ label:"Departments & Agencies", index:"agencies.html", eyebrow:"Government" },
  boards:{ label:"Boards & Authorities", index:"boards.html", eyebrow:"Government" },
  ordinances:{ label:"Ordinances", index:"ordinances.html", eyebrow:"County code" }
};

/* semantic icon mapping (replaces emoji) */
const IC = {
  // offices
  assessor:"home", "county-clerk":"document", "circuit-clerk":"scale", sheriff:"shield",
  "prosecuting-attorney":"columns", "circuit-court":"gavel", "family-court":"users", magistrate:"clipboard",
  // agencies
  "911":"headset", emergency:"siren", "animal-shelter":"paw", health:"health", airport:"plane",
  recycling:"recycle", "day-report":"folder", corrections:"lock", "adult-probation":"compass",
  "juvenile-probation":"book", floodplain:"water", litter:"trash", parks:"tree", cvb:"suitcase",
  development:"chart", fair:"ticket", education:"cap", hatfield:"route"
};
const iconById = id => icon(IC[id] || "document");
const iconByName = name => {
  const n = name.toLowerCase();
  if(/service district|water|sewer/.test(n)) return icon("droplet");
  if(/airport/.test(n)) return icon("plane");
  if(/solid waste|recycl/.test(n)) return icon("recycle");
  if(/planning/.test(n)) return icon("compass");
  if(/health/.test(n)) return icon("health");
  if(/911|emergency comm/.test(n)) return icon("headset");
  if(/fire/.test(n)) return icon("fire");
  if(/building/.test(n)) return icon("building");
  if(/civil service/.test(n)) return icon("columns");
  if(/development/.test(n)) return icon("chart");
  if(/cvb|visitor/.test(n)) return icon("suitcase");
  if(/dilapidated|structure/.test(n)) return icon("building");
  if(/park|glenwood/.test(n)) return icon("tree");
  if(/defender/.test(n)) return icon("shield");
  if(/region|planning & development/.test(n)) return icon("globe");
  if(/highway|coal/.test(n)) return icon("road");
  if(/corrections|community/.test(n)) return icon("handshake");
  if(/workforce/.test(n)) return icon("hardhat");
  if(/fireworks/.test(n)) return icon("sparkle");
  if(/floodplain|flood/.test(n)) return icon("water");
  if(/litter/.test(n)) return icon("trash");
  if(/noise/.test(n)) return icon("sound");
  if(/exotic|entertainment/.test(n)) return icon("mask");
  if(/mental/.test(n)) return icon("brain");
  return icon("document");
};
const QIC = { "Pay Property Taxes":"dollar","Property Assessment":"home","Watch Meetings":"video",
  "Public Notices":"megaphone","Jobs & Bids":"briefcase","Voter Registration":"vote",
  "Recycling":"recycle","Records / FOIA":"filesearch" };

const fmtDate = iso => new Date(iso+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"});
const fmtShort = iso => new Date(iso+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

/* ---------- reusable blocks ---------- */
const hero = ({img,eyebrow,title,sub,ctas=[]}) => `
<section class="gov-hero" style="--gov-hero-img:url('../img/mcc/${img}')">
  <div class="gov-hero-scrim"></div>
  <div class="wrap gov-hero-in reveal">
    ${eyebrow?`<span class="eyebrow">${esc(eyebrow)}</span>`:""}
    <h1>${title}</h1>
    ${sub?`<p class="lead">${sub}</p>`:""}
    ${ctas.length?`<div class="hero-ctas">${ctas.map(c=>`<a class="btn ${c.kind||'btn-gold'}" href="${c.href}">${esc(c.label)}</a>`).join("")}</div>`:""}
  </div>
</section>`;

const crumb = items => `<nav class="crumb" aria-label="Breadcrumb"><div class="wrap">${
  items.map((it,i)=> (i<items.length-1 && it.href)
    ? `<a href="${it.href}">${esc(it.label)}</a><span aria-hidden="true">›</span>`
    : (i<items.length-1
        ? `<span>${esc(it.label)}</span><span aria-hidden="true">›</span>`
        : `<span aria-current="page">${esc(it.label)}</span>`)).join("")
}</div></nav>`;

const pageHead = ({eyebrow,title,sub}) => `
<section class="pagehead"><div class="wrap reveal">
  ${eyebrow?`<span class="eyebrow">${esc(eyebrow)}</span>`:""}
  <h1>${esc(title)}</h1>
  ${sub?`<p class="lead">${sub}</p>`:""}
</div></section>`;

const quickbar = () => `
<section class="quickbar-wrap"><div class="wrap">
  <h2 class="sr-title">Popular services</h2>
  <div class="quickbar">
    ${D.quicklinks.map(q=>`<a class="qtile reveal" href="${q.href}"><span class="qicon" aria-hidden="true">${icon(QIC[q.label]||"document")}</span><span>${esc(q.label)}</span></a>`).join("")}
  </div>
</div></section>`;

const cineHero = () => `
<section id="hero" class="hero home-hero mcc">
  <div class="hero-grad"></div>
  <div class="wrap hero-inner">
    <div class="hero-copy reveal">
      <p class="eyebrow" style="color:var(--mc-gold)">Official Government · Mercer County, West Virginia</p>
      <h1>Serving Mercer County <em>with pride.</em></h1>
      <p class="lede">Meetings and minutes, public notices, county offices and services — all in one place. ${esc(D.county.tagline)}.</p>
      <div class="hero-cta">
        <a class="btn btn-gold" href="meetings.html">${icon("video")} Meetings &amp; minutes →</a>
        <a class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.45)" href="notices.html">${icon("megaphone")} Public notices</a>
      </div>
      <p class="hero-credit">Mercer County Courthouse · 1501 West Main Street, Princeton</p>
    </div>
  </div>
  <svg class="ridge" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0,150 L160,90 L320,140 L520,70 L720,130 L920,60 L1120,120 L1300,80 L1440,120 L1440,220 L0,220 Z" fill="var(--mc-teal)" opacity="0.35"/>
    <path d="M0,180 L200,120 L400,170 L620,110 L820,165 L1040,105 L1240,160 L1440,120 L1440,220 L0,220 Z" fill="var(--mc-navy-deep)" opacity="0.6"/>
    <path d="M0,200 L240,160 L480,195 L720,150 L980,195 L1220,155 L1440,190 L1440,220 L0,220 Z" fill="var(--mc-paper)"/>
  </svg>
</section>`;

const featureCard = f => `
<a class="feature reveal" href="${f.href}" style="">
  <div class="feature-img" style="background-image:url('img/mcc/${f.img}')"></div>
  <span class="f-arrow" aria-hidden="true">${icon("arrowup")}</span>
  <div class="feature-body">
    <span class="f-ic" aria-hidden="true">${icon(f.icon)}</span>
    <h3>${esc(f.title)}</h3>
    <p>${esc(f.desc)}</p>
  </div>
</a>`;

const svcTile = o => {
  const inner = `
  <span class="svc-icon" aria-hidden="true">${o.id?iconById(o.id):iconByName(o.name)}</span>
  <span class="svc-body"><strong>${esc(o.name)}</strong>
  ${o.phone?`<span class="svc-meta">${esc(o.phone)}</span>`:""}
  ${o.where?`<span class="svc-meta">${esc(o.where)}</span>`:""}
  ${o.contact?`<span class="svc-meta">${esc(o.contact)}</span>`:""}
  <span class="svc-desc">${esc(o.desc)}</span></span>`;
  return o.href
    ? `<a class="svc reveal" href="${o.href}" id="${o.id||''}">${inner}</a>`
    : `<div class="svc reveal svc-static" id="${o.id||''}">${inner}</div>`;
};

const bridge = () => `
<section class="bridge" style="--bridge-img:url('../img/mcc/autumn.jpg')">
  <div class="bridge-scrim"></div>
  <div class="wrap bridge-in reveal">
    <span class="eyebrow light">Plan a visit</span>
    <h2>More than government — a place to explore</h2>
    <p>From the Bluestone Gorge to historic Bramwell and the Hatfield-McCoy Trails, discover why Mercer County is a shining community in the mountains of Appalachia.</p>
    <a class="btn btn-gold" href="${D.county.visitUrl}" target="_blank" rel="noopener">Visit Mercer County ↗</a>
  </div>
</section>`;

/* ---------- pages ---------- */
const pages = [];

/* HOME */
pages.push({ file:"index.html", active:"index.html", title:null,
  desc:`Official website of the ${D.county.name} — ${D.county.tagline}. Meetings, public notices, offices, agencies and services.`,
  body:
  cineHero()
  + `<span id="quicklinks"></span>` + quickbar()
  + `<section class="band"><div class="wrap">
      <div class="dhead reveal"><span class="kicker">Explore your government</span><h2>Everything Mercer County, in one place</h2></div>
      <div class="feature-grid tall">
        ${featureCard({href:"meetings.html",img:"commission-event.jpg",icon:"video",title:"Meetings & Video",desc:"Watch live or on demand, view the schedule and read official minutes."})}
        ${featureCard({href:"offices.html",img:"courthouse-2.webp",icon:"columns",title:"Offices & Courts",desc:"Assessor, Clerks, Sheriff, Prosecutor and the county courts."})}
        ${featureCard({href:"notices.html",img:"seal-map-dark.webp",icon:"megaphone",title:"Public Notices",desc:"Legal ads, bids, hearings and job postings for the record."})}
        ${featureCard({href:"agencies.html",img:"falls.jpg",icon:"recycle",title:"Departments & Services",desc:"911, animal shelter, recycling, airport, health and more."})}
        ${featureCard({href:"government.html",img:"commission-office.jpg",icon:"users",title:"The Commission",desc:"Meet your three commissioners and how the county is governed."})}
      </div>
    </div></section>`
  + `<section class="band alt"><div class="wrap">
      <div class="dhead center reveal"><span class="kicker">Your elected leadership</span><h2>Three commissioners, one community</h2>
      <p class="lead" style="margin:0 auto">The governing body of Mercer County — adopting the budget, overseeing agencies and serving residents countywide.</p></div>
      <div class="person-grid">
        ${D.commissioners.map(c=>`
        <article class="person reveal">
          <div class="person-ava" aria-hidden="true">${c.initials}</div>
          <h3>${esc(c.name)}</h3>
          <p class="person-role">${esc(c.role)}</p>
          ${c.term?`<p class="person-term">${esc(c.term)}</p>`:""}
          <p class="person-bio">${esc(c.bio)}</p>
        </article>`).join("")}
      </div>
      <p class="center" style="margin-top:2em"><a class="btn btn-gold" href="government.html">About the Commission →</a></p>
    </div></section>`
  + `<section class="band"><div class="wrap two-col">
      <div class="reveal">
        <div class="dhead" style="margin-bottom:1.2em"><span class="kicker">Stay informed</span><h2>Latest news</h2></div>
        <div class="newslist">
        ${D.news.slice(0,4).map(n=>`
          <a class="newsrow" href="news.html">
            <span class="news-date">${fmtShort(n.date)}</span>
            <span class="news-body"><span class="tag">${esc(n.tag)}</span><strong>${esc(n.title)}</strong></span>
          </a>`).join("")}
        </div>
        <p><a class="btn btn-ghost" href="news.html">All news →</a></p>
      </div>
      <div class="reveal">
        <div class="dhead" style="margin-bottom:1.2em"><span class="kicker">On the calendar</span><h2>Upcoming meetings</h2></div>
        <div class="mtg-list">
        ${D.meetings.filter(m=>m.status==="upcoming").map(m=>`
          <div class="mtg-row">
            <span class="mtg-cal"><span class="mtg-mon">${new Date(m.date+"T12:00").toLocaleDateString("en-US",{month:"short"})}</span><span class="mtg-day">${new Date(m.date+"T12:00").getDate()}</span></span>
            <span class="mtg-info"><strong>${esc(m.type)}</strong><span class="mtg-meta">${esc(m.time)} · Commission Chambers, Courthouse</span></span>
          </div>`).join("")}
        </div>
        <p><a class="btn btn-ghost" href="meetings.html">Full schedule & video →</a></p>
      </div>
    </div></section>`
  + `<section class="statband"><div class="wrap stat-in">
      <div class="stat reveal"><span class="stat-num">62k+</span><span class="stat-lbl">Residents served</span></div>
      <div class="stat reveal"><span class="stat-num">${new Date().getFullYear()-D.county.founded}</span><span class="stat-lbl">Years since ${D.county.founded}</span></div>
      <div class="stat reveal"><span class="stat-num">18+</span><span class="stat-lbl">Boards & authorities</span></div>
      <div class="stat reveal"><span class="stat-num">2nd&amp;4th</span><span class="stat-lbl">Tuesday meetings</span></div>
    </div></section>`
  + bridge()
});

/* GOVERNMENT */
pages.push({ file:"government.html", active:"government.html", title:"The Commission",
  desc:"The Mercer County Commission — the county's governing body, its members, meeting schedule and responsibilities.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Government"}])
  + pageHead({eyebrow:"Government",title:"The Mercer County Commission",
    sub:"The Commission is the elected governing body of the county — adopting the budget, levying taxes, overseeing agencies and appointing boards."})
  + `<section class="band"><div class="wrap">
      <div class="person-grid big">
      ${D.commissioners.map(c=>`
        <article class="person big reveal">
          <div class="person-ava" aria-hidden="true">${c.initials}</div>
          <div><h3>${esc(c.name)}</h3><p class="person-role">${esc(c.role)}</p>
          ${c.term?`<p class="person-term">${esc(c.term)}</p>`:""}
          <p class="person-bio">${esc(c.bio)}</p></div>
        </article>`).join("")}
      </div>
    </div></section>`
  + `<section class="band alt"><div class="wrap two-col">
      <div class="reveal"><span class="eyebrow">What we do</span><h2>Responsibilities</h2>
        <ul class="checklist">
          <li>Adopt the annual county budget and set the property-tax levy</li>
          <li>Oversee county departments, agencies and facilities</li>
          <li>Appoint members to boards, authorities and commissions</li>
          <li>Sit as the Board of Review & Equalization on assessments</li>
          <li>Adopt county ordinances and enter into contracts</li>
          <li>Maintain public records and conduct open public meetings</li>
        </ul>
      </div>
      <div class="reveal" id="meetings-info"><span class="eyebrow">When we meet</span><h2>Meeting schedule</h2>
        <div class="infocard">
          <p><strong>Agenda Meeting</strong><br>1st Tuesday · 10:00 AM</p>
          <p><strong>Commission Meeting</strong><br>2nd Tuesday · 10:00 AM</p>
          <p><strong>Commission Meeting</strong><br>4th Tuesday · 3:30 PM</p>
          <p class="muted">Commission Chambers, ${esc(D.county.courthouse)}, ${esc(D.county.address)}. Open to the public.</p>
          <a class="btn btn-navy" href="meetings.html">Watch & read minutes →</a>
        </div>
      </div>
    </div></section>`
  + `<section class="band" id="ordinances"><div class="wrap">
      <div class="sec-head reveal"><span class="eyebrow">County code</span><h2>Ordinances</h2></div>
      <div class="card-grid">${D.ordinances.map(o=>`<article class="minicard reveal"><span class="mc-icon">${iconByName(o.name)}</span><h3>${esc(o.name)}</h3><p>${esc(o.desc)}</p></article>`).join("")}</div>
    </div></section>`
  + `<section class="band alt" id="careers"><div class="wrap two-col">
      <div class="reveal"><span class="eyebrow">Work with us</span><h2>Jobs & employment</h2><p>Mercer County is an equal-opportunity employer. Current openings and application instructions are posted with the County Clerk and on our public notices page.</p><a class="btn btn-ghost" href="notices.html">View openings →</a></div>
      <div class="reveal" id="bids"><span class="eyebrow">Procurement</span><h2>Bids & RFPs</h2><p>Formal invitations to bid and requests for proposals are advertised as public notices. Sealed bids are opened at public commission meetings.</p><a class="btn btn-ghost" href="notices.html">Open bids →</a></div>
    </div></section>`
});

/* OFFICES */
pages.push({ file:"offices.html", active:"offices.html", title:"Elected Offices",
  desc:"Mercer County elected offices and courts — Assessor, County Clerk, Circuit Clerk, Sheriff, Prosecuting Attorney and the courts.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Offices"}])
  + pageHead({eyebrow:"Government",title:"Elected Offices & Courts",sub:"Constitutional offices and courts that serve Mercer County residents."})
  + `<section class="band"><div class="wrap"><div class="svc-grid wide">${D.offices.map(o=>svcTile({...o, href:o.href||officeHref(o.id)})).join("")}</div></div></section>`
  + quickbar()
});

/* AGENCIES */
pages.push({ file:"agencies.html", active:"agencies.html", title:"Departments & Agencies",
  desc:"Mercer County departments and agencies — 911, Emergency Management, Animal Shelter, Health, Airport, Recycling and more.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Agencies"}])
  + pageHead({eyebrow:"Government",title:"Departments & Agencies",sub:"The programs and services the county operates for residents every day."})
  + `<section class="band"><div class="wrap"><div class="svc-grid wide">${D.agencies.map(o=>svcTile({...o, href:o.href||agencyHref(o.id)})).join("")}</div>`
  + (()=>{
      const covered = new Set(D.agencies.map(a=>AGENCY_ALIAS[a.id]||a.id));
      const extras = bySection.agencies.filter(a=>a.slug && !covered.has(a.slug) && a.slug!=="animal-shelter");
      if(!extras.length) return "";
      return `<div class="sec-head reveal" style="margin-top:2.4em"><span class="eyebrow">Cities, towns &amp; partners</span><h2>Municipalities &amp; partner agencies</h2><p class="lead">Incorporated communities and partner organizations that serve Mercer County residents.</p></div>
      <div class="svc-grid wide">${extras.map(a=>svcTile({id:a.slug, name:a.name, desc:a.blurb, href:detailFile("agencies",a.slug)})).join("")}</div>`;
    })()
  + `</div></section>`
});

/* ANIMAL SHELTER (detail page) */
pages.push({ file:"animal-shelter.html", active:"agencies.html", title:"Animal Shelter & Adoption",
  desc:"Adopt, foster, volunteer or donate at the Mercer County Animal Shelter — an open-admission county shelter in Princeton providing humane care for stray and surrendered animals.",
  body: hero({img:"falls.jpg", eyebrow:"Departments & Agencies",
      title:"Mercer County Animal Shelter",
      sub:"Compassionate, open-admission care for the stray and surrendered animals of Mercer County — and a second chance at a forever home.",
      ctas:[{label:"How to adopt",href:"#adopt"},{label:`${icon("headset")} Call the shelter`,href:"tel:+13044252838",kind:"btn-ghost"}]})
  + crumb([{label:"Home",href:"index.html"},{label:"Agencies",href:"agencies.html"},{label:"Animal Shelter"}])
  + `<section class="band"><div class="wrap two-col">
      <div class="reveal">
        <span class="eyebrow">About the shelter</span>
        <h2>Humane care, every single day</h2>
        <p class="lead">The Mercer County Animal Shelter is an open-admission county facility led by Director Stacy Harman. We provide shelter, food and veterinary care to lost, stray and relinquished animals, and we work every day to reunite pets with their families or place them in loving new homes.</p>
        <ul class="checklist">
          <li>Open-admission — we accept animals from Mercer County residents</li>
          <li>Every adopted pet is spayed or neutered before going home</li>
          <li>Rescue-friendly — we partner with 501(c)(3) rescue organizations</li>
          <li>Adopters receive vaccination and microchipping guidance</li>
        </ul>
      </div>
      <div class="reveal">
        <div class="infocard">
          <p><strong>${icon("home","tb-ic")} Location</strong><br>961 Shelter Road, Princeton, WV 24740</p>
          <p><strong>${icon("headset","tb-ic")} Phone</strong><br><a href="tel:+13044252838">(304) 425-2838</a></p>
          <p><strong>${icon("calendar","tb-ic")} Adoption hours</strong><br>Tuesday–Saturday, 12:00–6:00 PM · Closed Sunday, Monday &amp; holidays. Call ahead to confirm a pet is still available before visiting.</p>
          <a class="btn btn-navy" href="https://www.google.com/maps/dir/?api=1&destination=961+Shelter+Road,+Princeton,+WV+24740" target="_blank" rel="noopener">Get directions ↗</a>
        </div>
      </div>
    </div></section>`
  + `<section id="adoptable" class="band"><div class="wrap">
      <div class="sec-head reveal"><span class="eyebrow">Meet the animals</span><h2>Adoptable dogs &amp; cats</h2>
      <p class="lead">Our adoptable pets — and their photos — are kept current on the shelter's live listings. Browse who's available right now, then call <a href="tel:+13044252838">(304) 425-2838</a> to arrange a visit.</p></div>
      <div class="hero-ctas" style="flex-wrap:wrap">
        <a class="btn btn-gold" href="https://mercercounty.wvanimalshelter.org/dogs.php" target="_blank" rel="noopener">${icon("paw")} Adoptable dogs ↗</a>
        <a class="btn btn-navy" href="https://mercercounty.wvanimalshelter.org/cats.php" target="_blank" rel="noopener">${icon("paw")} Adoptable cats ↗</a>
        <a class="btn btn-ghost" href="https://www.petfinder.com/member/us/wv/princeton/mercer-county-animal-shelter-wv59/" target="_blank" rel="noopener">Petfinder ↗</a>
        <a class="btn btn-ghost" href="https://www.adoptapet.com/shelter/79644-mercer-county-animal-shelter-princeton-west-virginia" target="_blank" rel="noopener">Adopt-a-Pet ↗</a>
      </div>
      <div class="petembed" data-pet-embed style="margin-top:1.6em">
        <div class="petembed-tabs" role="tablist" aria-label="Choose animal type">
          <button class="petembed-tab is-on" type="button" data-pet="dogs" aria-selected="true">Dogs</button>
          <button class="petembed-tab" type="button" data-pet="cats" aria-selected="false">Cats</button>
        </div>
        <div class="petembed-shell">
          <div class="petembed-cta" data-pet-cta>
            <span class="petembed-ic" aria-hidden="true">${icon("paw")}</span>
            <p>See the shelter's current dogs and cats — with photos — right here on the page.</p>
            <button class="btn btn-gold" type="button" data-load-pets>Show adoptable pets</button>
            <p class="muted" style="font-size:.85rem;margin-top:.7em">Loads the shelter's live listing. Photos © Mercer County Animal Shelter &amp; rescue partners.</p>
          </div>
        </div>
      </div>
      <p class="muted center" style="margin-top:1.1em">Also find the shelter on <a href="https://www.facebook.com/mercercountyanimalshelter/" target="_blank" rel="noopener">Facebook</a> and at <a href="https://mcaswv.org/" target="_blank" rel="noopener">mcaswv.org</a>.</p>
    </div></section>`
  + `<section id="adopt" class="band alt"><div class="wrap">
      <div class="sec-head reveal"><span class="eyebrow">Adopt</span><h2>How to adopt a pet</h2>
      <p class="lead">Adopting a shelter pet saves a life — and opens a kennel for another animal in need. Here's how the process works.</p></div>
      <div class="card-grid">
        <article class="minicard reveal"><span class="mc-icon">${icon("search")}</span><h3>1 · Meet the animals</h3><p>Call or visit the shelter to see the dogs and cats currently available. Staff can help match a pet to your home and lifestyle.</p></article>
        <article class="minicard reveal"><span class="mc-icon">${icon("clipboard")}</span><h3>2 · Apply</h3><p>Complete a short adoption application. Staff review it to ensure a safe, lasting placement for the animal.</p></article>
        <article class="minicard reveal"><span class="mc-icon">${icon("health")}</span><h3>3 · Spay / neuter</h3><p>Every pet is spayed or neutered before adoption — a cornerstone of responsible, humane pet ownership.</p></article>
        <article class="minicard reveal"><span class="mc-icon">${icon("paw")}</span><h3>4 · Take them home</h3><p>Finalize the adoption, get vaccination and microchip guidance, and welcome your new family member home.</p></article>
      </div>
      <p class="center" style="margin-top:1.6em"><a class="btn btn-gold" href="tel:+13044252838">${icon("headset")} Call to meet the animals →</a></p>
    </div></section>`
  + `<section class="band"><div class="wrap">
      <div class="sec-head reveal"><span class="eyebrow">Get involved</span><h2>More ways to help</h2>
      <p class="lead">You don't have to adopt to make a difference. Fostering, volunteering and donations keep our animals healthy and cared for.</p></div>
      <div class="card-grid">
        <article class="minicard reveal"><span class="mc-icon">${icon("home")}</span><h3>Foster a pet</h3><p>Open your home temporarily to a pet who needs extra time, socialization or medical recovery. Fostering frees up space and saves lives.</p></article>
        <article class="minicard reveal"><span class="mc-icon">${icon("users")}</span><h3>Volunteer</h3><p>Walk dogs, socialize cats, help at events or lend a professional skill. Call the shelter to learn about current volunteer needs.</p></article>
        <article class="minicard reveal"><span class="mc-icon">${icon("dollar")}</span><h3>Donate</h3><p>Food, blankets, cleaning supplies and monetary gifts all help. Call ahead to confirm the shelter's current wish list before dropping off items.</p></article>
        <article class="minicard reveal"><span class="mc-icon">${icon("handshake")}</span><h3>Rescue partners</h3><p>We work with 501(c)(3) rescue organizations to place animals. Rescues interested in partnering are encouraged to reach out.</p></article>
      </div>
    </div></section>`
  + `<section class="band alt"><div class="wrap two-col">
      <div class="reveal">
        <span class="eyebrow">Lost &amp; found</span>
        <h2>Lost or found a pet?</h2>
        <p>If your pet is missing, contact the shelter as soon as possible and check in regularly — reuniting families is one of the most important things we do. If you've found a stray, call us so we can help.</p>
        <ul class="checklist">
          <li>Call <a href="tel:+13044252838">(304) 425-2838</a> to report a lost or found animal</li>
          <li>Have a description, photo and the location last seen ready</li>
          <li>Microchipped pets are far easier to reunite — ask your vet about chipping</li>
        </ul>
      </div>
      <div class="reveal">
        <span class="eyebrow">Surrendering an animal</span>
        <h2>Need to surrender a pet?</h2>
        <p>As an open-admission shelter, we accept animals from Mercer County residents. If you can no longer care for a pet, please call ahead so staff can guide you through intake and, where possible, discuss alternatives that might keep your pet with you.</p>
        <a class="btn btn-navy" href="tel:+13044252838">${icon("headset")} Call before surrendering</a>
      </div>
    </div></section>`
  + `<section class="bridge" style="--bridge-img:url('../img/mcc/autumn.jpg')">
      <div class="bridge-scrim"></div>
      <div class="wrap bridge-in reveal">
        <span class="eyebrow light">Every pet deserves a home</span>
        <h2>Adopt. Foster. Volunteer. Donate.</h2>
        <p>Your compassion changes lives across Mercer County. Reach out today — the animals are waiting.</p>
        <a class="btn btn-gold" href="tel:+13044252838">${icon("headset")} (304) 425-2838</a>
      </div>
    </section>`
  + `<script>
(function(){
  var wrap=document.querySelector('[data-pet-embed]');
  if(!wrap) return;
  var shell=wrap.querySelector('.petembed-shell');
  var cta=wrap.querySelector('[data-pet-cta]');
  var current='dogs', loaded=false, frame=null;
  var URLS={dogs:'https://mercercounty.wvanimalshelter.org/dogs.php',cats:'https://mercercounty.wvanimalshelter.org/cats.php'};
  function load(){
    if(cta) cta.style.display='none';
    if(!frame){
      frame=document.createElement('iframe');
      frame.className='petembed-frame';
      frame.title='Live adoptable pets listing';
      frame.setAttribute('loading','lazy');
      shell.appendChild(frame);
    }
    frame.src=URLS[current];
    loaded=true;
  }
  var btn=wrap.querySelector('[data-load-pets]');
  if(btn) btn.addEventListener('click',load);
  Array.prototype.forEach.call(wrap.querySelectorAll('.petembed-tab'),function(t){
    t.addEventListener('click',function(){
      Array.prototype.forEach.call(wrap.querySelectorAll('.petembed-tab'),function(x){x.classList.remove('is-on');x.setAttribute('aria-selected','false');});
      t.classList.add('is-on'); t.setAttribute('aria-selected','true');
      current=t.getAttribute('data-pet');
      if(loaded) load();
    });
  });
})();
</script>`
});

/* BOARDS */
pages.push({ file:"boards.html", active:"boards.html", title:"Boards & Authorities",
  desc:"Mercer County boards, authorities and commissions appointed by the County Commission.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Boards"}])
  + pageHead({eyebrow:"Government",title:"Boards, Authorities & Commissions",sub:"The County Commission appoints citizen members to the boards and authorities that guide public services. Interested in serving? Submit a letter of interest."})
  + `<section class="band"><div class="wrap"><div class="card-grid">${
      (bySection.boards.length
        ? bySection.boards.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(b=>{
            const f = detailFile("boards", b.slug);
            const inner = `<span class="mc-icon">${iconByName(b.name)}</span><h3>${esc(b.name)}</h3><p>${esc(b.blurb||"")}</p>`;
            return hasDetail.has(f)
              ? `<a class="minicard minicard-link reveal" href="${f}">${inner}<span class="mc-more">Details →</span></a>`
              : `<article class="minicard reveal">${inner}</article>`;
          }).join("")
        : D.boards.map(b=>`<article class="minicard reveal"><span class="mc-icon">${iconByName(b.name)}</span><h3>${esc(b.name)}</h3><p>${esc(b.desc)}</p></article>`).join(""))
    }</div>
      <p class="center"><a class="btn btn-navy" href="contact.html">Apply to serve →</a></p></div></section>`
});

/* MEETINGS */
pages.push({ file:"meetings.html", active:"meetings.html", title:"Meetings & Minutes",
  desc:"Watch Mercer County Commission meetings live or on demand, view the schedule and read published minutes.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Meetings"}])
  + pageHead({eyebrow:"Open government",title:"Meetings, Video & Minutes",sub:"Commission meetings are open to the public. Attend in person, join the virtual meeting, watch recordings, or read the official minutes."})
  + `<section class="band"><div class="wrap two-col">
      <div class="reveal"><span class="eyebrow">Join live</span><h2>Attend or watch</h2>
        <div class="infocard">
          <p><strong>📍 In person</strong><br>Commission Chambers, ${esc(D.county.courthouse)}<br>${esc(D.county.address)}</p>
          <p><strong>🎥 Virtual meeting</strong><br>Join by video when a session is live.</p>
          <span class="btn btn-gold is-disabled" id="joinLive" aria-disabled="true">Join live meeting</span>
          <p class="muted" id="liveNote">No meeting is live right now. A join link appears here when a session begins.</p>
        </div>
      </div>
      <div class="reveal"><span class="eyebrow">Schedule</span><h2>Upcoming meetings</h2>
        <div class="mtg-list">
        ${D.meetings.filter(m=>m.status==="upcoming").map(m=>`
          <div class="mtg-row">
            <span class="mtg-cal"><span class="mtg-mon">${new Date(m.date+"T12:00").toLocaleDateString("en-US",{month:"short"})}</span><span class="mtg-day">${new Date(m.date+"T12:00").getDate()}</span></span>
            <span class="mtg-info"><strong>${esc(m.type)}</strong><span class="mtg-meta">${esc(m.time)} · Commission Chambers</span></span>
            <a class="mtg-ics" href="#" data-ics="${m.date}" data-time="${esc(m.time)}" data-type="${esc(m.type)}" title="Add to calendar">📅</a>
          </div>`).join("")}
        </div>
        <p class="muted">Pattern: Agenda 1st Tue 10 AM · Commission 2nd Tue 10 AM &amp; 4th Tue 3:30 PM.</p>
      </div>
    </div></section>`
  + `<section class="band alt"><div class="wrap">
      <div class="sec-head reveal"><span class="eyebrow">On demand</span><h2>Recorded meetings & minutes</h2>
      <p class="lead">Missed a meeting? Watch the recording and read the official record.</p></div>
      <div class="doclist">
        ${D.meetings.filter(m=>m.status==="past").map(m=>`
          <div class="docrow reveal">
            <span class="doc-ico" aria-hidden="true">${m.video?"🎥":"📄"}</span>
            <span class="doc-main"><strong>${esc(m.type)}</strong><span class="doc-meta">${fmtDate(m.date)} · ${esc(m.time)}</span></span>
            <span class="doc-actions">
              ${m.video?`<a class="chip" href="#latest-recording">Watch</a>`:""}
              ${m.minutes?`<span class="chip ghost is-disabled" aria-disabled="true" title="Official minutes are published after Commission approval">Minutes (PDF)</span>`:""}
            </span>
          </div>`).join("")}
      </div>
    </div></section>`
  + `<section class="band"><div class="wrap">
      <div class="sec-head reveal"><span class="eyebrow">Latest recording</span><h2>Watch the last meeting</h2></div>
      <div class="video-frame reveal" id="latest-recording">
        <div class="video-ph"><span aria-hidden="true">▶</span><p>Meeting video will embed here once published.<br><span class="muted">Recordings are posted to the county's official channel after each meeting.</span></p></div>
      </div>
    </div></section>`
});

/* NEWS */
pages.push({ file:"news.html", active:"news.html", title:"News & Press",
  desc:"News, press releases and announcements from the Mercer County Commission.",
  body: crumb([{label:"Home",href:"index.html"},{label:"News"}])
  + pageHead({eyebrow:"Newsroom",title:"News & Press Releases"})
  + `<section class="band"><div class="wrap">
      <div class="filterbar"><input id="newsFilter" type="search" placeholder="Search news…" aria-label="Search news"></div>
      <div class="article-list" id="newsList">
      ${D.news.map(n=>`
        <article class="article reveal" data-text="${esc((n.title+' '+n.body+' '+n.tag).toLowerCase())}">
          <div class="art-meta"><span class="tag">${esc(n.tag)}</span><time>${fmtDate(n.date)}</time></div>
          <h3>${esc(n.title)}</h3>
          <p>${esc(n.body)}</p>
        </article>`).join("")}
      </div>
    </div></section>`
});

/* NOTICES (public + fed by API) */
pages.push({ file:"notices.html", active:null, title:"Public Notices",
  desc:"Official public notices, legal advertisements, bids and hearings from the Mercer County Commission.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Public Notices"}])
  + pageHead({eyebrow:"Official record",title:"Public Notices",sub:"Legal advertisements, meeting notices, bids, RFPs and public hearings. Notices are published by the Commission for the public record."})
  + `<section class="band"><div class="wrap">
      <div class="filterbar">
        <input id="noticeFilter" type="search" placeholder="Search notices…" aria-label="Search notices">
        <div class="chipset" id="noticeCats" role="group" aria-label="Filter by category">
          <button class="chip active" data-cat="all">All</button>
          <button class="chip" data-cat="meeting">Meetings</button>
          <button class="chip" data-cat="bid">Bids/RFPs</button>
          <button class="chip" data-cat="hearing">Hearings</button>
          <button class="chip" data-cat="job">Jobs</button>
          <button class="chip" data-cat="legal">Legal</button>
        </div>
      </div>
      <div id="noticeList" class="notice-list" aria-live="polite"><p class="muted">Loading notices…</p></div>
    </div></section>`
});

/* CONTACT */
pages.push({ file:"contact.html", active:"contact.html", title:"Contact & Directory",
  desc:"Contact the Mercer County Commission — address, phone, hours, directory and records/FOIA requests.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Contact"}])
  + pageHead({eyebrow:"Get in touch",title:"Contact & Directory"})
  + `<section class="band"><div class="wrap two-col">
      <div class="reveal"><span class="eyebrow">County Commission</span><h2>Visit or call</h2>
        <div class="infocard">
          <p><strong>📍 Address</strong><br>${esc(D.county.address)}<br>${esc(D.county.courthouse)}</p>
          <p><strong>📞 Phone</strong><br><a href="tel:${D.county.phoneRaw}">${esc(D.county.phone)}</a></p>
          <p><strong>🕗 Hours</strong><br>${esc(D.county.hours)}</p>
        </div>
      </div>
      <div class="reveal"><span class="eyebrow">Send a message</span><h2>Contact form</h2>
        <form class="cform" id="contactForm" novalidate>
          <label>Name<input name="name" required></label>
          <label>Email<input name="email" type="email" required></label>
          <label>Subject<input name="subject"></label>
          <label>Message<textarea name="message" rows="5" required></textarea></label>
          <button class="btn btn-navy" type="submit">Send message</button>
          <p class="form-note" id="cformNote" role="status"></p>
        </form>
      </div>
    </div></section>`
  + `<section class="band alt" id="foia"><div class="wrap two-col">
      <div class="reveal"><span class="eyebrow">Transparency</span><h2>Records & FOIA requests</h2><p>West Virginia's Freedom of Information Act (WV Code §29B-1) gives every person the right to inspect and copy public records. Submit written requests to the County Clerk; the county responds within the time required by law.</p><a class="btn btn-ghost" href="tel:${D.county.phoneRaw}">Call the Clerk →</a></div>
      <div class="reveal"><span class="eyebrow">Directory</span><h2>Key numbers</h2>
        <div class="dir">
          <div class="dir-row"><span>County Commission</span><a href="tel:+13044878306">(304) 487-8306</a></div>
          <div class="dir-row"><span>Assessor</span><a href="tel:+13044878397">(304) 487-8397</a></div>
          <div class="dir-row"><span>County Clerk</span><a href="tel:+13044878338">(304) 487-8338</a></div>
          <div class="dir-row"><span>Animal Shelter</span><a href="tel:+13044252838">(304) 425-2838</a></div>
          <div class="dir-row"><span>Airport</span><a href="tel:+13043278440">(304) 327-8440</a></div>
          <div class="dir-row emphasis"><span>Emergencies</span><a href="tel:911">911</a></div>
        </div>
      </div>
    </div></section>`
});

/* ABOUT */
pages.push({ file:"about.html", active:null, title:"About the County",
  desc:"About Mercer County, West Virginia — history, geography and heritage.",
  body: crumb([{label:"Home",href:"index.html"},{label:"About"}])
  + hero({img:"autumn-2.jpg",eyebrow:"About",title:"About Mercer County",sub:D.county.tagline})
  + `<section class="band"><div class="wrap prose reveal">
      <p>Established in <strong>${D.county.founded}</strong> and named for Revolutionary War General Hugh Mercer, Mercer County sits in the mountains of southern West Virginia with its county seat in <strong>${esc(D.county.seat)}</strong>.</p>
      <p>The arrival of the Norfolk & Western Railway in <strong>1883</strong> and the discovery of the famed <strong>Pocahontas No. 3 "smokeless" coal seam</strong> transformed the region into a national energy powerhouse, giving rise to historic towns like Bramwell — once home to more millionaires per capita than anywhere in America.</p>
      <p>Today Mercer County blends that proud heritage with outdoor adventure — the Bluestone Gorge, the Hatfield-McCoy Trails and vibrant downtowns in Princeton and Bluefield — earning its title as <em>${esc(D.county.tagline)}</em>.</p>
    </div></section>`
  + bridge()
});

/* EMERGENCY */
pages.push({ file:"emergency.html", active:null, title:"Emergency Information",
  desc:"Mercer County emergency information — 911, emergency management, preparedness and alerts.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Emergency"}])
  + `<section class="emerg-hero"><div class="wrap reveal"><span class="eyebrow light">Emergency</span><h1>In an emergency, call <a href="tel:911">911</a></h1><p class="lead">The Mercer Communications Center dispatches police, fire, EMS and emergency management countywide, 24/7.</p></div></section>`
  + `<section class="band"><div class="wrap">
      <div class="card-grid">
        <article class="minicard reveal"><span class="mc-icon">${icon("headset")}</span><h3>911 Dispatch</h3><p>For any life-threatening emergency, fire, crime in progress or medical emergency, call 911 immediately.</p></article>
        <article class="minicard reveal"><span class="mc-icon">${icon("siren")}</span><h3>Emergency Management</h3><p>Disaster preparedness, severe-weather response and recovery coordination for the county.</p></article>
        <article class="minicard reveal"><span class="mc-icon">${icon("sound")}</span><h3>Alerts & Warnings</h3><p>Monitor NOAA Weather Radio and local media during severe weather. Sign up for county emergency notifications.</p></article>
        <article class="minicard reveal"><span class="mc-icon">${icon("shield")}</span><h3>Be Prepared</h3><p>Keep a kit with water, food, medications, flashlight and a plan. Know your evacuation routes.</p></article>
      </div>
    </div></section>`
});

/* RESOURCES */
pages.push({ file:"resources.html", active:null, title:"Resident Resources",
  desc:"Resources and quick links for Mercer County residents.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Resources"}])
  + pageHead({eyebrow:"For residents",title:"Resources & Quick Links"})
  + quickbar()
  + `<section class="band"><div class="wrap"><div class="card-grid">
      ${D.agencies.slice(0,9).map(a=>`<a class="minicard link reveal" href="${a.href||('agencies.html#'+a.id)}"><span class="mc-icon">${iconById(a.id)}</span><h3>${esc(a.name)}</h3><p>${esc(a.desc)}</p></a>`).join("")}
    </div></div></section>`
});

/* PORTAL (board login gateway) */
pages.push({ file:"portal.html", active:null, title:"Board Portal",
  desc:"Secure portal for Mercer County Commissioners and staff.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Board Portal"}])
  + `<section class="band narrow"><div class="wrap portal-in reveal">
      <img class="seal-img big" src="img/mcc/seal-white.png" alt="Mercer County seal" width="80" height="80">
      <h1>Board & Staff Portal</h1>
      <p class="lead">Secure sign-in for commissioners and authorized staff to publish notices, message the board and manage meetings.</p>
      <div class="portal-actions">
        <a class="btn btn-navy" href="/.auth/login/aad?post_login_redirect_uri=/admin.html">Sign in with Microsoft</a>
        <a class="btn btn-ghost" href="/.auth/login/github?post_login_redirect_uri=/admin.html">Sign in with GitHub</a>
      </div>
      <p class="portal-reset">Password changes and resets are handled by your identity provider's own account page. <em>Google and email &amp; password sign-in can be enabled after upgrading hosting to the Standard plan.</em></p>
      <p class="muted">Access is restricted to the <strong>commissioner</strong> and <strong>admin</strong> roles. Public users can view <a href="notices.html">published notices</a> and <a href="meetings.html">meeting recordings</a>.</p>
    </div></section>`
});

/* ADMIN (client shell; gated by SWA auth roles at deploy) */
pages.push({ file:"admin.html", active:null, title:"Board Admin",
  desc:"Administration console for the Mercer County Commission board portal.",
  body: `<section class="admin" id="adminApp">
      <div class="wrap">
        <div class="admin-head reveal">
          <div><span class="eyebrow">Board Portal</span><h1>Administration</h1></div>
          <div class="admin-profile">
            <button class="profile-btn" id="profileBtn" aria-haspopup="true" aria-expanded="false" aria-label="Account menu" title="Account">
              <span class="profile-ava" id="profileAva" aria-hidden="true">👤</span>
            </button>
            <div class="profile-menu" id="profileMenu" role="menu" hidden>
              <div class="profile-id"><strong id="whoName">Not signed in</strong></div>
              <button class="profile-item" id="profileSettings" type="button" role="menuitem">⚙️ Settings</button>
              <a class="profile-item" id="profileSignout" href="/.auth/logout?post_logout_redirect_uri=/portal.html" role="menuitem">↪ Sign out</a>
            </div>
          </div>
        </div>
        <div class="gate" id="gate" hidden><p>You must sign in with an authorized account to use this console.</p><a class="btn btn-navy" href="portal.html">Go to sign-in →</a></div>
        <div class="admin-grid" id="console" hidden>
          <aside class="admin-side">
            <nav class="admin-tabs" role="tablist" aria-label="Admin sections">
              <button class="atab active" data-tab="notices" role="tab">📢 <span>Notices</span></button>
              <button class="atab" data-tab="board" role="tab">💬 <span>Board Messages</span></button>
              <button class="atab" data-tab="meetings" role="tab">🎥 <span>Meetings</span></button>
              <button class="atab" data-tab="documents" role="tab">📄 <span>Documents</span></button>
              <button class="atab" data-tab="people" role="tab">👥 <span>People & Roster</span></button>
              <button class="atab" data-tab="settings" role="tab">⚙️ <span>Settings</span></button>
            </nav>
            <div class="admin-side-links">
              <a href="resources.html">🔗 Resources</a>
              <a href="index.html">🏛️ View public site</a>
            </div>
            <a class="admin-signout" href="/.auth/logout?post_logout_redirect_uri=/portal.html">↪ Sign out</a>
          </aside>
          <div class="admin-panels">
          <section class="atab-panel" data-panel="notices">
            <h2>Publish a public notice</h2>
            <form id="noticeForm" class="cform">
              <label>Title<input name="title" required></label>
              <label>Category
                <select name="category"><option value="meeting">Meeting</option><option value="bid">Bid / RFP</option><option value="hearing">Public Hearing</option><option value="job">Job</option><option value="legal">Legal</option></select>
              </label>
              <label>Body<textarea name="body" rows="4" required></textarea></label>
              <label>Expires (optional)<input name="expires" type="date"></label>
              <button class="btn btn-navy" type="submit">Publish notice</button>
              <p class="form-note" id="noticeMsg" role="status"></p>
            </form>
            <h3>Published</h3>
            <div id="adminNotices" class="notice-list"></div>
          </section>
          <section class="atab-panel" data-panel="board" hidden>
            <h2>Board messages</h2>
            <p class="muted">Private discussion among commissioners and staff (not public). Be mindful of open-meeting laws.</p>
            <div id="msgThread" class="msg-thread"></div>
            <form id="msgForm" class="msg-form">
              <input name="text" placeholder="Message the board…" autocomplete="off" required>
              <button class="btn btn-navy" type="submit">Send</button>
            </form>
          </section>
          <section class="atab-panel" data-panel="meetings" hidden>
            <h2>Meetings & minutes</h2>
            <form id="meetingForm" class="cform">
              <label>Date<input name="date" type="date" required></label>
              <label>Time<input name="time" placeholder="10:00 AM" required></label>
              <label>Type<select name="type"><option>Agenda Meeting</option><option>Commission Meeting</option><option>Special Meeting</option></select></label>
              <label>Video URL (recording)<input name="video" type="url" placeholder="https://…"></label>
              <label>Minutes URL (PDF)<input name="minutes" type="url" placeholder="https://…"></label>
              <button class="btn btn-navy" type="submit">Save meeting</button>
              <p class="form-note" id="meetingMsg" role="status"></p>
            </form>
            <div id="adminMeetings" class="doclist"></div>
          </section>
          <section class="atab-panel" data-panel="documents" hidden>
            <h2>Documents & forms</h2>
            <p class="muted">Publish agendas, budgets, ordinances, permits and public records. Files are linked by URL (host the PDF anywhere the public can reach).</p>
            <form id="docForm" class="cform">
              <label>Title<input name="title" required placeholder="FY2026 Adopted Budget"></label>
              <label>Category
                <select name="category">
                  <option>Agenda</option><option>Minutes</option><option>Budget</option>
                  <option>Ordinance</option><option>Resolution</option><option>Permit / Form</option>
                  <option>Financial Report</option><option>Public Record</option><option>General</option>
                </select>
              </label>
              <label>Document URL (PDF or link)<input name="url" type="url" required placeholder="https://…"></label>
              <label>Date<input name="date" type="date"></label>
              <button class="btn btn-navy" type="submit">Publish document</button>
              <p class="form-note" id="docMsg" role="status"></p>
            </form>
            <h3>Published documents</h3>
            <div id="adminDocuments" class="doclist"></div>
          </section>
          <section class="atab-panel" data-panel="people" hidden>
            <h2>People & roster</h2>
            <p class="muted">Maintain commissioners, officials and staff. Mark each person as active, retired, former, appointed or vacant — status shows on the public government page.</p>
            <form id="personForm" class="cform">
              <label>Name<input name="name" required placeholder="Jane Doe"></label>
              <label>Role / title<input name="role" placeholder="County Commissioner"></label>
              <label>Status
                <select name="status">
                  <option value="active">Active</option>
                  <option value="retired">Retired</option>
                  <option value="former">Former</option>
                  <option value="appointed">Appointed</option>
                  <option value="vacant">Vacant seat</option>
                </select>
              </label>
              <label>Term (optional)<input name="term" placeholder="2023–2029"></label>
              <label>Display order<input name="order" type="number" value="0"></label>
              <button class="btn btn-navy" type="submit">Save person</button>
              <p class="form-note" id="personMsg" role="status"></p>
            </form>
            <h3>Roster</h3>
            <div id="adminPeople" class="roster-list"></div>
          </section>
          <section class="atab-panel" data-panel="settings" hidden>
            <h2>Settings</h2>
            <div class="set-grid">
              <div class="set-card">
                <h3>Appearance</h3>
                <p class="muted">Switch this console between light and dark mode. Your choice is remembered on this device.</p>
                <button class="btn btn-navy" id="adminThemeBtn" type="button">Switch to dark mode</button>
              </div>
              <div class="set-card">
                <h3>Your account</h3>
                <p class="muted" id="setWho">Not signed in</p>
                <a class="btn btn-ghost" href="/.auth/logout?post_logout_redirect_uri=/portal.html">Sign out</a>
              </div>
              <div class="set-card">
                <h3>Password & sign-in</h3>
                <p class="muted">Sign-in is handled by your identity provider (currently Microsoft/Entra ID or GitHub). To change or reset your password, use your provider's account page.</p>
                <a class="btn btn-ghost" href="https://account.live.com/password/reset" target="_blank" rel="noopener">Reset Microsoft password</a>
                <a class="btn btn-ghost" href="https://github.com/settings/security" target="_blank" rel="noopener" style="margin-top:.4rem">GitHub security settings</a>
                <p class="muted" style="font-size:.85rem;margin-top:.5rem">Google and email & password sign-in (with self-service reset) can be added after upgrading hosting to the Standard plan.</p>
              </div>
              <div class="set-card">
                <h3>Backend status</h3>
                <p class="muted" id="setApi">Checking API…</p>
                <p class="muted" style="font-size:.85rem">Notices, board messages, meetings, documents and the people roster are stored via the site's secure API when deployed.</p>
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </section>`
});

/* SEARCH */
pages.push({ file:"search.html", active:null, title:"Search",
  desc:"Search the Mercer County Commission website.",
  body: crumb([{label:"Home",href:"index.html"},{label:"Search"}])
  + pageHead({eyebrow:"Find it fast",title:"Search"})
  + `<section class="band"><div class="wrap">
      <form class="filterbar" role="search" onsubmit="return false">
        <input id="searchBox" type="search" placeholder="Search offices, services, notices, pages…" aria-label="Search" autofocus>
      </form>
      <div id="searchResults" class="search-results" aria-live="polite"></div>
    </div></section>`
});

/* 404 */
pages.push({ file:"404.html", active:null, title:"Page not found",
  desc:"The page you requested could not be found.",
  body: `<section class="band narrow"><div class="wrap center reveal" style="padding:3em 0">
      <img class="seal-img big" src="img/mcc/seal-white.png" alt="" width="80" height="80" style="margin:0 auto 1em">
      <h1>Page not found</h1>
      <p class="lead" style="margin:0 auto 1.4em">We couldn't find that page. It may have moved. Try a search or head back home.</p>
      <div class="hero-ctas" style="justify-content:center"><a class="btn btn-navy" href="index.html">Home</a> <a class="btn btn-ghost" href="search.html">Search</a> <a class="btn btn-ghost" href="contact.html">Contact</a></div>
    </div></section>`
});

/* ---------- detail pages (mirror of official county content) ---------- */
const contactCard = c => {
  if(!c) return "";
  const rows = [];
  if(c.phone)   rows.push(`<p><strong>${icon("headset","tb-ic")} Phone</strong><br><a href="tel:${esc(c.phone.replace(/[^+\d]/g,""))}">${esc(c.phone)}</a></p>`);
  if(c.email)   rows.push(`<p><strong>${icon("document","tb-ic")} Email</strong><br><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>`);
  if(c.address) rows.push(`<p><strong>${icon("home","tb-ic")} Address</strong><br>${esc(c.address)}</p>`);
  if(c.hours)   rows.push(`<p><strong>${icon("calendar","tb-ic")} Hours</strong><br>${esc(c.hours)}</p>`);
  if(c.meets)   rows.push(`<p><strong>${icon("calendar","tb-ic")} Meets</strong><br>${esc(c.meets)}</p>`);
  if(c.admission) rows.push(`<p><strong>${icon("ticket","tb-ic")} Admission</strong><br>${esc(c.admission)}</p>`);
  if(c.website) rows.push(`<p><strong>${icon("globe","tb-ic")} Website</strong><br><a href="${esc(c.website)}" target="_blank" rel="noopener">${esc(c.website.replace(/^https?:\/\//,"").replace(/\/$/,""))} ↗</a></p>`);
  return rows.length ? `<div class="infocard reveal"><h3 class="ic-h">Contact</h3>${rows.join("")}</div>` : "";
};
const peopleCard = (people, heading="Members") => {
  if(!people || !people.length) return "";
  return `<div class="infocard reveal"><h3 class="ic-h">${esc(heading)}</h3><ul class="person-list">${
    people.map(p=>`<li><strong>${esc(p.name)}</strong>${p.title?`<span>${esc(p.title)}</span>`:""}</li>`).join("")
  }</ul></div>`;
};
const renderDetail = e => {
  const meta = SECTION_META[e.section];
  const ic = e.section==="offices" ? iconById(e.slug) : iconByName(e.name);
  const hasBody = e.body && e.body.length;
  const main = hasBody
    ? e.body.map(p=>`<p>${esc(p)}</p>`).join("")
    : `<p class="lead">${esc(e.blurb||"")}</p><p class="muted">Full details for this ${e.section==="ordinances"?"ordinance":"office"} are maintained on the official Mercer County website.</p>`;
  const adopted = e.adopted ? `<p class="detail-adopted"><strong>Adopted:</strong> ${esc(e.adopted)}</p>` : "";
  const peopleHeading = e.section==="offices" ? "Officials" : e.section==="boards" ? "Board members" : "Contacts";
  return crumb([{label:"Home",href:"index.html"},{label:meta.label,href:meta.index},{label:e.name}])
    + pageHead({eyebrow:meta.eyebrow, title:e.name, sub:hasBody?e.blurb:""})
    + `<section class="band"><div class="wrap detail-layout">
        <div class="detail-main prose reveal"><span class="detail-badge" aria-hidden="true">${ic}</span>${main}${adopted}</div>
        <aside class="detail-aside">
          ${contactCard(e.contact)}
          ${peopleCard(e.people, peopleHeading)}
          <div class="infocard reveal">
            ${e.canonical?`<a class="btn btn-ghost" href="${esc(e.canonical)}" target="_blank" rel="noopener">View on official county site ↗</a>`:""}
            <a class="btn btn-navy" href="${meta.index}">← Back to ${esc(meta.label)}</a>
          </div>
        </aside>
      </div></section>`;
};
for(const e of detailEntities){
  const meta = SECTION_META[e.section];
  pages.push({
    file: detailFile(e.section, e.slug),
    active: meta.index,
    title: e.name,
    desc: e.blurb || `${e.name} — ${D.county.name}.`,
    body: renderDetail(e)
  });
}

/* ---------- Ordinances index ---------- */
{
  const ords = bySection.ordinances.filter(o=>o.slug && o.slug!=="ordinances")
    .sort((a,b)=>a.name.localeCompare(b.name));
  pages.push({ file:"ordinances.html", active:null, title:"Ordinances",
    desc:"Mercer County ordinances and regulatory orders adopted by the County Commission — dilapidated buildings, fireworks, floodplain, litter, noise, animal control and more.",
    body: crumb([{label:"Home",href:"index.html"},{label:"Government",href:"government.html"},{label:"Ordinances"}])
    + pageHead({eyebrow:"County code",title:"Ordinances & County Code",sub:"Regulatory orders and ordinances adopted by the Mercer County Commission. Where these summaries differ from the official record, the adopted ordinance and applicable law control."})
    + `<section class="band"><div class="wrap"><div class="card-grid">${
        ords.map(o=>{
          const f = detailFile("ordinances", o.slug);
          return `<a class="minicard minicard-link reveal" href="${f}"><span class="mc-icon">${iconByName(o.name)}</span><h3>${esc(o.name)}</h3><p>${esc(o.blurb||"")}</p>${o.adopted?`<span class="mc-tag">Adopted ${esc(o.adopted)}</span>`:""}<span class="mc-more">Read summary →</span></a>`;
        }).join("")
      }</div>
      <p class="muted center" style="margin-top:1.6em">Full ordinance text is available from the <a href="https://mercercountywv.com/ordinances/" target="_blank" rel="noopener">official county ordinances page ↗</a> and the County Clerk.</p>
      </div></section>`
  });
}

/* ---------- Documents / Bids / Careers / Parks section pages ---------- */
const officialSectionPage = (file, sec, {eyebrow, title, sub, extra=""}) => {
  const e = bySection[sec][0] || {};
  pages.push({ file, active:null, title,
    desc: e.blurb || sub,
    body: crumb([{label:"Home",href:"index.html"},{label:"Government",href:"government.html"},{label:title}])
    + pageHead({eyebrow, title, sub})
    + `<section class="band"><div class="wrap prose reveal" style="max-width:56rem">
        ${(e.body&&e.body.length?e.body:[e.blurb||sub]).map(p=>`<p>${esc(p)}</p>`).join("")}
        ${extra}
        ${e.canonical?`<p style="margin-top:1.6em"><a class="btn btn-navy" href="${esc(e.canonical)}" target="_blank" rel="noopener">Open on the official county site ↗</a></p>`:""}
      </div></section>`
  });
};
officialSectionPage("documents.html","documents",{ eyebrow:"Public records", title:"Documents, Budgets & Plans",
  sub:"County levies, budgets and comprehensive plans published for public review." });
officialSectionPage("bids.html","bids",{ eyebrow:"Procurement", title:"Bids & Proposals",
  sub:"Current bids, RFPs, RFQs and invitations to bid for businesses working with Mercer County.",
  extra:`<p>Formal invitations to bid and requests for proposals are also advertised as <a href="notices.html">public notices</a>. Sealed bids are opened at public commission meetings.</p>` });
officialSectionPage("careers.html","careers",{ eyebrow:"Work with us", title:"Careers & Employment",
  sub:"Mercer County is an equal-opportunity employer offering competitive benefits and a supportive work environment.",
  extra:`<p>Current openings and application instructions are posted with the County Clerk and on our <a href="notices.html">public notices</a> page.</p>` });
officialSectionPage("parks.html","parks",{ eyebrow:"Recreation", title:"Parks & Recreation",
  sub:"WV State Parks, county parks and city parks in and around Mercer County — trails, lakes, shelters and family activities.",
  extra:`<p>Explore <a href="agencies-glenwood.html">Glenwood Recreational Park</a>, plan a trip with <a href="${D.county.visitUrl}" target="_blank" rel="noopener">Visit Mercer County ↗</a>, or ride the <a href="agencies-hatfield-mccoy-trails.html">Hatfield-McCoy Trails</a>.</p>` });

/* ---------- HTML Site Map ---------- */
{
  const sec = (h, links) => `<div class="sitemap-col reveal"><h2>${esc(h)}</h2><ul>${
    links.map(l=>`<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("")}</ul></div>`;
  const detailLinks = s => detailEntities.filter(e=>e.section===s)
    .sort((a,b)=>a.name.localeCompare(b.name))
    .map(e=>({href:detailFile(e.section,e.slug), label:e.name}));
  pages.push({ file:"site-map.html", active:null, title:"Site Map",
    desc:"A complete map of every page on the official Mercer County Commission website.",
    body: crumb([{label:"Home",href:"index.html"},{label:"Site Map"}])
    + pageHead({eyebrow:"Navigation",title:"Site Map",sub:"Every page on the Mercer County Commission website, in one place."})
    + `<section class="band"><div class="wrap sitemap-grid">
        ${sec("Government", [
          {href:"government.html",label:"The Commission"},
          {href:"meetings.html",label:"Meetings & Minutes"},
          {href:"notices.html",label:"Public Notices"},
          {href:"ordinances.html",label:"Ordinances"},
          {href:"documents.html",label:"Documents & Budgets"},
          {href:"bids.html",label:"Bids & Proposals"},
          {href:"careers.html",label:"Careers"}
        ])}
        ${sec("Elected Offices & Courts", detailLinks("offices"))}
        ${sec("Departments & Agencies", detailLinks("agencies"))}
        ${sec("Boards & Authorities", detailLinks("boards"))}
        ${sec("Ordinances", detailLinks("ordinances"))}
        ${sec("Services & Info", [
          {href:"news.html",label:"News & Press"},
          {href:"animal-shelter.html",label:"Animal Shelter & Adoption"},
          {href:"parks.html",label:"Parks & Recreation"},
          {href:"emergency.html",label:"Emergency Info"},
          {href:"resources.html",label:"Resources"},
          {href:"contact.html",label:"Contact & Directory"},
          {href:"search.html",label:"Search"},
          {href:"portal.html",label:"Board Portal"},
          {href:"about.html",label:"About the County"}
        ])}
      </div></section>`
  });
}

/* ---------- write core pages ---------- */
let count=0;
for(const p of pages){ writeFileSync(join(OUT,p.file), page(p), "utf8"); count++; }

/* ---------- policy pages ---------- */
mkdirSync(join(OUT,"policies"),{recursive:true});
const policyBody = {
 "accessibility":`<p>The ${D.county.name} is committed to ensuring digital accessibility for people of all abilities. We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> and Section 508 of the Rehabilitation Act.</p>
  <h2>Measures we take</h2><ul class="checklist"><li>Semantic HTML, landmarks and skip-to-content links</li><li>Keyboard-operable navigation and visible focus states</li><li>Sufficient color contrast in light and dark themes</li><li>Text alternatives for meaningful images</li><li>Respect for reduced-motion preferences</li><li>Captions/records for published meeting video where available</li></ul>
  <h2>Need help or found a barrier?</h2><p>If you encounter an accessibility barrier or need information in an alternate format, contact us at <a href="tel:${D.county.phoneRaw}">${D.county.phone}</a> or through our <a href="contact.html">contact page</a>, and we will work promptly to provide the information you need.</p>`,
 "content-disclaimer":`<p>Information on this website is provided as a public service by the ${D.county.name}. While we strive for accuracy and timeliness, the county makes no warranty, express or implied, regarding the completeness, accuracy, or currency of any information.</p>
  <h2>Official records govern</h2><p>Where information here conflicts with official county records, ordinances, or applicable law, the <strong>official record and law control</strong>. Meeting dates, notices and agendas are subject to change; always verify time-sensitive matters directly with the relevant office.</p>
  <h2>No legal advice</h2><p>Nothing on this site constitutes legal advice. Consult a qualified attorney for guidance on your specific situation.</p>`,
 "legal-notices":`<h2>Copyright</h2><p>Unless otherwise noted, content on this website is © ${new Date().getFullYear()} ${D.county.name}. County seals, logos and marks may not be used without permission.</p>
  <h2>Use of the site</h2><p>By using this website you agree to use it lawfully and not to interfere with its operation or security. The county may modify or discontinue any part of the site without notice.</p>
  <h2>Limitation of liability</h2><p>The county is not liable for any damages arising from the use of, or inability to use, this website or any linked resource.</p>
  <h2>Public records</h2><p>Records requests are governed by the West Virginia Freedom of Information Act (WV Code §29B-1). See our <a href="contact.html#foia">Records / FOIA</a> information.</p>`,
 "link-policy":`<h2>Links from this site</h2><p>This website may link to external sites operated by other agencies, organizations or businesses. These links are provided for convenience and information only. A link does <strong>not</strong> constitute an endorsement by the county, and the county is not responsible for the content, accuracy, privacy practices or availability of external sites.</p>
  <h2>Linking to us</h2><p>You are welcome to link to pages on this website. We ask that you do not frame our content or imply county endorsement of your site. Please link to live, current pages rather than copying content.</p>`,
 "privacy-policy":`<p>The ${D.county.name} respects your privacy. This policy explains what information we collect and how we use it.</p>
  <h2>Information we collect</h2><ul class="checklist"><li><strong>Information you provide</strong> — e.g., when you use a contact form or submit a request.</li><li><strong>Automatic technical data</strong> — standard server logs and privacy-respecting usage metrics to keep the site secure and improve service.</li></ul>
  <h2>How we use it</h2><p>We use information solely to respond to you, operate and secure the website, and meet legal obligations. We do <strong>not</strong> sell personal information.</p>
  <h2>Cookies &amp; storage</h2><p>This site uses <strong>no advertising or third-party tracking cookies</strong>. We use minimal local storage on your device for functional preferences only — for example, to remember your light/dark theme choice and which alert you have dismissed. These are not shared with anyone.</p>
  <p>Sign-in for the board portal is optional and used only by authorized commissioners and staff. Authentication is handled by trusted identity providers — <strong>Microsoft (Entra ID), Google, email &amp; password, or GitHub</strong> — which set a secure session cookie that is strictly necessary to keep you signed in. Password changes and resets are managed by your chosen provider.</p>
  <h2>Public records notice</h2><p>Communications with a government agency may be subject to disclosure under the WV Freedom of Information Act.</p>
  <h2>Contact</h2><p>Questions about privacy? <a href="contact.html">Contact us</a> or call <a href="tel:${D.county.phoneRaw}">${D.county.phone}</a>.</p>`,
 "security-policy":`<p>The ${D.county.name} takes the security of its website and residents' information seriously.</p>
  <h2>How we protect the site</h2><ul class="checklist"><li>HTTPS encryption for all traffic</li><li>Security headers (content-security, frame and transport policies)</li><li>Role-based, authenticated access for the board/admin portal</li><li>Least-privilege access to systems and data</li></ul>
  <h2>Responsible disclosure</h2><p>If you believe you have found a security vulnerability, please report it responsibly. Do not publicly disclose it or access data beyond what is necessary to demonstrate the issue. Contact us via the <a href="contact.html">contact page</a> or call <a href="tel:${D.county.phoneRaw}">${D.county.phone}</a>, and we will respond promptly.</p>
  <h2>Your part</h2><p>Protect your own accounts with strong, unique passwords and be alert to phishing. The county will never ask for your password by email.</p>`
};
for(const pol of D.policies){
  const body = crumb([{label:"Home",href:"index.html"},{label:"Legal"},{label:pol.title}])
    + pageHead({eyebrow:"Legal & Policy",title:pol.title})
    + `<section class="band"><div class="wrap prose reveal">${policyBody[pol.id]}<p class="muted upd">Last updated ${new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}.</p></div></section>`;
  writeFileSync(join(OUT,"policies",`${pol.id}.html`), page({title:pol.title,desc:pol.title+" — "+D.county.name,body,depth:1}), "utf8");
  count++;
}

console.log(`Built ${count} pages.`);

/* ---------- search index ---------- */
const idx = [];
const add = (title,url,text) => idx.push({t:title,u:url,x:text.replace(/\s+/g," ").slice(0,400)});
add("Home","index.html",`Mercer County Commission home ${D.county.tagline} meetings notices services`);
add("The Commission","government.html",`commission members ${D.commissioners.map(c=>c.name).join(" ")} meeting schedule ordinances jobs bids`);
add("Elected Offices","offices.html",D.offices.map(o=>o.name+" "+o.desc).join(" "));
add("Departments & Agencies","agencies.html",D.agencies.map(a=>a.name+" "+a.desc).join(" "));
add("Boards & Authorities","boards.html",D.boards.map(b=>b.name+" "+b.desc).join(" "));
add("Meetings & Minutes","meetings.html","meetings agenda minutes video livestream virtual public comment schedule");
add("News & Press","news.html",D.news.map(n=>n.title+" "+n.body).join(" "));
add("Public Notices","notices.html","public notices legal advertisements bids rfp hearings jobs");
add("Contact & Directory","contact.html","contact address phone hours foia records directory");
add("About the County","about.html","history norfolk western railway pocahontas coal bramwell princeton bluefield");
add("Emergency Information","emergency.html","911 emergency management alerts preparedness severe weather");
add("Resources","resources.html","resident resources quick links");
add("Board Portal","portal.html","board portal sign in commissioners staff");
D.offices.forEach(o=>add(o.name,"offices.html#"+o.id,o.desc+" "+(o.phone||"")+" "+(o.where||"")));
D.agencies.forEach(a=>add(a.name,"agencies.html#"+a.id,a.desc+" "+(a.contact||"")));
D.policies.forEach(p=>add(p.title,"policies/"+p.id+".html",p.title+" legal policy"));
// detail pages + new sections
for(const e of detailEntities){
  add(e.name, detailFile(e.section,e.slug), (e.blurb||"")+" "+((e.body||[]).join(" "))+" "+(e.contact?Object.values(e.contact).join(" "):""));
}
add("Ordinances","ordinances.html","ordinances county code fireworks floodplain litter noise dilapidated animal control spay neuter");
add("Documents & Budgets","documents.html","documents budgets levies comprehensive plans public records");
add("Bids & Proposals","bids.html","bids rfp rfq proposals procurement invitation to bid");
add("Careers","careers.html","careers jobs employment openings equal opportunity employer");
add("Parks & Recreation","parks.html","parks recreation glenwood state parks trails lakes shelters");
add("Site Map","site-map.html","site map index all pages directory");
writeFileSync(join(OUT,"search-index.json"), JSON.stringify(idx), "utf8");

/* ---------- sitemap + robots ---------- */
const base = "https://mercercountywv.com/";
const urls = [...pages.map(p=>p.file), ...D.policies.map(p=>"policies/"+p.id+".html")]
  .filter(f=>f!=="404.html");
const today = new Date().toISOString().slice(0,10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
  urls.map(u=>`  <url><loc>${base}${u==="index.html"?"":u}</loc><lastmod>${today}</lastmod></url>`).join("\n")+`\n</urlset>\n`;
writeFileSync(join(OUT,"sitemap.xml"), sitemap, "utf8");
writeFileSync(join(OUT,"robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin.html\nSitemap: ${base}sitemap.xml\n`, "utf8");
console.log(`Wrote search-index.json (${idx.length}), sitemap.xml (${urls.length}), robots.txt.`);
