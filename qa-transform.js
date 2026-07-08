// QA round 1 site-wide transform. Idempotent — safe to re-run.
const fs = require("fs");
const path = require("path");
const root = __dirname;

const files = fs.readdirSync(root).filter(f => f.endsWith(".html"));

// Inline head bootstrap: apply saved/system theme before paint (no FOUC) + drop no-js.
const BOOT = '<script>(function(){try{document.documentElement.classList.remove("no-js");var t=localStorage.getItem("mc-theme");if(!t){t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})();</script>';

const sealSvg = '<svg class="ic gb-flag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/><path d="M4 10h16"/></svg>';
const lockSvg = '<svg class="ic gb-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const shieldSvg = '<svg class="ic gb-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>';

let report = [];
for (const f of files) {
  const p = path.join(root, f);
  let s = fs.readFileSync(p, "utf8");
  const before = s;
  const changes = [];

  // (a) font weight 800
  if (s.includes("Manrope:wght@400;500;600;700&") ) {
    s = s.replace("Manrope:wght@400;500;600;700&", "Manrope:wght@400;500;600;700;800&");
    changes.push("font800");
  }

  // no-js class on <html>
  if (/<html\b[^>]*>/.test(s) && !/class="no-js"/.test(s.match(/<html\b[^>]*>/)[0])) {
    s = s.replace(/<html(\s+)/, '<html class="no-js"$1');
    changes.push("no-js");
  }

  // (b) theme bootstrap right after <head>
  if (!s.includes('classList.remove("no-js")')) {
    s = s.replace(/<head>\s*/, "<head>\n" + BOOT + "\n");
    changes.push("theme-boot");
  }

  // (c) nav IA: add Public Notices + Emergency before Contact (only in primary menu)
  if (s.includes('<a href="news.html">News</a><a href="contact.html">Contact</a>')) {
    s = s.replace(
      '<a href="news.html">News</a><a href="contact.html">Contact</a>',
      '<a href="news.html">News</a><a href="notices.html">Public Notices</a><a href="contact.html">Contact</a><a class="nav-emg" href="emergency.html">Emergency</a>'
    );
    changes.push("nav-ia");
  }

  // (d) gov banner emoji -> SVG
  if (s.includes('<span class="gb-flag" aria-hidden="true">\uD83C\uDFDB\uFE0F</span>')) {
    s = s.replace('<span class="gb-flag" aria-hidden="true">\uD83C\uDFDB\uFE0F</span>', sealSvg);
    changes.push("banner-seal");
  }
  if (s.includes('<strong>\uD83D\uDD12 Official.</strong>')) {
    s = s.replace('<strong>\uD83D\uDD12 Official.</strong>', '<strong>' + lockSvg + ' Official.</strong>');
    changes.push("banner-lock");
  }
  if (s.includes('<strong>\uD83D\uDEE1\uFE0F Secure.</strong>')) {
    s = s.replace('<strong>\uD83D\uDEE1\uFE0F Secure.</strong>', '<strong>' + shieldSvg + ' Secure.</strong>');
    changes.push("banner-shield");
  }

  if (s !== before) {
    fs.writeFileSync(p, s, "utf8");
    report.push(f + " -> " + changes.join(", "));
  } else {
    report.push(f + " -> (no change)");
  }
}
console.log(report.join("\n"));
console.log("\nTotal files: " + files.length);
