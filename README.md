# Steppe to Cape · Port atlas

Static, bilingual freight enquiry workbench. Open `index.html` (RU) or `en.html` (EN). For browser testing serve the directory over loopback: `python3 -m http.server --bind 127.0.0.1 8080`. No build, tile server, backend, booking, transaction or payment processor.

## Editing and integration

- The two HTML files contain the visible copy, native port directory and nine real georeferenced records. Keep `data-code`, longitude (`data-x`), latitude (`data-y`) and marker IDs in sync between languages. Each point denotes a port area, not a booking terminal.
- `style.css` and `site.js` are shared. Map, native list, stage strip, form and exported brief use the same selected values. The request is not transmitted. Copy and UTF-8 TXT are local. Only an explicit language-link click temporarily transfers form values via sessionStorage to the other language page; the receiving page clears the entry. No localStorage or analytics.
- The worksheet `#quote-lab` compares two user-entered quotes for one shipment. `quote-ledger.js` uses minor units, explicit scope confirmation, and a manually entered B→A FX rate; blank charges never count as zero. `quote-ui.js` handles the worked example, advance/balance and TXT export. No live rates or transmission.
- Both public professional-profile portraits, `assets/tim.webp` (AsymVest profile) and `assets/evgeny.webp`, are bundled. Profile links remain available without scripting.
- `projects@scv.mu` opens the visitor’s own mail client. This is the SCV project office, not a JV submission endpoint. There is no send button or generated mail transmission.

## Art and geography

Original vessel, soundings, mark, share image and self-hosted Onest remain from the preceding edition. Font license: `assets/Onest-LICENSE.txt`. `assets/atlas-land.svg` was derived from Natural Earth's public-domain `ne_110m_land` geometry, including the Caspian water cutout. Land and port anchors share one equirectangular projection. Label leaders do not represent routes. Overview map for reference only; not for navigation.

- Land: https://www.naturalearthdata.com/about/terms-of-use/
- Representative terminal points: SMDG Terminal Code List, https://github.com/smdg-org/Terminal-Code-List (CTSP, NUTEP, DPWJA, KCTKLF, KCT, CT2/TZDAR, BCT/MZBEW and TNP1). Coordinates are not a promise to serve those terminals.
- Aktau: representative point in the port area (approximately 43.61°N, 51.21°E); harbour diagram, §45, https://www.portaktau.kz/wp-content/uploads/2021/04/obychaev-porta-2020.pdf .
- Third-party example only: https://www.fesco.ru/ru/clients/region/intermodal-rsa-services/ . The three marked ports are not a Steppe to Cape sailing or a required itinerary.
- Founder profiles: https://mentorclub.ru/mentors/evgenij-presnyakov/ and https://asymvest.com/about .
