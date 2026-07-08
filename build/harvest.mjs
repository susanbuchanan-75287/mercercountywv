// One-pass harvester: pulls clean, factual fields from the official mercercountywv.com
// (title, meta description/blurb, phones, emails, mailing address, canonical URL) for every
// office/agency/board/ordinance/document/section page, into build/gov-data.json.
// Body prose comes from the official site's own public content; we never fabricate gov facts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://mercercountywv.com";

const SLUGS = {
  offices: ["assessor","circuit-clerk","circuit-court-judges","commissioners","county-clerk",
    "family-court-judges","magistrate-judges","prosecuting-attorney","sheriff"],
  agencies: ["911","adult-probation","airport","animal-shelter","athens","bluefield","bramwell",
    "commission","corrections","cvb","day-report","development","education","emergency","fair",
    "floodplain","glenwood","hatfield-mccoy-trails","health","juvenile-probation","litter",
    "oakvale","princeton","recycling","sheriff","wvu"],
  boards: ["911-advisory","airport-authority","bluewell-psd","board-of-health","bramwell-psd",
    "building-commission","casewv","civil-service","coal-heritage-highway-authority","cvb",
    "development-authority","dilapidated-structures-committee","fire","glenwood-park",
    "greenvalley-glenwood-psd","hatfield-trail","king-coal-highway-authority","lashmeet-psd",
    "mountain-rcd","oakvale-psd","planning-commission","public-defender-board","region-one",
    "solid-waste-authority","southern-regional-community-corrections","wv-workforce"],
  ordinances: ["dilapidated-buildings","exotic-entertainment","fireworks","floodplain","litter",
    "mental-hygiene","mercer-county-canine-control-ordinance",
    "mercer-county-spay-neuter-ordinance-6-10-2025","noise-ordinance"],
};
// Section index / standalone pages
const SECTIONS = ["ordinances","documents","bids","careers","parks","about","resources","contact","emergency-information"];

function urlFor(section, slug) {
  if (!slug) return `${BASE}/${section}/`;
  return `${BASE}/${section}/${slug}/`;
}

function decode(s) {
  return String(s || "")
    .replace(/&#8217;|&#039;|&#39;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;|&#8221;|&quot;/g, '"').replace(/&#8211;|&#8212;/g, "–")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#038;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

function extract(html) {
  const title = decode((html.match(/<title>(.*?)<\/title>/s) || [])[1] || "")
    .replace(/\s*-\s*Mercer County Commission WV\s*$/i, "");
  const blurb = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
  const ogImg = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] || "";
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || "";
  const phones = [...new Set((html.match(/\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g) || [])
    .map(p => p.trim()).filter(p => !/^\d{3}[-.]\d{3}[-.]\d{4}$/.test(p) || true))]
    .filter(p => p.replace(/\D/g, "").length === 10).slice(0, 6);
  const emails = [...new Set((html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])
    .filter(e => !/@2x|\.png|\.jpg|sentry|wixpress|example\./i.test(e)))].slice(0, 6);
  // Mailing address: "<number> <street>, <city>, WV <zip>"
  const addr = decode((html.match(/(\d{2,5}[^<,]{2,40},\s*[A-Za-z .]+,\s*WV\s*\d{5})/) || [])[1] || "");
  return { title, blurb, canonical, ogImg, phones, emails, addr };
}

async function fetchOne(section, slug) {
  const url = urlFor(section, slug);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "MercerCountyRefreshHarvester/1.0" } });
    if (!res.ok) return { section, slug: slug || "", url, ok: false, status: res.status };
    const html = await res.text();
    return { section, slug: slug || "", url, ok: true, ...extract(html) };
  } catch (e) {
    return { section, slug: slug || "", url, ok: false, error: String(e) };
  }
}

async function run() {
  const jobs = [];
  for (const [section, slugs] of Object.entries(SLUGS))
    for (const slug of slugs) jobs.push([section, slug]);
  for (const section of SECTIONS) jobs.push([section, null]);

  const out = [];
  // small concurrency to be polite
  const CONC = 6;
  for (let i = 0; i < jobs.length; i += CONC) {
    const batch = jobs.slice(i, i + CONC).map(([s, sl]) => fetchOne(s, sl));
    const res = await Promise.all(batch);
    out.push(...res);
    process.stdout.write(`  fetched ${Math.min(i + CONC, jobs.length)}/${jobs.length}\r`);
  }
  const dest = path.join(__dirname, "gov-data.json");
  fs.writeFileSync(dest, JSON.stringify(out, null, 1));
  const ok = out.filter(o => o.ok).length;
  const withBlurb = out.filter(o => o.blurb).length;
  console.log(`\nHarvested ${out.length} pages (${ok} ok, ${withBlurb} with blurb) -> ${dest}`);
  const fails = out.filter(o => !o.ok);
  if (fails.length) console.log("Failures:", fails.map(f => f.section + "/" + f.slug + " [" + (f.status || f.error) + "]").join(", "));
}
run();
