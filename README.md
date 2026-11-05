# Sicily III Restaurant & Pizza

Static website for Sicily III Restaurant & Pizza, 4460 Easton Ave, Bethlehem, PA 18020. Plain HTML, CSS and JavaScript, hosted on Vercel.

## Pages
- `/` home, `/menu` full menu, `/catering` party trays, `/our-vision`, `/visit` location and hours
- `/privacy`, `/terms`, `/accessibility`, custom `404`

## Before launch
1. Get a free access key at web3forms.com using the email that should receive signups, then paste it into `WEB3FORMS_KEY` at the top of `assets/js/site.js`. The mailing list and catering request forms use it.
2. If the site moves to a custom domain, update the canonical URLs, `sitemap.xml` and `robots.txt`.
3. Have the owner double check menu prices against the current printed menu.

## Notes
- Security headers (CSP, HSTS and friends) live in `vercel.json`.
- The Google map only loads after a visitor clicks "Show the map."
- Hours used by the live "Open now" badge are in `assets/js/site.js`.
