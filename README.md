# Mercer County Commission, WV — website refresh

A modern, mobile-friendly, installable **refresh of [mercercountywv.com](https://mercercountywv.com/)**
built to merge seamlessly with the [Visit Mercer County](https://susanbuchanan-75287.github.io/visit-mercer-county-wv/)
travel site — same design system (Fraunces + Manrope, mountain-dusk navy / sunrise gold / ridge
evergreen palette, light & dark themes, cinematic hero, ridge SVG, stats band).

> Design/demo refresh. Content is representative; verify all names, phone numbers, dates and
> ordinance details against official county records before publishing.

## Pages

| Page | Purpose |
|------|---------|
| `index.html` | Home — alert bar, popular services, commissioners, news & get-involved |
| `government.html` | The Commission, meetings/minutes/agendas, careers & bids, ordinances |
| `offices.html` | Elected offices directory (Assessor, Clerks, Sheriff/Tax, Prosecutor, Courts) — filterable |
| `agencies.html` | County agencies & services (911, Health, Animal Shelter, Airport, CVB…) — filterable |
| `boards.html` | Boards, authorities & commissions (PSDs, Planning, Solid Waste…) — filterable |
| `resources.html` | Forms, documents & county policies |
| `news.html` | News & public notices |
| `events.html` | Commission meeting schedule |
| `about.html` | About the county, towns & history |
| `contact.html` | Office address, hours, phone, directions & message form |
| `emergency.html` | 911 & emergency-preparedness info |

## Design system

Shared with the Visit site via `css/styles.css` (copied) plus a small government add-on block
(alert bar, utility topbar, directory rows, filter box, commissioner cards, info list, news rows).
`js/site.js` provides theme toggle, mobile menu, active-nav, scroll-reveal, a directory filter and
an origin guard.

## Mobile & app-friendly

- Responsive; `viewport-fit=cover` for notched devices.
- Installable **PWA** (`manifest.json` + maskable icons) with offline app-shell (`sw.js`).
- `theme-color` + auto light/dark with a manual toggle saved to `localStorage`.

## Before going live

1. **Verify content** — commissioner names/terms, office phone numbers (currently the main
   courthouse line `(304) 487-8306`), meeting dates and ordinance text.
2. **Wire the contact form** — `contact.html` has a demo form; connect to email / Power Automate /
   Formspree.
3. **Origin guard** — `js/site.js` `ALLOWED` includes `susanbuchanan-75287.github.io`, `localhost`,
   and `mercercountywv.com` / `www.mercercountywv.com`. Add any new host there.

## Local preview

```bash
python -m http.server 8080
# open http://localhost:8080
```

## Deploy (GitHub Pages)

Push to `main`; GitHub Pages serves the repo root (`.nojekyll` included so all assets are served).

---
© 2026 · Design refresh for the Mercer County Commission website.
