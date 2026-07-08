const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "policies");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".html"));

const BOOT = '<script>(function(){try{document.documentElement.classList.remove("no-js");var t=localStorage.getItem("mc-theme");if(!t){t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})();</script>';
const sealSvg = '<svg class="ic gb-flag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/><path d="M4 10h16"/></svg>';
const lockSvg = '<svg class="ic gb-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const shieldSvg = '<svg class="ic gb-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>';

let report = [];
for (const f of files) {
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, "utf8");
  const before = s;
  s = s.replace("Manrope:wght@400;500;600;700&", "Manrope:wght@400;500;600;700;800&");
  const htmlTag = s.match(/<html\b[^>]*>/)[0];
  if (!/class="no-js"/.test(htmlTag)) s = s.replace(/<html(\s+)/, '<html class="no-js"$1');
  if (!s.includes('classList.remove("no-js")')) s = s.replace(/<head>\s*/, "<head>\n" + BOOT + "\n");
  s = s.replace(
    '<a href="../news.html">News</a><a href="../contact.html">Contact</a>',
    '<a href="../news.html">News</a><a href="../notices.html">Public Notices</a><a href="../contact.html">Contact</a><a class="nav-emg" href="../emergency.html">Emergency</a>'
  );
  s = s.replace('<span class="gb-flag" aria-hidden="true">\uD83C\uDFDB\uFE0F</span>', sealSvg);
  s = s.replace('<strong>\uD83D\uDD12 Official.</strong>', '<strong>' + lockSvg + ' Official.</strong>');
  s = s.replace('<strong>\uD83D\uDEE1\uFE0F Secure.</strong>', '<strong>' + shieldSvg + ' Secure.</strong>');
  if (s !== before) { fs.writeFileSync(p, s, "utf8"); report.push(f + " -> updated"); }
  else report.push(f + " -> (no change)");
}
console.log(report.join("\n") + "\nTotal: " + files.length);
