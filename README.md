# ArcTerra Expeditions — web build

Archipel X and Terra Y: an expedition project for those who seek the unknown.

Static site for ARC | TERRA XY: ARCX (ocean) and TERRA Y (land), with Polar Crossings by TERRA Y for polar voyages. Every page is self-contained HTML with its own `img/` and `data/` folders; d3 loads from cdnjs and fonts from Google Fonts. No build step: Vercel serves the folders as they are.

## Deploy (about 2 minutes)

1. The repo is `jpapagno-ux/ArcTerraExpeditions` (done).
2. In this folder:
   ```
   git init && git add . && git commit -m "ArcTerra Expeditions: first web build"
   git branch -M main
   git remote add origin https://github.com/jpapagno-ux/ArcTerraExpeditions.git
   git push -u origin main
   ```
3. In Vercel, under the James Papagno Projects team, choose Add New → Project and import the repo. Framework preset: **Other**; leave the build command empty; set the output directory to `./`. Every push to `main` then deploys automatically.
4. Add the domain (e.g. `arcterra.travel`) under Project → Domains, then update the URLs in `sitemap.xml`, `robots.txt` and `llms.txt` if the domain differs.

## Pages

| URL | Page | Source build |
|---|---|---|
| `/` | ARC \| TERRA XY home: two paths | home |
| `/journeys/banda-nutmeg-and-fire/` | ARCX · Nutmeg & Fire | spice |
| `/journeys/komodo-dragons-and-corals/` | ARCX · Dragons & Corals | komodo |
| `/journeys/banda-dive-blue-hours/` | ARCX Dive · Blue Hours | dive |
| `/journeys/surf-the-long-left/` | ARCX Surf · The Long Left | surf |
| `/journeys/tibet-everest-thin-air/` | TERRA Y · Thin Air | thin air |
| `/journeys/katavi-mahale-mara-the-crossing/` | TERRA Y · The Crossing | the crossing |
| `/journeys/antarctica-fly-cruise/` | Polar Crossings · Classic Antarctica Air-Cruise (loads Cloudinary images) | a21 |
| `/journeys/south-georgia-spring-charter-2027/` | Polar Crossings by TERRA Y · South Georgia in Spring | sg |
| `/eclipse-expeditions/` | SYZYGY eclipse globe (Egypt 2027, Komodo 2028) | eclipse |
| `/eclipse-expeditions/egypt-and-amazon/` | SYZYGY solar journeys | solar2 |

Next pages to build from the wireframes: `/ocean-expeditions/` and `/land-expeditions/` hubs, `/destinations/` and region pages, `/departures/`, `/enquire/`, `/about/`, `/faq/`.

## Before launch
- Each journey page has an internal "Marketing director's report" block marked REMOVE BEFORE LAUNCH.
- South Georgia photography comes from the Phototeva brochure: confirm usage rights.
- The Crossing uses stand-in example images (marked on the page): replace with real photography, keeping the file names.

## Page inventory (checked 19 Oct 2026)

Every journey page opens on its live, animated route map at the top of the page. All maps run from files in this repo (d3 is self-hosted in `/vendor/`, so no outside script can break them).

| URL | Opens on |
|---|---|
| `/` | Live split hero: Nutmeg & Fire (ARCX) beside Thin Air (TERRA Y), then a 10-card grid of animated route previews |
| `/journeys/` | All journeys by Ocean, Land, Polar, Eclipse; every card plays its route preview (`/img/maps/*.webp`) |
| `/journeys/banda-nutmeg-and-fire/` | Animated map |
| `/journeys/komodo-dragons-and-corals/` | Animated map |
| `/journeys/banda-dive-blue-hours/` | Animated map |
| `/journeys/surf-the-long-left/` | Animated map |
| `/journeys/tibet-everest-thin-air/` | Animated map |
| `/journeys/katavi-mahale-mara-the-crossing/` | Animated map |
| `/journeys/antarctica-fly-cruise/` | Animated map (Polar Crossings) |
| `/journeys/south-georgia-spring-charter-2027/` | Animated map (Polar Crossings) |
| `/eclipse-expeditions/` | Animated eclipse chart |
| `/eclipse-expeditions/egypt-and-amazon/` | Animated eclipse chart |
| `/enquire/` | Enquiry form (replace the mailto placeholder before launch) |

`sitemap.xml` lists all of these, with each journey's map preview as its image. `llms.txt` lists every journey for AI answer engines. Old `/arcx/...` and `/terra-y/...` links redirect to the new journey URLs (`vercel.json`).


## Airtable connection (prices, departures, destinations, vessels, crew, team, journal, media)

The site is built by `scripts/build.mjs` on every Vercel deploy and published from `dist/`. It reads the
**ArcTerra Expeditions Library** base in Airtable. Without a key it uses `content/airtable-snapshot.json`,
so the first deploy works before you connect anything.

**One-time setup in Vercel (Project → Settings → Environment Variables):**

| Name | Value |
|---|---|
| `AIRTABLE_TOKEN` | Airtable personal access token (airtable.com/create/tokens): scopes `data.records:read` and `data.records:write`, access to the ArcTerra Expeditions Library base only |
| `DEPLOY_HOOK_URL` | Project → Settings → Git → Deploy Hooks → create one named "Airtable", branch `main`, copy the URL |
| `REBUILD_KEY` | any long random phrase (it protects the publish link) |
| `CRON_SECRET` | any long random phrase (lets the daily rebuild call the publish link) |

**Publishing Airtable changes:** the site republishes itself every morning (09:00 UTC). To publish at once,
open `https://arcterra.travel/api/rebuild?key=YOUR_REBUILD_KEY` — or add a Button field in Airtable
("Open URL") with that link so publishing is one click from the base.

**What shows where:** Status = Live publishes a record; Draft records appear only on Vercel preview
deployments (marked DRAFT, hidden from search). Departures need "Show on site" ticked and a future start date.
Crew profiles need both "Show on site" and "Photo release signed".

**Guide emails:** the "Get the guide" form on each destination page posts to `/api/subscribe`, which adds the
subscriber in Airtable. The Airtable automation "Send destination guide to subscriber" emails the PDF as soon as
that guide has a PDF link (turn the automation on in Airtable after reviewing it).

**Local preview:** `node scripts/build.mjs` then serve `dist/` (e.g. `npx serve dist`).

## Site settings

`content/site.json` holds the contact details, social links, journal name, Seller of Travel and IATA numbers.
Change the journal name there (one line) once you choose it; the URL stays `/journal/`.

## Launch audit additions (October 2026)

- **New pages:** `/departures/` (every dated departure from Airtable with path/style/month filters; empty state lists all journeys), `/ocean-expeditions/` and `/land-expeditions/` hubs (answer box, style sections, destination rail, vessels, FAQ schema).
- **Static map pages are polished at build time** (`polishStatic()` in `scripts/build.mjs`): search titles ≤62 characters, descriptions ≤158, canonical, Open Graph/Twitter tags, the shared site nav, one-h1 heading outline, and still-poster map previews that swap to the animation on screen.
- **The internal "Marketing director's report" panels are removed from every public page at build time.** They stay in the source HTML for the web team.
- **Map performance:** mobile textures capped at 2048 px; textures decode off the main thread (`createImageBitmap`); the live card ships with its first text in the HTML (no layout shift, crawlable copy).
- **Favicons:** `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`.
