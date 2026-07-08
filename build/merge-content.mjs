// Merge all harvested JSON batches into a single gov-content.json.
// Reads build/harvested/*.json (each a JSON array), dedups by section+slug,
// and writes build/gov-content.json.
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "harvested");

const seen = new Map();
let files = 0, entries = 0;
for (const f of readdirSync(dir).filter(f => f.endsWith(".json")).sort()) {
  const arr = JSON.parse(readFileSync(join(dir, f), "utf8"));
  files++;
  for (const e of arr) {
    if (!e || !e.section) continue;
    const key = `${e.section}::${e.slug || ""}::${e.name || ""}`;
    // last write wins, but prefer entries that actually have body content
    const prev = seen.get(key);
    if (!prev || ((e.body && e.body.length) && !(prev.body && prev.body.length))) {
      seen.set(key, e);
    }
    entries++;
  }
}

const out = [...seen.values()].sort((a, b) =>
  (a.section + (a.slug || "")).localeCompare(b.section + (b.slug || "")));
writeFileSync(join(__dirname, "gov-content.json"), JSON.stringify(out, null, 2), "utf8");
console.log(`Merged ${files} files, ${entries} raw entries -> ${out.length} unique entities.`);
const bySec = {};
for (const e of out) bySec[e.section] = (bySec[e.section] || 0) + 1;
console.log("By section:", bySec);
