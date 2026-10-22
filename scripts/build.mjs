#!/usr/bin/env node
/* ArcTerra Expeditions · site build (run by Vercel on every deploy: `node scripts/build.mjs`, output in dist/).
 * 1. copies the static site (home, journey map pages, eclipse pages, brand, vendor) into dist/
 * 2. reads Airtable (or the snapshot) and writes: /destinations/ + one page per destination (with the
 *    "Get the guide" form), /vessels/ + vessel pages (with crew), /journeys/ (live prices), /about/,
 *    /about/founder/, /about/team/, /media/, /journal/ + posts, /privacy/, /terms/, /enquire/
 * 3. adds live departures and prices to every journey page, and rewrites sitemap.xml and llms.txt */
import fs from 'fs'; import path from 'path';
import { loadData, pick, F, e, clean, md, faqsFrom, monthRanges, money, fdate, cls, pathOf, cld, write, ld, MON, ROOT, OUT, SITE, DOMAIN, PROD, TODAY } from './lib.mjs';

const raw = await loadData();
const live = r => r.status === 'Live' || (!PROD && r.status === 'Draft');
const isDraft = r => r.status !== 'Live';
const D = (raw.Destinations || []).map(r => pick(r, F.d)).filter(live).sort((a, b) => a.name.localeCompare(b.name));
const J = (raw.Journeys || []).map(r => pick(r, F.j)).filter(r => r.status === 'Live' || (!PROD && r.status === 'Draft'));
const X = (raw.Departures || []).map(r => pick(r, F.x)).filter(r => r.show && r.start && r.start >= TODAY).sort((a, b) => a.start.localeCompare(b.start));
const V = (raw.Vessels || []).map(r => pick(r, F.v)).filter(live);
const C = (raw.Crew || []).map(r => pick(r, F.c)).filter(r => r.show && r.release);
const T = (raw.Team || []).map(r => pick(r, F.t)).filter(r => r.show).sort((a, b) => (a.order || 99) - (b.order || 99));
const G = (raw.Guides || []).map(r => pick(r, F.g));
const P = (raw.Posts || []).map(r => pick(r, F.p)).filter(r => r.slug && (r.status === 'Live' || (!PROD && r.status === 'Draft'))).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const M = (raw.Media || []).map(r => pick(r, F.m)).filter(r => r.show).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const byId = (list, id) => list.find(x => x.id === id);
const jUrl = j => (j.page || '').replace(/^https?:\/\/[^/]+/, '') || `/journeys/${j.slug}/`;
const deps = j => X.filter(x => (x.journey || []).includes(j.id));
const fromPrice = j => { const p = deps(j).map(x => x.pp).filter(Boolean); return p.length ? Math.min(...p) : 0; };
// route charts: crisp 960x600 card loops and 1600x700 hero loops (MP4), each with a sharp JPEG still
const mapImg = j => `/img/maps/${j.slug}-card.mp4`;
const poster = j => `/img/maps/${j.slug}-card.jpg`;
const heroVid = j => `/img/maps/${j.slug}-hero.mp4`;
const heroPoster = j => `/img/maps/${j.slug}-hero.jpg`;
const destJourneys = d => J.filter(j => (j.dest || []).includes(d.id));
const destVessels = d => V.filter(v => destJourneys(d).some(j => (j.vessel || []).includes(v.id)));

/* ---------- copy static site ---------- */
const SKIP = new Set(['dist', 'scripts', 'api', 'content', 'node_modules', '.git', '.vercel', 'README.md', 'package.json', 'vercel.json']);
fs.rmSync(OUT, { recursive: true, force: true });
for (const n of fs.readdirSync(ROOT)) if (!SKIP.has(n)) fs.cpSync(path.join(ROOT, n), path.join(OUT, n), { recursive: true });

/* ---------- layout ---------- */
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500;600&family=IM+Fell+English:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap">';
const brandDest = b => D.filter(d => d.brand === b);
function header(cur) {
  const jl = b => J.filter(j => j.brand === b).map(j => `<a href="${jUrl(j)}">${e(j.name)}<small>${e(j.days)} days · ${e((byId(D, (j.dest || [])[0]) || {}).name || '')}</small></a>`).join('');
  const dl = b => brandDest(b).map(d => `<a href="/destinations/${d.slug}/">${e(d.name)}</a>`).join('');
  return `<a class="skip" href="#main">Skip to content</a><header class="top"><div class="wrap bar">
<a class="logos" href="/" aria-label="ArcTerra Expeditions home"><img src="/brand/arcx/arcx-bleed.png" alt="ARCX ocean expeditions" width="800" height="443"><img src="/brand/terray/terray-bleed.png" alt="TERRA Y land voyages" width="800" height="417"></a>
<button class="burger" aria-expanded="false" aria-controls="nav">MENU</button>
<nav id="nav" aria-label="Main">
<details class="dd${cur === 'ocean' ? ' cur' : ''}"><summary>Ocean</summary><div class="panel"><p class="mh"><img src="/brand/arcx/arcx-bleed.png" alt="">Ocean · dive, surf, sail</p>
<a href="/ocean-expeditions/"><b>All ocean expeditions →</b></a><a href="/destinations/?style=Dive">Dive liveaboards</a><a href="/destinations/?style=Surf">Surf expeditions</a><a href="/destinations/?style=Sail%20%26%20explore">Sail &amp; explore</a><a href="/enquire/?style=charter">Private yacht charter</a><p class="mh">Journeys</p>${jl('ARCX')}</div></details>
<details class="dd${cur === 'land' ? ' cur' : ''}"><summary>Land</summary><div class="panel"><p class="mh"><img src="/brand/terray/terray-bleed.png" alt="">Land voyages</p>
<a href="/land-expeditions/"><b>All land expeditions →</b></a><a href="/destinations/?path=terray&amp;style=Overland">Overland</a><a href="/destinations/?style=Wildlife">Wildlife &amp; safari</a><a href="/destinations/?path=polar">Polar Crossings · Antarctica &amp; Arctic</a><a href="/eclipse-expeditions/">SYZYGY eclipses</a><p class="mh">Journeys</p>${jl('TERRA Y')}${jl('Polar Crossings')}</div></details>
<details class="dd${cur === 'dest' ? ' cur' : ''}"><summary>Destinations</summary><div class="panel mega"><div><p class="mh"><img src="/brand/arcx/arcx-bleed.png" alt="">Ocean</p>${dl('ARCX')}</div><div><p class="mh"><img src="/brand/terray/terray-bleed.png" alt="">Land &amp; polar</p>${dl('TERRA Y')}${dl('Polar Crossings')}</div>
<div><p class="mh">Explore by</p><a href="/departures/">Departures · dates &amp; prices</a><a href="/destinations/">All destinations</a><a href="/destinations/#when">When to go · month by month</a><a href="/journeys/">Every journey, charted</a><a href="/vessels/">The fleet</a></div></div></details>
<a href="/vessels/"${cur === 'vessels' ? ' aria-current="page"' : ''}>Vessels</a><a href="/journeys/"${cur === 'journeys' ? ' aria-current="page"' : ''}>Journeys</a><a href="/journal/"${cur === 'journal' ? ' aria-current="page"' : ''}>Journal</a>
<a class="m-cta" href="/enquire/">Enquire</a></nav><a class="cta" href="/enquire/">Enquire</a></div></header>`;
}
const ICON = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5H16.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>' };
function footer() {
  const so = SITE.social || {}; const soc = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['x', 'X'], ['youtube', 'YouTube']].map(([k, n]) => `<a href="${e(so[k] || '#')}" aria-label="${n}" rel="noopener me">${ICON[k]}</a>`).join('');
  return `<footer class="site"><div class="wrap">
<div class="top-row"><div class="id"><span class="lg"><img src="/brand/arcx/arcx-bleed-white.png" alt="ARCX ocean expeditions" width="800" height="443"><img src="/brand/terray/terray-bleed-white.png" alt="TERRA Y land voyages" width="800" height="417"></span>
<p>Ocean voyages and land expeditions, charted day by day.</p>
<div class="contact"><a href="tel:${e(SITE.phoneHref || SITE.phone)}">${e(SITE.phone)}</a><br><a href="mailto:${e(SITE.email)}">${e(SITE.email)}</a><br><span style="color:#C9D3DA">${e(SITE.address)}</span></div>
<div class="social">${soc}</div></div>
<div class="news"><h2 class="fh news-h">${e(SITE.newsTitle || 'Expedition news')}</h2><p>New journeys, departures and field notes from the ${e(SITE.communityName)}, four times a year.</p>
<form data-subscribe="newsletter" action="/api/subscribe" method="post" style="position:relative"><label class="vh" for="nl">Email address</label><input id="nl" name="email" type="email" placeholder="Your email" required autocomplete="email"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><input type="hidden" name="source" value="Newsletter"><input type="hidden" name="consent" value="on"><button type="submit">SIGN UP</button></form><span class="msg" role="status" aria-live="polite"></span>
<p style="font-size:12.5px">By signing up you agree to receive our emails. Unsubscribe any time. <a href="/privacy/" style="display:inline">Privacy</a></p></div></div>
<nav class="cols" aria-label="Footer"><div><h2 class="fh">Expeditions</h2><a href="/ocean-expeditions/">Ocean · ARCX</a><a href="/land-expeditions/">Land · TERRA Y</a><a href="/destinations/?path=polar">Polar Crossings</a><a href="/eclipse-expeditions/">SYZYGY eclipses</a><a href="/enquire/?style=charter">Private charter</a></div>
<div><h2 class="fh">Destinations</h4>${D.filter(d => !isDraft(d)).slice(0, 6).map(d => `<a href="/destinations/${d.slug}/">${e(d.name)}</a>`).join('')}<a href="/destinations/">All destinations</a></div>
<div><h2 class="fh">Plan</h2><a href="/journeys/">Journeys</a><a href="/departures/">Departures &amp; prices</a><a href="/vessels/">Vessels</a><a href="/destinations/#when">When to go</a><a href="/enquire/">Enquire</a></div>
<div><h2 class="fh">Company</h2><a href="/about/founder/">Founder story</a><a href="/about/team/">Team</a><a href="/advisors/">Travel advisors</a><a href="/media/">Media</a><a href="/journal/">${e(SITE.journalName)}</a></div>
<div><h2 class="fh">Legal</h2><a href="/terms/">Terms &amp; conditions</a><a href="/privacy/">Privacy policy</a><a href="/terms/#booking">Booking conditions</a></div></nav>
<div class="legalrow"><span>© ${new Date().getFullYear()} ${e(SITE.legalName)}. All rights reserved.</span><span>Florida Seller of Travel Reg. No. ${e(SITE.sellerOfTravel)}${SITE.sellerOfTravelHolder ? ` · ${e(SITE.sellerOfTravelHolder)}` : ''}</span><span>IATA ${e(SITE.iata)}</span><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></div></div></footer>
<button class="totop" aria-label="Back to top">↑</button><script src="/assets/site.js" defer></script>`;
}
function page({ path: p, title, desc, body, cur, schema = [], noindex = false, og, extraHead = '' }) {
  const url = DOMAIN + p;
  const img = og || DOMAIN + '/img/maps/banda-nutmeg-and-fire-card.jpg';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${e(title)}</title><meta name="description" content="${e(desc)}"><link rel="canonical" href="${url}">${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website"><meta property="og:site_name" content="${e(SITE.name)}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${img}"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#081A26">${FONTS}<link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/footer.css">${extraHead}${schema.map(ld).join('')}</head>
<body>${header(cur)}<main id="main" class="wrap">${body}</main>${footer()}</body></html>`;
}
const crumbs = items => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([t, u], i) => u && i < items.length - 1 ? `<a href="${u}">${e(t)}</a>` : `<span aria-current="page">${e(t)}</span>`).join(' / ')}</nav>`;
const crumbLd = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([t, u], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: DOMAIN + (u || '') })) });
const faqLd = qs => qs.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qs.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) }] : [];
const faqHtml = qs => qs.map(x => `<details class="q"><summary>${e(x.q)}</summary><p>${e(x.a)}</p></details>`).join('');
const draftBadge = r => isDraft(r) ? '<span class="draft">DRAFT · preview only</span>' : '';
function jCard(j) {
  const c = cls(j.brand), d = byId(D, (j.dest || [])[0]), fp = fromPrice(j), nx = deps(j)[0];
  return `<a class="card ${c}" href="${jUrl(j)}" data-dest="${e(j.slug)}"><span class="m ${c}"><img src="${poster(j)}" data-anim="${mapImg(j)}" alt="Animated route chart: ${e(j.name)}" loading="lazy" decoding="async" width="960" height="600"><span class="tag ${c}">${e(j.brand)} · ${e(j.code || '')}</span><span class="live">● LIVE CHART</span></span>
<span class="b"><h3>${e(j.name)}</h3><span class="muted" style="font-size:13.5px">${e(d ? d.name : '')} · ${e(j.days)} days</span><p>${e(j.summary)}</p>
<span class="price">${fp ? `From <b>${money(fp)}</b> pp` : 'Dates and prices on request'}${nx ? ` · next ${fdate(nx.start)}` : ''}</span><span class="go">Open the chart →</span></span></a>`;
}
function dCard(d) {
  const c = cls(d.brand), j = destJourneys(d)[0];
  const img = d.hero ? `<img src="${cld(d.hero, 720)}" alt="${e(d.name)}" loading="lazy" decoding="async">` : j ? `<img src="${poster(j)}" data-anim="${mapImg(j)}" alt="Route chart in ${e(d.name)}" loading="lazy" decoding="async" width="960" height="600">` : `<img class="mark" src="${d.brand === 'ARCX' ? '/brand/arcx/arcx-bleed-white.png' : '/brand/terray/terray-bleed-white.png'}" alt="">`;
  return `<a class="card ${c}" href="/destinations/${d.slug}/" data-dest="${e(d.slug)}" data-path="${pathOf(d.brand)}" data-styles="${e((d.styles || []).join(' '))}" data-months="${e((d.months || []).join(' '))}"><span class="m ${c}">${img}<span class="tag ${c}">${e(d.brand)}</span></span>
<span class="b"><span class="eyebrow">${e(d.coord || d.region)}</span><h3>${e(d.name)}</h3><p>${e(d.region)}</p><span class="price"><b>Best:</b> ${e(monthRanges(d.months || []) || 'ask us')} · <b>Fly to:</b> ${e(d.gw)}</span>${draftBadge(d)}<span class="go">Destination guide →</span></span></a>`;
}
const vCard = v => { const c = cls(v.brand); return `<a class="card ${c}" href="/vessels/${v.slug}/"><span class="m ${c}">${v.hero ? `<img src="${cld(v.hero, 720)}" alt="${e(nm(v.name))}" loading="lazy">` : `<img class="mark" src="${v.brand === 'ARCX' ? '/brand/arcx/arcx-bleed-white.png' : '/brand/terray/terray-bleed-white.png'}" alt="">`}<span class="tag ${c}">${e(v.brand)}</span></span><span class="b"><span class="eyebrow">${e(v.type)}</span><h3>${e(nm(v.name))}</h3><p>${e(clean(v.summary))}</p><span class="price">${[v.guests && v.guests + ' guests', v.len && v.len + ' m', v.built && 'built ' + v.built].filter(Boolean).join(' · ')}</span>${draftBadge(v)}<span class="go">View vessel →</span></span></a>`; };
const months = (ms, c) => `<div class="months ${c}" role="img" aria-label="Best months: ${e(monthRanges(ms))}">${MON.map(m => `<i class="${ms.includes(m) ? 'on' : ''}">${m.toUpperCase()}</i>`).join('')}</div>`;

/* ---------- destinations ---------- */
function destQuick(d) {
  if (d.quick) return d.quick;
  const js = destJourneys(d), best = monthRanges(d.months || []);
  return `${best ? `The best time to visit ${d.name} is ${best}.` : `${d.name} can be visited year round.`} Fly to ${d.gw || 'the nearest gateway'}, where ${js.length ? `our ${js.map(j => j.name).join(' and ')} ${js.length > 1 ? 'journeys begin' : 'journey begins'}` : 'our team meets you'}. ${d.brand === 'ARCX' ? 'ARCX travels here by sea.' : d.brand === 'Polar Crossings' ? 'Polar Crossings by TERRA Y sails here on small expedition ships.' : 'TERRA Y travels here overland.'}`;
}
function destFaqs(d) {
  const js = destJourneys(d), vs = destVessels(d), best = monthRanges(d.months || []);
  const q = [];
  if (best) q.push({ q: `When is the best time to visit ${d.name}?`, a: `${best} is the best season for ${d.name}${d.styles && d.styles.length ? `, especially for ${d.styles.join(', ').toLowerCase()}` : ''}. Our departures are timed to these months; ask us about private dates outside them.` });
  if (d.gw) q.push({ q: `How do you get to ${d.name}?`, a: `Fly to ${d.gw}. ${js.length ? `${js[0].name} starts there and our team handles every transfer from arrival.` : 'Our team meets you on arrival and handles transfers.'}` });
  if (js.length) q.push({ q: `Which ArcTerra journeys go to ${d.name}?`, a: js.map(j => `${j.name} (${j.days} days): ${j.summary}`).join(' ') });
  if (vs.length) q.push({ q: `Which vessel do you use in ${d.name}?`, a: vs.map(v => `${clean(v.name)}, ${(v.type || '').toLowerCase()}${v.guests ? ` for up to ${v.guests} guests` : ''}`).join('; ') + '.' });
  q.push({ q: `Can we travel privately or charter the whole vessel?`, a: `Yes. Most ${d.name} journeys run as dated departures, private departures or a full-vessel charter for families, friends and companies. Tell us your dates and group size.` });
  return q;
}
function guideForm(d) {
  const g = G.find(x => (x.dest || []).includes(d.id)); const ready = g && g.status === 'Live' && g.pdf;
  return `<section class="sec" id="guide" aria-labelledby="gH"><div class="guide"><div style="display:grid;gap:10px"><span class="eyebrow">Free field guide</span><h2 id="gH">Get the ${e(d.name)} guide</h2>
<p class="muted" style="margin:0">${ready ? 'The PDF lands in your inbox in a minute: seasons, routes, what to pack and the places we love.' : 'Our field guide is being finished. Leave your email and it arrives the day it is ready.'}</p></div>
<form class="form" data-subscribe="guide" action="/api/subscribe" method="post" style="position:relative"><div class="row"><label>Email<input type="email" name="email" required autocomplete="email"></label><label>First name <span class="muted">(optional)</span><input type="text" name="name" autocomplete="given-name"></label></div>
<input type="hidden" name="destination" value="${d.id}">${g ? `<input type="hidden" name="guide" value="${g.id}">` : ''}<input type="hidden" name="source" value="Guide download"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label class="check"><input type="checkbox" name="consent" required> Email me the guide and occasional ${e(SITE.communityName)} field notes. Unsubscribe any time. <a href="/privacy/">Privacy</a></label>
<button type="submit">SEND ME THE GUIDE</button><span class="msg" role="status" aria-live="polite"></span></form></div></section>`;
}
function destPage(d) {
  const c = cls(d.brand), js = destJourneys(d), vs = destVessels(d), qs = destFaqs(d), quick = destQuick(d);
  const posts = P.filter(p => (p.dest || []).includes(d.id));
  const items = [['Home', '/'], ['Destinations', '/destinations/'], [d.name, `/destinations/${d.slug}/`]];
  const heroImg = d.hero ? `<img src="${cld(d.hero, 1600)}" alt="${e(d.name)}" style="width:100%;aspect-ratio:21/9;object-fit:cover;display:block">` : js[0] ? `<video class="mapvid" src="${heroVid(js[0])}" poster="${heroPoster(js[0])}" autoplay muted loop playsinline preload="auto" aria-label="Animated route chart: ${e(js[0].name)} in ${e(d.name)}" style="width:100%;aspect-ratio:16/7;object-fit:cover;display:block;background:#DDE6E4" width="1600" height="700"></video>` : '';
  const body = `<div class="hero">${crumbs(items)}<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="tag ${c}">${e(d.brand)}</span>${draftBadge(d)}<span class="eyebrow">${e(d.coord || '')}</span></div>
<h1>${e(d.name)}</h1><p class="lead">${e(d.region)}</p></div>
${heroImg ? `<div class="card ${c}" style="padding:0;overflow:hidden">${heroImg}</div>` : ''}
<nav class="subnav" aria-label="On this page"><a href="#overview">Overview</a><a href="#when">When to go</a>${js.length ? '<a href="#journeys">Journeys</a>' : ''}${vs.length ? '<a href="#vessels">Vessels</a>' : ''}<a href="#guide">Free guide</a>${posts.length ? '<a href="#stories">Stories</a>' : ''}<a href="#faq">Questions</a></nav>
<section class="sec" id="overview" style="border-top:0"><div class="ans ${c}"><b class="q">When to go and how to get to ${e(d.name)}</b><p>${e(quick)}</p></div>
<div class="facts"><div><span>Gateway</span><b>${e(d.gw || 'On request')}</b></div><div><span>Best months</span><b>${e(monthRanges(d.months || []) || 'Year round')}</b></div><div><span>Styles</span><b>${e((d.styles || []).join(' · '))}</b></div><div><span>Travel with</span><b>${e(d.brand)}</b></div>${d.coord ? `<div><span>Coordinates</span><b>${e(d.coord)}</b></div>` : ''}</div></section>
<section class="sec" id="when"><header><div><h2>When to go</h2><p>Highlighted months are the season we sail or travel; we can arrange private dates around them.</p></div></header>${months(d.months || [], c)}</section>
${js.length ? `<section class="sec" id="journeys"><header><div><h2>Journeys in ${e(d.name)}</h2><p>Each opens on its live, animated chart that follows the route day by day.</p></div><a class="btn-d" href="/journeys/">All journeys</a></header><div class="grid">${js.map(jCard).join('')}</div></section>` : ''}
${vs.length ? `<section class="sec" id="vessels"><header><div><h2>The vessels</h2></div><a class="btn-d" href="/vessels/">The fleet</a></header><div class="grid">${vs.map(vCard).join('')}</div></section>` : ''}
${guideForm(d)}
${posts.length ? `<section class="sec" id="stories"><header><div><h2>From ${e(SITE.journalName)}</h2></div></header><div class="grid">${posts.map(pCard).join('')}</div></section>` : ''}
<section class="sec" id="faq"><h2>Questions travellers ask</h2><div>${faqHtml(qs)}</div></section>
<div class="band"><div><h2 style="color:var(--ivory)">Plan ${e(d.name)} with us</h2><p style="margin:6px 0 0">Dated departures, private dates or the whole vessel.</p></div><a class="btn" href="/enquire/?destination=${encodeURIComponent(d.name)}">ENQUIRE</a></div>`;
  const schema = [crumbLd(items), { '@context': 'https://schema.org', '@type': 'TouristDestination', name: d.name, description: quick, url: `${DOMAIN}/destinations/${d.slug}/`,
    touristType: d.styles, includesAttraction: js.map(j => ({ '@type': 'TouristTrip', name: j.name, url: DOMAIN + jUrl(j) })) }, ...faqLd(qs)];
  write(`destinations/${d.slug}/index.html`, page({ path: `/destinations/${d.slug}/`, title: (`${d.name}: When to Go & Journeys | ${d.brand}`.length <= 62 ? `${d.name}: When to Go & Journeys | ${d.brand}` : `${d.name}: When to Go & Journeys`), desc: quick.slice(0, 158), body, cur: 'dest', schema, noindex: isDraft(d) }));
}
function destHub() {
  const styles = [...new Set(D.flatMap(d => d.styles || []))].sort();
  const groups = [['ARCX', 'Ocean · dive, surf, sail', '/brand/arcx/arcx-bleed.png'], ['TERRA Y', 'Land voyages', '/brand/terray/terray-bleed.png'], ['Polar Crossings', 'Polar Crossings by TERRA Y', '/brand/terray/terray-bleed.png']];
  const rails = groups.map(([b, t, logo]) => { const ds = brandDest(b); if (!ds.length) return ''; const id = 'rail-' + pathOf(b);
    return `<section class="sec railgroup" aria-labelledby="${id}"><header><div style="display:flex;gap:14px;align-items:center"><img src="${logo}" alt="" style="height:28px;width:auto"><h2 id="${id}">${e(t)}</h2></div><div class="railbtns"><button data-dir="prev" aria-label="Scroll back">←</button><button data-dir="next" aria-label="Scroll forward">→</button></div></header>
<div class="railwrap"><div class="rail">${ds.map(dCard).join('')}</div><div class="railbtns" hidden></div></div></section>`; }).join('');
  const matrix = `<section class="sec" id="when"><header><div><h2>When to go, month by month</h2><p>Every destination and its season at a glance.</p></div></header><div class="matrix"><table><caption class="vh">Best months by destination</caption><thead><tr><th>Destination</th>${MON.map(m => `<th>${m.toUpperCase()}</th>`).join('')}</tr></thead><tbody>
${D.map(d => `<tr class="${cls(d.brand)}"><td><a href="/destinations/${d.slug}/">${e(d.name)}</a></td>${MON.map(m => (d.months || []).includes(m) ? `<td class="on" aria-label="${m}: in season">●</td>` : `<td></td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
  const qs = [{ q: 'Where does ArcTerra Expeditions travel?', a: `ARCX sails ${brandDest('ARCX').map(d => d.name).join(', ')}. TERRA Y travels overland to ${brandDest('TERRA Y').map(d => d.name).join(', ')}. Polar Crossings sails to ${brandDest('Polar Crossings').map(d => d.name).join(', ')}.` },
    { q: 'How do I choose between an ocean and a land journey?', a: 'Choose ARCX if you want to dive, surf or island-hop by small ship. Choose TERRA Y for overland routes, wildlife and the polar regions with Polar Crossings. Many guests combine both; we can link journeys back to back.' }];
  const body = `<div class="hero">${crumbs([['Home', '/'], ['Destinations', '/destinations/']])}<h1>Where, and when</h1><p class="lead">Every place we travel, by sea or by land, with its season and the journeys that reach it.</p></div>
<div class="ans"><b class="q">Where does ArcTerra Expeditions go?</b><p>${e(qs[0].a)}</p></div>
<form id="finder" class="finder" data-unit="departure" onsubmit="return false" style="margin-top:22px"><label for="f-path">PATH<select id="f-path"><option value="all">Ocean, land and polar</option><option value="arcx">ARCX · Ocean</option><option value="terray">TERRA Y · Land</option><option value="polar">Polar Crossings</option></select></label>
<label for="f-style">STYLE<select id="f-style"><option value="all">Any style</option>${styles.map(s => `<option>${e(s)}</option>`).join('')}</select></label>
<label for="f-month">MONTH<select id="f-month"><option value="all">Any month</option>${MON.map(m => `<option>${m}</option>`).join('')}</select></label><span class="count" id="f-count" role="status" aria-live="polite"></span></form>
${rails}${matrix}<section class="sec"><h2>Questions</h2><div>${faqHtml(qs)}</div></section>`;
  write('destinations/index.html', page({ path: '/destinations/', title: 'Expedition Destinations by Ocean, Land & Month | ArcTerra', desc: 'Every ArcTerra destination by ARCX ocean, TERRA Y land and Polar Crossings, with the best months, gateway airports and the journeys that go there.', body, cur: 'dest',
    schema: [crumbLd([['Home', '/'], ['Destinations', '/destinations/']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: D.filter(d => !isDraft(d)).map((d, i) => ({ '@type': 'ListItem', position: i + 1, url: `${DOMAIN}/destinations/${d.slug}/`, name: d.name })) }, ...faqLd(qs)] }));
}

/* ---------- vessels + crew ---------- */
function vesselPage(v) {
  const c = cls(v.brand), js = J.filter(j => (j.vessel || []).includes(v.id)), crew = C.filter(x => (x.vessel || []).includes(v.id));
  const name = nm(v.name); const items = [['Home', '/'], ['Vessels', '/vessels/'], [name, `/vessels/${v.slug}/`]];
  const specs = [['Type', v.type], ['Guests', v.guests], ['Length', v.len && v.len + ' m'], ['Cabins', v.cabins], ['Built', v.built], ['Ice class', v.ice]].filter(x => x[1]);
  const answer = `${name} is ${/^[aeiou]/i.test(v.type || '') ? 'an' : 'a'} ${(v.type || 'vessel').toLowerCase()}${v.len ? ` of ${v.len} metres` : ''}${v.built ? ` built in ${v.built}` : ''}${v.guests ? `, carrying up to ${v.guests} guests` : ''}. ${js.length ? `${v.brand} uses it for ${js.map(j => j.name).join(' and ')}.` : ''} ${clean(v.summary)}`.replace(/\s+/g, ' ').trim();
  const body = `<div class="hero">${crumbs(items)}<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="tag ${c}">${e(v.brand)}</span>${draftBadge(v)}<span class="eyebrow">${e(v.type)}</span></div><h1>${e(name)}</h1></div>
${v.hero ? `<img src="${cld(v.hero, 1600)}" alt="${e(name)}" style="width:100%;aspect-ratio:21/9;object-fit:cover;display:block;border:1px solid var(--line)">` : ''}
<nav class="subnav" aria-label="On this page"><a href="#overview">Overview</a>${js.length ? '<a href="#sails">Where she sails</a>' : ''}<a href="#crew">Crew</a><a href="#charter">Charter</a></nav>
<section class="sec" id="overview" style="border-top:0"><div class="ans ${c}"><b class="q">What is ${e(name)}?</b><p>${e(answer)}</p></div>${specs.length ? `<div class="facts">${specs.map(([k, x]) => `<div><span>${k}</span><b>${e(x)}</b></div>`).join('')}</div>` : ''}</section>
${js.length ? `<section class="sec" id="sails"><h2>Where she sails</h2><div class="grid">${js.map(jCard).join('')}</div></section>` : ''}
<section class="sec" id="crew"><header><div><h2>Crew &amp; expedition team</h2><p>The people who sail ${e(name)}. Profiles appear here once each crew member has approved their photo.</p></div></header>
${crew.length ? `<div class="people">${crew.map(x => `<article class="person"><div class="ph">${x.photo ? `<img src="${cld(x.photo, 600)}" alt="${e(x.name)}" loading="lazy">` : e((x.name || '?')[0])}</div><div class="b"><h3>${e(x.name)}</h3><span class="eyebrow">${e(x.role)}</span><p>${e(x.bio)}</p>${x.lang ? `<span class="muted" style="font-size:13px">Speaks ${e(x.lang)}</span>` : ''}</div></article>`).join('')}</div>` : '<div class="empty">Crew profiles coming soon.</div>'}</section>
<div class="band" id="charter"><div><h2 style="color:var(--ivory)">Charter ${e(name)}</h2><p style="margin:6px 0 0">Take the whole vessel on our routes or yours.</p></div><a class="btn" href="/enquire/?vessel=${encodeURIComponent(name)}&amp;style=charter">PLAN A CHARTER</a></div>`;
  const schema = [crumbLd(items), { '@context': 'https://schema.org', '@type': 'Product', name, category: v.type, brand: { '@type': 'Brand', name: v.brand }, description: answer, url: `${DOMAIN}/vessels/${v.slug}/` }];
  write(`vessels/${v.slug}/index.html`, page({ path: `/vessels/${v.slug}/`, title: (`${name}: ${v.type || 'Vessel'} & Voyages | ${v.brand}`.length <= 62 ? `${name}: ${v.type || 'Vessel'} & Voyages | ${v.brand}` : `${name}: ${v.type || 'Vessel'} & Voyages`), desc: answer.slice(0, 158), body, cur: 'vessels', schema, noindex: isDraft(v) }));
}
function vesselHub() {
  const groups = [['ARCX', 'Ocean fleet · ARCX'], ['TERRA Y', 'Land & river · TERRA Y'], ['Polar Crossings', 'Polar ships · Polar Crossings']];
  const body = `<div class="hero">${crumbs([['Home', '/'], ['Vessels', '/vessels/']])}<h1>The fleet</h1><p class="lead">Phinisi, polar ships, river boats and expedition trucks: every vessel we travel on.</p></div>
<div class="ans"><b class="q">What ships and boats does ArcTerra use?</b><p>${e(V.filter(v => !isDraft(v)).map(v => `${clean(v.name)} (${(v.type || '').toLowerCase()}${v.guests ? `, ${v.guests} guests` : ''})`).join('; ') || 'Small ships and boats chosen for each region.')}.</p></div>
${groups.map(([b, t]) => { const vs = V.filter(v => v.brand === b); return vs.length ? `<section class="sec"><h2>${e(t)}</h2><div class="grid">${vs.map(vCard).join('')}</div></section>` : ''; }).join('')}
<div class="band"><div><h2 style="color:var(--ivory)">Take the whole ship</h2><p style="margin:6px 0 0">Every vessel here can be chartered for your group.</p></div><a class="btn" href="/enquire/?style=charter">PLAN A CHARTER</a></div>`;
  write('vessels/index.html', page({ path: '/vessels/', title: 'The Fleet: Phinisi, Polar Ships & Expedition Vessels', desc: 'The vessels behind every ArcTerra journey: the phinisi Dunia Baru, polar ship Magellan Explorer, surf boats, river boats and expedition 4x4s.', body, cur: 'vessels',
    schema: [crumbLd([['Home', '/'], ['Vessels', '/vessels/']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: V.filter(v => !isDraft(v)).map((v, i) => ({ '@type': 'ListItem', position: i + 1, url: `${DOMAIN}/vessels/${v.slug}/`, name: clean(v.name) })) }] }));
}

/* ---------- journeys hub (live prices) ---------- */
function journeysHub() {
  const groups = [['ARCX', 'ARCX · Ocean', 'Dive, surf and sail: small-ship voyages through remote seas.'], ['TERRA Y', 'TERRA Y · Land', 'Overland by 4x4, bush plane, rail and on foot.'], ['Polar Crossings', 'Polar Crossings by TERRA Y', 'Antarctica, South Georgia and the Arctic.'], ['SYZYGY', 'SYZYGY · Eclipses', 'Where the sea line and the land line meet on one coordinate.']];
  const ids = { ARCX: 'ocean', 'TERRA Y': 'land', 'Polar Crossings': 'polar', SYZYGY: 'eclipse' };
  const body = `<div class="hero">${crumbs([['Home', '/'], ['Journeys', '/journeys/']])}<h1>Every journey, charted</h1><p class="lead">Each one opens on its own animated chart that follows the route day by day.</p>
<div class="chips">${groups.map(([b, t]) => `<a href="#${ids[b]}">${e(t)}</a>`).join('')}</div></div>
<div class="ans"><b class="q">What journeys does ArcTerra Expeditions offer?</b><p>${e(groups.map(([b, t]) => { const js = J.filter(j => j.brand === b); return js.length ? `${t}: ${js.map(j => `${j.name} (${j.days} days)`).join(', ')}.` : ''; }).join(' '))}</p></div>
${groups.map(([b, t, s]) => { const js = J.filter(j => j.brand === b); return js.length ? `<section class="sec" id="${ids[b]}"><header><div><h2>${e(t)}</h2><p>${e(s)}</p></div></header><div class="grid">${js.map(jCard).join('')}</div></section>` : ''; }).join('')}`;
  write('journeys/index.html', page({ path: '/journeys/', title: 'All Journeys · ARCX Ocean & TERRA Y Land Expeditions', desc: 'Every ArcTerra journey with live prices and next departures: ARCX ocean voyages, TERRA Y overland expeditions, Polar Crossings and SYZYGY eclipse journeys.', body, cur: 'journeys',
    schema: [crumbLd([['Home', '/'], ['Journeys', '/journeys/']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: J.map((j, i) => ({ '@type': 'ListItem', position: i + 1, url: DOMAIN + jUrl(j), name: j.name })) }] }));
}

/* ---------- live departures inside each journey map page ---------- */
const ST = { Open: '', 'Few left': 'few', Waitlist: 'wait', 'Sold out': 'sold', 'Charter hold': 'hold' };
function injectDepartures() {
  let n = 0;
  for (const j of J) {
    const f = path.join(OUT, jUrl(j).replace(/^\//, ''), 'index.html'); if (!fs.existsSync(f)) continue;
    let s = fs.readFileSync(f, 'utf8'); const ds = deps(j);
    const rows = ds.map(x => `<tr><td>${fdate(x.start)}${x.end ? ' – ' + fdate(x.end) : ''}</td><td>${money(x.pp) || '—'}</td><td>${money(x.single) || '—'}</td><td>${money(x.charter) || '—'}</td><td>${x.left ?? '—'}</td><td><span class="st ${ST[x.status] || ''}">${e(x.status || 'Open')}</span></td><td><a href="/enquire/?journey=${encodeURIComponent(j.name)}&amp;date=${x.start}">Ask about this date</a></td></tr>`).join('');
    const block = `<div id="live-departures" class="deps-wrap"><link rel="stylesheet" href="/assets/site.css" media="print" onload="this.media='all'"><h3 style="margin:22px 0 0;font-family:Archivo,sans-serif;font-stretch:125%;text-transform:uppercase">Upcoming departures</h3>${ds.length ? `<div class="deps"><table><thead><tr><th>Dates</th><th>Per person</th><th>Single supplement</th><th>Full charter</th><th>Cabins left</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><p style="font-size:13px;color:#4F4A44">Prices in USD, updated ${fdate(TODAY)}.</p>` : `<p>New dates are being set. <a href="/enquire/?journey=${encodeURIComponent(j.name)}">Ask us for dates and prices</a>, or plan a private departure.</p>`}</div>`;
    s = s.replace(/<div id="live-departures"[\s\S]*?<\/div><\/div>|<div id="live-departures"[\s\S]*?<\/p><\/div>/, '');
    const m = s.match(/<section[^>]*id="prices"[^>]*>/);
    if (m) { const end = s.indexOf('</section>', m.index); s = s.slice(0, end) + block + s.slice(end); }
    if (ds.length) {
      const offers = ds.map(x => ({ '@type': 'Offer', price: x.pp, priceCurrency: 'USD', availability: x.status === 'Sold out' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock', validFrom: TODAY, url: DOMAIN + jUrl(j) + '#prices', availabilityStarts: x.start }));
      s = s.replace('</head>', ld({ '@context': 'https://schema.org', '@type': 'TouristTrip', name: j.name, description: j.summary, url: DOMAIN + jUrl(j), offers }) + '</head>');
      const fp = fromPrice(j); s = s.replace(/(<aside class="bookbar"[\s\S]*?<span class="bb-badge">[^<]*<\/span>)/, `$1<span class="bb-price" style="font:500 12px 'IBM Plex Mono',monospace;margin:0 10px">From ${money(fp)} pp</span>`);
    }
    fs.writeFileSync(f, s); n++;
  }
  return n;
}

/* ---------- about, founder, team ---------- */
function aboutPages() {
  const founder = T.find(t => t.founder) || T[0];
  const story = founder ? md(founder.story || founder.bio || '') : { html: '', toc: [] };
  const fItems = [['Home', '/'], ['About', '/about/'], ['Founder story', '/about/founder/']];
  const fBody = `<div class="hero">${crumbs(fItems)}<span class="eyebrow">Founder &amp; Chief Expedition Officer</span><h1>${e(founder ? founder.name : 'Founder')}</h1><p class="lead">${e(founder ? founder.bio : '')}</p></div>
<div class="article"><article class="prose">${founder && founder.photo ? `<img src="${cld(founder.photo, 1200)}" alt="${e(founder.name)}" style="width:100%;margin-bottom:22px">` : ''}${story.html}</article>
<aside class="toc"><b>ON THIS PAGE</b>${story.toc.map(([id, t]) => `<a href="#${id}">${e(t)}</a>`).join('')}<a class="btn-d" style="margin-top:14px;color:#fff" href="/enquire/">PLAN WITH JAMES</a></aside></div>
${P.filter(p => (p.author || []).includes(founder && founder.id)).length ? `<section class="sec"><h2>Writing</h2><div class="grid">${P.filter(p => (p.author || []).includes(founder.id)).map(pCard).join('')}</div></section>` : ''}`;
  const person = founder ? { '@context': 'https://schema.org', '@type': 'Person', name: founder.name, jobTitle: founder.title, worksFor: { '@type': 'Organization', name: SITE.name, url: DOMAIN }, description: founder.bio, knowsAbout: (founder.exp || '').split(/,\s*|\s*&\s*/) } : null;
  write('about/founder/index.html', page({ path: '/about/founder/', title: `${founder ? founder.name : 'Founder'}: Founder Story | ArcTerra Expeditions`, desc: (founder ? founder.bio : '').slice(0, 158), body: fBody, cur: '', schema: [crumbLd(fItems), ...(person ? [person] : [])] }));

  const tItems = [['Home', '/'], ['About', '/about/'], ['Team', '/about/team/']];
  const tBody = `<div class="hero">${crumbs(tItems)}<h1>The team</h1><p class="lead">The people who design, guide and run every ArcTerra journey.</p></div>
<h2 class="vh">Team members</h2><div class="people">${T.map(t => `<article class="person"><div class="ph">${t.photo ? `<img src="${cld(t.photo, 600)}" alt="${e(t.name)}" loading="lazy">` : e((t.name || '?').split(' ').map(x => x[0]).join(''))}</div><div class="b"><h3>${e(t.name)}</h3><span class="eyebrow">${e(t.title)}</span><p>${e(t.bio)}</p>${t.exp ? `<span class="muted" style="font-size:13px">${e(t.exp)}</span>` : ''}${t.founder ? '<a class="go" href="/about/founder/" style="font:500 12px var(--mono);color:var(--teal)">Read the founder story →</a>' : ''}</div></article>`).join('')}</div>
<section class="sec"><h2>Crew by vessel</h2><p class="muted" style="margin:0">Our crews and expedition guides are introduced on each vessel page.</p><div class="chips">${V.filter(v => !isDraft(v)).map(v => `<a href="/vessels/${v.slug}/#crew">${e(clean(v.name))}</a>`).join('')}</div></section>`;
  write('about/team/index.html', page({ path: '/about/team/', title: 'Our Team & Expedition Crew | ArcTerra Expeditions', desc: 'Meet the ArcTerra team: the founder, expedition designers and the crews who sail and guide our ocean and land journeys.', body: tBody, cur: '',
    schema: [crumbLd(tItems), { '@context': 'https://schema.org', '@type': 'Organization', name: SITE.name, legalName: SITE.legalName, url: DOMAIN, email: SITE.email, telephone: SITE.phoneHref, address: { '@type': 'PostalAddress', addressLocality: SITE.addressLocality, addressRegion: SITE.addressRegion, addressCountry: SITE.addressCountry }, parentOrganization: { '@type': 'Organization', name: SITE.parentCompany }, logo: DOMAIN + '/brand/arcx/arcx-bleed.png', founder: founder ? { '@type': 'Person', name: founder.name } : undefined, member: T.map(t => ({ '@type': 'Person', name: t.name, jobTitle: t.title })) }] }));

  const aItems = [['Home', '/'], ['About', '/about/']];
  const aBody = `<div class="hero">${crumbs(aItems)}<h1>About ArcTerra</h1><p class="lead">Two worlds, one ledger: ARCX by sea, TERRA Y by land, every journey charted day by day.</p></div>
<h2 class="vh">About ArcTerra</h2><div class="grid"><a class="card" href="/about/founder/"><span class="b"><span class="eyebrow">Since 1983</span><h3>Founder story</h3><p>${e(founder ? founder.bio : '')}</p><span class="go">Read →</span></span></a>
<a class="card t" href="/about/team/"><span class="b"><span class="eyebrow">People</span><h3>Team &amp; crew</h3><p>Expedition designers, guides and the crews of each vessel.</p><span class="go">Meet them →</span></span></a>
<a class="card p" href="/media/"><span class="b"><span class="eyebrow">Press</span><h3>Media</h3><p>Press coverage, interviews, podcasts and our press kit.</p><span class="go">View →</span></span></a></div>`;
  write('about/index.html', page({ path: '/about/', title: 'About ArcTerra Expeditions · ARCX & TERRA Y', desc: 'ArcTerra Expeditions brings ocean voyages (ARCX) and land expeditions (TERRA Y) under one ledger, founded by James Papagno.', body: aBody, cur: '', schema: [crumbLd(aItems)] }));
}

/* ---------- media ---------- */
function mediaPage() {
  const items = [['Home', '/'], ['About', '/about/'], ['Media', '/media/']];
  const body = `<div class="hero">${crumbs(items)}<h1>Media</h1><p class="lead">Press, interviews, podcasts and awards, plus everything you need to write about us.</p></div>
${M.length ? `<div class="grid">${M.map(x => `<a class="card" href="${e(x.link || '#')}" rel="noopener"><span class="b"><span class="eyebrow">${e(x.type)} · ${e(fdate(x.date))}</span>${x.logo ? `<img src="${cld(x.logo, 240)}" alt="${e(x.outlet)}" style="height:28px;width:auto">` : `<b>${e(x.outlet)}</b>`}<h3>${e(x.title)}</h3><span class="go">Read →</span></span></a>`).join('')}</div>` : '<div class="empty">Coverage will appear here. Journalists and producers: see the press kit below.</div>'}
<section class="sec"><h2>Press kit</h2><div class="grid"><div class="card"><span class="b"><h3>Logos</h3><p>ARCX and TERRA Y, colour and white, transparent PNG.</p><span class="chips"><a href="/brand/arcx/arcx-bleed.png" download>ARCX colour</a><a href="/brand/arcx/arcx-bleed-white.png" download>ARCX white</a><a href="/brand/terray/terray-bleed.png" download>TERRA Y colour</a><a href="/brand/terray/terray-bleed-white.png" download>TERRA Y white</a></span></span></div>
<div class="card t"><span class="b"><h3>Fact sheet</h3><p>${e(SITE.name)}: ARCX ocean voyages and TERRA Y land expeditions, founded by James Papagno, designing journeys since 1983. ${J.length} journeys across ${D.filter(d => !isDraft(d)).length} destinations.</p></span></div>
<div class="card p"><span class="b"><h3>Press contact</h3><p><a href="mailto:${e(SITE.email)}">${e(SITE.email)}</a><br>${e(SITE.phone)}</p></span></div></div></section>`;
  write('media/index.html', page({ path: '/media/', title: 'Media & Press Kit | ArcTerra Expeditions', desc: 'ArcTerra Expeditions press coverage, interviews and podcasts, with logos, a fact sheet and press contact.', body, cur: '', schema: [crumbLd(items)] }));
}

/* ---------- journal ---------- */
function pImg(p) { if (p.cover) return cld(p.cover, 800); const d = byId(D, (p.dest || [])[0]); const j = d && destJourneys(d)[0]; return j ? poster(j) : ''; }
function pCard(p) {
  const d = byId(D, (p.dest || [])[0]), c = d ? cls(d.brand) : '';
  return `<a class="card ${c}" href="/journal/${p.slug}/"><span class="m ${c}">${pImg(p) ? `<img src="${pImg(p)}" alt="" loading="lazy" decoding="async">` : ''}<span class="tag ${c}">${e(d ? d.brand : SITE.journalName)}</span></span><span class="b"><span class="eyebrow">${e(d ? d.name : '')}${p.date ? ' · ' + fdate(p.date) : ''}</span><h3>${e(p.title)}</h3><p>${e(p.excerpt)}</p>${draftBadge(p)}<span class="go">Read →</span></span></a>`;
}
function journal() {
  const items = [['Home', '/'], [SITE.journalName, '/journal/']];
  const body = `<div class="hero">${crumbs(items)}<span class="eyebrow">The journal of ARC | TERRA XY</span><h1>${e(SITE.journalName)}</h1><p class="lead">${e(SITE.journalTagline)}</p>
<div class="chips"><a href="#ocean">Ocean</a><a href="#land">Land &amp; polar</a><a href="/destinations/">Destinations</a></div></div>
${P.length ? `<section class="sec" style="border-top:0"><h2 class="vh">Latest stories</h2><div class="grid">${P.map(pCard).join('')}</div></section>` : '<div class="empty">The first dispatches are on their way. Join the ' + e(SITE.communityName) + ' below to get them first.</div>'}`;
  write('journal/index.html', page({ path: '/journal/', title: `${SITE.journalName}: Expedition Field Notes`, desc: SITE.journalTagline, body, cur: 'journal',
    schema: [crumbLd(items), { '@context': 'https://schema.org', '@type': 'Blog', name: SITE.journalName, url: DOMAIN + '/journal/', publisher: { '@type': 'Organization', name: SITE.name }, blogPost: P.filter(p => !isDraft(p)).map(p => ({ '@type': 'BlogPosting', headline: p.title, url: `${DOMAIN}/journal/${p.slug}/` })) }] }));
  for (const p of P) {
    const a = byId(T, (p.author || [])[0]) || T.find(t => t.founder); const d = byId(D, (p.dest || [])[0]);
    const { html, toc } = md(p.body, { glance: true }); const qs = faqsFrom(p.body);
    const js = (p.dest || []).flatMap(id => destJourneys(byId(D, id) || { id: '' })).filter((j, i, s) => s.indexOf(j) === i);
    const pItems = [['Home', '/'], [SITE.journalName, '/journal/'], [p.title, `/journal/${p.slug}/`]];
    const body = `<div class="progress" aria-hidden="true"></div><div class="hero">${crumbs(pItems)}<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${d ? `<a class="tag ${cls(d.brand)}" href="/destinations/${d.slug}/" style="text-decoration:none">${e(d.name)}</a>` : ''}${draftBadge(p)}<span class="eyebrow">${e(a ? a.name : SITE.name)}${p.date ? ' · ' + fdate(p.date) : ''} · ${Math.max(1, Math.round(String(p.body || '').split(/\s+/).length / 220))} min read</span></div>
<h1 style="font-size:clamp(32px,5vw,54px)">${e(p.title)}</h1><p class="lead">${e(p.excerpt)}</p></div>
${pImg(p) ? `<img src="${pImg(p)}" alt="" style="width:100%;aspect-ratio:16/7;object-fit:cover;display:block;border:1px solid var(--line);margin-bottom:28px">` : ''}
<div class="article"><article class="prose">${html}
${a ? `<div class="author"><div class="av">${e((a.name || '').split(' ').map(x => x[0]).join(''))}</div><div><b>${e(a.name)}</b><br><span class="muted" style="font-size:14px">${e(a.title)} · <a href="/about/founder/">About</a></span></div></div>` : ''}</article>
<aside class="toc"><b>IN THIS STORY</b>${toc.map(([id, t]) => `<a href="#${id}">${e(t)}</a>`).join('')}${js.length ? `<b style="margin-top:16px">FOLLOW THE CHART</b>${js.map(j => `<a href="${jUrl(j)}">${e(j.name)} →</a>`).join('')}` : ''}</aside></div>
${js.length ? `<section class="sec"><h2>Journeys in this story</h2><div class="grid">${js.map(jCard).join('')}</div></section>` : ''}`;
    const schema = [crumbLd(pItems), { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.meta || p.excerpt, datePublished: p.date || undefined, dateModified: TODAY, author: a ? { '@type': 'Person', name: a.name, url: DOMAIN + '/about/founder/' } : undefined, publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: DOMAIN + '/brand/arcx/arcx-bleed.png' } }, mainEntityOfPage: `${DOMAIN}/journal/${p.slug}/`, image: pImg(p) ? (pImg(p).startsWith('http') ? pImg(p) : DOMAIN + pImg(p)) : undefined, about: d ? { '@type': 'TouristDestination', name: d.name } : undefined }, ...faqLd(qs)];
    write(`journal/${p.slug}/index.html`, page({ path: `/journal/${p.slug}/`, title: p.seoT || p.title, desc: (p.meta || p.excerpt || '').slice(0, 158), body, cur: 'journal', schema, noindex: isDraft(p), og: pImg(p) && (pImg(p).startsWith('http') ? pImg(p) : DOMAIN + pImg(p)) }));
  }
}

/* ---------- legal (drafts for attorney review) ---------- */
function legal() {
  const L = SITE.legalName, E = SITE.email;
  const privacy = `<h2>Who we are</h2><p>${e(SITE.name)} (“ArcTerra”, “we”) is a brand of ${e(L)}, ${e(SITE.address)}, part of ${e(SITE.parentCompany)}. Florida Seller of Travel Reg. No. ${e(SITE.sellerOfTravel)} (${e(SITE.sellerOfTravelHolder)}). IATA ${e(SITE.iata)}. Contact: <a href="mailto:${e(E)}">${e(E)}</a>.</p>
<h2>What we collect</h2><ul><li><b>Enquiries and bookings:</b> your name, contact details, travel dates, party size, preferences and anything you tell us about your trip.</li><li><b>Guides and newsletter:</b> your email, first name (optional), the guide you asked for and your consent to receive email.</li><li><b>Traveller details for booked journeys:</b> passport, dietary, medical and emergency-contact information you choose to give us so suppliers can deliver your trip.</li><li><b>Website usage:</b> anonymous, cookie-free page statistics.</li></ul>
<h2>How we use it</h2><ul><li>To answer enquiries, plan and book journeys, and send documents.</li><li>To send the guides and field notes you asked for. Every email has an unsubscribe link.</li><li>To meet legal, tax and Seller of Travel record-keeping duties.</li></ul><p>We never sell your personal information.</p>
<h2>Who we share it with</h2><p>Only the providers needed to run your journey and this website: vessel operators, camps, airlines and ground handlers for booked trips; and service providers that host or process data for us (Vercel for hosting, Airtable for our records, Cloudinary for images, our email provider). Each processes data on our instructions.</p>
<h2>International travel</h2><p>Our journeys involve suppliers outside the United States, so details needed for your booking are transferred to the countries you visit.</p>
<h2>How long we keep it</h2><p>Enquiry data for up to three years after our last contact; booking records as long as the law requires; subscriber data until you unsubscribe.</p>
<h2>Your choices and rights</h2><p>You can ask to see, correct, download or delete your information, or opt out of email at any time, by writing to <a href="mailto:${e(E)}">${e(E)}</a>. Residents of California, the EU and the UK have additional rights under the CCPA/CPRA and GDPR, which we honour.</p>
<h2>Children</h2><p>This site is not directed to children under 13 and we do not knowingly collect their information online.</p>
<h2>Changes</h2><p>We will post any changes here with a new date.</p>`;
  const terms = `<h2>About these terms</h2><p>These terms cover use of this website and summarise how bookings with ${e(L)} work. The specific terms for each journey, including those of the vessel operator or ground supplier, are sent with your quote and form part of your contract.</p>
<h2 id="booking">Bookings and payment</h2><ul><li>A booking is confirmed when we receive your signed booking form and deposit [DEPOSIT %/AMOUNT].</li><li>The balance is due [NUMBER] days before departure; bookings made inside that window are paid in full.</li><li>Prices are in USD per person unless stated and may change until your booking is confirmed.</li></ul>
<h2>Cancellations and changes</h2><ul><li>If you cancel, the charges in your journey's terms apply, reflecting supplier costs. [INSERT SCALE, e.g. 90+ days: deposit; 89–60 days: 50%; under 60 days: 100%.]</li><li>Expeditions depend on weather, sea and ice. Routes and landings may change for safety; this is not a cancellation.</li><li>If we or a supplier must cancel, you may choose an alternative or a refund of monies paid to us.</li></ul>
<h2>Travel insurance and health</h2><p>Comprehensive travel insurance including emergency evacuation is required for all journeys. You must tell us of any medical condition that may affect your participation, especially for polar, diving and high-altitude journeys.</p>
<h2>Documents</h2><p>You are responsible for passports, visas, permits and vaccinations. We will advise but cannot guarantee entry requirements.</p>
<h2>Our role and liability</h2><p>[State whether ArcTerra acts as agent for the operators named in your quote or as tour operator.] Our liability is limited as set out in your journey terms and as permitted by law.</p>
<h2>Florida Seller of Travel</h2><p>ArcTerra journeys are sold under the Florida Seller of Travel registration of ${e(SITE.sellerOfTravelHolder)}, Registration No. ${e(SITE.sellerOfTravel)}, which operates the ${e(SITE.name)} brand of ${e(L)}.</p>
<h2>Website use</h2><p>Content on this site, including maps, text and images, belongs to ArcTerra or its licensors and may not be reused without permission. Information is provided in good faith and may change.</p>
<h2>Governing law</h2><p>These terms are governed by the laws of the State of Florida.</p>`;
  for (const [slug, title, desc, html] of [['privacy', 'Privacy Policy', 'How ArcTerra Expeditions collects, uses and protects your information.', privacy], ['terms', 'Terms & Booking Conditions', 'Website terms and booking conditions for ArcTerra Expeditions journeys.', terms]]) {
    const items = [['Home', '/'], [title, `/${slug}/`]];
    write(`${slug}/index.html`, page({ path: `/${slug}/`, title: `${title} | ArcTerra Expeditions`, desc, cur: '', schema: [crumbLd(items)],
      body: `<div class="hero">${crumbs(items)}<h1>${e(title)}</h1><p class="muted">Last updated ${fdate(TODAY)}</p></div><!-- DRAFT: have your attorney review and complete the bracketed items before launch --><div class="legal">${html}</div>` }));
  }
}

/* ---------- enquire (prefilled from links) ---------- */
function enquire() {
  const items = [['Home', '/'], ['Enquire', '/enquire/']];
  const body = `<div class="hero">${crumbs(items)}<h1>Plan your expedition</h1><p class="lead">Tell us where you are drawn. James or an expedition designer replies personally.</p></div>
<h2 class="vh">Enquiry form</h2><form class="form" action="mailto:${e(SITE.email)}" method="post" enctype="text/plain" id="enq"><div class="row"><label>Path<select name="path"><option>ARCX · Ocean (dive, surf, sail)</option><option>TERRA Y · Land voyages</option><option>Polar Crossings</option><option>Not sure yet</option></select></label>
<label>Journey<select name="journey"><option>Something custom</option>${J.map(j => `<option>${e(j.name)}</option>`).join('')}</select></label></div>
<div class="row"><label>Travel style<select name="style"><option value="dated">Join a dated departure</option><option value="private">Private departure</option><option value="charter">Full-vessel charter</option></select></label><label>When<input type="text" name="when" placeholder="Month and year, or a departure date"></label></div>
<div class="row"><label>Name<input type="text" name="name" autocomplete="name" required></label><label>Email<input type="email" name="email" autocomplete="email" required></label></div>
<label>Tell us about the trip you imagine<textarea name="notes" rows="5"></textarea></label><button type="submit">SEND ENQUIRY</button></form>
<script>(function(){var q=new URLSearchParams(location.search),f=document.getElementById('enq');if(q.get('journey')){var s=f.journey;for(var i=0;i<s.options.length;i++)if(s.options[i].text===q.get('journey'))s.selectedIndex=i}if(q.get('style'))f.style.value=q.get('style');var w=[q.get('date'),q.get('destination'),q.get('vessel')].filter(Boolean).join(' · ');if(w)f.when.value=w})();</script>`;
  write('enquire/index.html', page({ path: '/enquire/', title: 'Enquire · Plan an ARCX or TERRA Y Expedition', desc: 'Tell us where and when. An ArcTerra expedition designer replies with dates, cabins and a route.', body, cur: '', schema: [crumbLd(items)] }));
}


/* ---------- travel advisors (trade) ---------- */
function advisors() {
  const items = [['Home', '/'], ['Travel advisors', '/advisors/']];
  const qs = [{ q: 'Do you pay commission to travel advisors?', a: 'Yes. ArcTerra pays commission on ARCX, TERRA Y and Polar Crossings journeys booked by registered advisors, including full-vessel charters. Rates and terms are in the advisor agreement we send when you register.' },
    { q: 'Will you contact my clients directly?', a: 'No. Your clients stay yours. We work through you for quotes, documents and changes, and only contact travellers directly during the journey for safety and logistics.' },
    { q: 'Can I embed your animated maps in my proposals?', a: 'Yes. Every journey has a live, animated chart page you can link or show on screen, plus short animated previews you can use in emails and presentations.' }];
  const body = `<div class="hero">${crumbs(items)}<span class="eyebrow">For travel advisors</span><h1>Sell the edge of the map</h1><p class="lead">Small-ship ocean voyages and land expeditions your clients will talk about for years, with the planning, maps and support to sell them.</p></div>
<div class="ans"><b class="q">How do travel advisors work with ArcTerra?</b><p>Register once, then quote any ArcTerra journey or charter for your clients. We provide the itineraries, animated route charts, field guides and imagery, handle operations on the ground, and pay commission on confirmed bookings. Your clients remain your clients.</p></div>
<section class="sec"><div class="grid">
<h2 class="vh">Why advisors sell ArcTerra</h2><div class="card"><span class="b"><span class="eyebrow">01</span><h3>Commission</h3><p>${e(SITE.advisorCommission)} on every confirmed booking, set by journey and departure dates, including private departures and full-vessel charters. Full terms on request.</p></span></div>
<div class="card t"><span class="b"><span class="eyebrow">02</span><h3>Protected clients</h3><p>We work through you from enquiry to homecoming. No direct marketing to your travellers.</p></span></div>
<div class="card p"><span class="b"><span class="eyebrow">03</span><h3>Selling tools</h3><p>Animated route charts, day-by-day itineraries, field guide PDFs, logos and imagery for proposals.</p></span></div>
<div class="card"><span class="b"><span class="eyebrow">04</span><h3>Direct line to James</h3><p>Questions about a route, vessel or camp go straight to the founder and our expedition designers.</p></span></div></div></section>
<section class="sec"><header><div><h2>What you can sell</h2><p>Every journey opens on its own animated chart. Share the link in your proposal.</p></div><a class="btn-d" href="/journeys/">All journeys</a></header><div class="railwrap"><div class="rail">${J.map(jCard).join('')}</div></div></section>
<section class="sec"><h2>Resources</h2><div class="chips"><a href="/media/">Logos &amp; press kit</a><a href="/destinations/">Destination guides</a><a href="/vessels/">Vessel fact sheets</a><a href="/terms/#booking">Booking conditions</a></div></section>
<section class="sec" id="register"><div class="guide"><div style="display:grid;gap:10px"><h2>Register as an advisor</h2><p class="muted" style="margin:0">We reply within one business day with the advisor agreement and current rates. Or call ${e(SITE.phone)}.</p></div>
<form class="form" data-subscribe="advisor" action="/api/subscribe" method="post" style="position:relative"><div class="row"><label>Name<input type="text" name="name" required autocomplete="name"></label><label>Agency<input type="text" name="agency" required autocomplete="organization"></label></div>
<div class="row"><label>Email<input type="email" name="email" required autocomplete="email"></label><label>IATA / CLIA / TIDS no. <span class="muted">(optional)</span><input type="text" name="iata"></label></div>
<input type="hidden" name="source" value="Advisor"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label class="check"><input type="checkbox" name="consent" required> Send me advisor updates, new departures and agent rates. <a href="/privacy/">Privacy</a></label><button type="submit">REGISTER</button><span class="msg" role="status" aria-live="polite"></span></form></div></section>
<section class="sec"><h2>Advisor questions</h2><div>${faqHtml(qs)}</div></section>`;
  write('advisors/index.html', page({ path: '/advisors/', title: 'For Travel Advisors · Commission & Selling Tools | ArcTerra', desc: 'Travel advisors: sell ArcTerra ocean voyages and land expeditions with commission, protected clients, animated route charts and field guides.', body, cur: '', schema: [crumbLd(items), ...faqLd(qs)] }));
}

/* ---------- the shared footer on the static pages (home, journey maps, eclipse) ---------- */
function staticFooters() {
  let n = 0; const walk = d => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name);
    if (f.isDirectory()) { if (!['brand', 'vendor', 'img', 'data', 'assets'].includes(f.name)) walk(p); continue; }
    if (f.name !== 'index.html') continue; let s = fs.readFileSync(p, 'utf8'); if (s.includes('/assets/site.css')) continue;
    if (/<footer[\s\S]*?<\/footer>/.test(s)) s = s.replace(/<footer[\s\S]*?<\/footer>/, footer().replace('<script src="/assets/site.js" defer></script>', '')); else s = s.replace('</body>', footer().replace('<script src="/assets/site.js" defer></script>', '') + '</body>');
    s = s.replace('<footer class="site">', '<link rel="stylesheet" href="/assets/footer.css"><footer class="site">');
    s = s.includes('</body>') ? s.replace('</body>', '<script src="/assets/site.js" defer></script></body>') : s + '<script src="/assets/site.js" defer></script>';
    fs.writeFileSync(p, s); n++; } };
  walk(OUT); return n;
}


/* ---------- departures ledger (wireframe 06) ---------- */
function departures() {
  const items = [['Home', '/'], ['Departures', '/departures/']];
  const rows = X.map(x => { const j = byId(J, (x.journey || [])[0]); if (!j) return ''; const c = cls(j.brand); const m = MON[new Date(x.start + 'T12:00:00Z').getUTCMonth()];
    return `<tr data-dest="${e(j.slug)}" data-path="${pathOf(j.brand)}" data-styles="${e((j.style || []).join(' '))}" data-months="${m}"><td><a href="${jUrl(j)}"><b>${e(j.name)}</b></a><br><span class="tag ${c}">${e(j.brand)}</span></td><td>${fdate(x.start)}${x.end ? '<br><span class="muted">to ' + fdate(x.end) + '</span>' : ''}</td><td>${e(j.days)} days</td><td>${money(x.pp) || '—'}</td><td>${x.left ?? '—'}</td><td><span class="st ${ST[x.status] || ''}">${e(x.status || 'Open')}</span></td><td><a class="btn-d" href="/enquire/?journey=${encodeURIComponent(j.name)}&amp;date=${x.start}">Ask</a></td></tr>`; }).join('');
  const styles = [...new Set(J.flatMap(j => j.style || []))].sort();
  const body = `<div class="hero">${crumbs(items)}<h1>Departures</h1><p class="lead">Every dated departure, its price and the cabins left, updated from our ledger.</p></div>
<div class="ans"><b class="q">When are the next ArcTerra departures?</b><p>${X.length ? e(X.slice(0, 3).map(x => { const j = byId(J, (x.journey || [])[0]); return j ? `${j.name} on ${fdate(x.start)}${x.pp ? ` from ${money(x.pp)} per person` : ''}` : ''; }).filter(Boolean).join('; ')) + '. Every journey can also run as a private departure or full-vessel charter on dates you choose.' : 'New dates are being set for the coming seasons. Every journey can run as a private departure or a full-vessel charter on dates you choose; ask us and we will hold space.'}</p></div>
${X.length ? `<form id="finder" class="finder" data-unit="departure" onsubmit="return false" style="margin-top:22px"><label for="f-path">PATH<select id="f-path"><option value="all">All</option><option value="arcx">ARCX · Ocean</option><option value="terray">TERRA Y · Land</option><option value="polar">Polar Crossings</option></select></label><label for="f-style">STYLE<select id="f-style"><option value="all">Any style</option>${styles.map(s => `<option>${e(s)}</option>`).join('')}</select></label><label for="f-month">MONTH<select id="f-month"><option value="all">Any month</option>${MON.map(m => `<option>${m}</option>`).join('')}</select></label><span class="count" id="f-count" role="status" aria-live="polite"></span></form>
<div class="deps" style="margin-top:18px"><table><caption class="vh">Upcoming departures</caption><thead><tr><th>Journey</th><th>Dates</th><th>Length</th><th>Per person</th><th>Cabins left</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>` : `<section class="sec" style="border-top:0"><h2>Journeys open for dates</h2><div class="grid">${J.map(jCard).join('')}</div></section>`}
<div class="band" style="margin-top:28px"><div><h2 style="color:var(--ivory)">Your dates, your group</h2><p style="margin:6px 0 0">Private departures and full-vessel charters run on the dates you choose.</p></div><a class="btn" href="/enquire/?style=private">PLAN PRIVATE DATES</a></div>`;
  const schema = [crumbLd(items), ...(X.length ? [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: X.map((x, i) => { const j = byId(J, (x.journey || [])[0]); return j ? { '@type': 'ListItem', position: i + 1, item: { '@type': 'TouristTrip', name: `${j.name} · ${fdate(x.start)}`, url: DOMAIN + jUrl(j), offers: x.pp ? { '@type': 'Offer', price: x.pp, priceCurrency: 'USD', availabilityStarts: x.start } : undefined } } : null; }).filter(Boolean) }] : [])];
  write('departures/index.html', page({ path: '/departures/', title: 'Departures: Dates, Prices & Cabins Left | ArcTerra', desc: 'Every dated ArcTerra departure with prices per person and cabins left: ARCX ocean voyages, TERRA Y land expeditions and Polar Crossings.', body, cur: 'journeys', schema }));
}

/* ---------- ocean + land hubs (wireframes 03, 04) ---------- */
function hubs() {
  const H = [
    { slug: 'ocean-expeditions', brand: ['ARCX'], logo: '/brand/arcx/arcx-bleed.png', c: '', title: 'Ocean Expeditions: Dive, Surf & Sail by Small Ship', h1: 'Ocean expeditions', lead: 'Small-ship voyages to the world’s archipelagos, timed to swell, visibility and migration.',
      q: 'What is an ARCX ocean expedition?', styles: [['Dive', 'Dive liveaboards', 'Guided dives from a small ship, with time on remote walls and pinnacles.'], ['Surf', 'Surf expeditions', 'Boat-based surf trips that follow the swell between uncrowded breaks.'], ['Sail & explore', 'Sail & explore', 'Island voyages by phinisi: villages, volcanoes, reefs and history.']] },
    { slug: 'land-expeditions', brand: ['TERRA Y', 'Polar Crossings', 'SYZYGY'], logo: '/brand/terray/terray-bleed.png', c: 't', title: 'Land Expeditions: Overland, Safari, Polar & Eclipse Journeys', h1: 'Land expeditions', lead: 'By 4x4, bush plane, rail, river and expedition ship: TERRA Y and Polar Crossings.',
      q: 'What is a TERRA Y land expedition?', styles: [['Overland', 'Overland', 'Long routes by expedition 4x4 and rail, paced for altitude and light.'], ['Wildlife', 'Wildlife & safari', 'Walking, flying and driving in the great wildlife regions.'], ['Polar', 'Polar Crossings', 'Antarctica, South Georgia and the Arctic aboard small expedition ships.'], ['Eclipse', 'SYZYGY eclipses', 'Journeys built around totality and the great eclipses of 2027 and 2028.']] }];
  for (const h of H) {
    const js = J.filter(j => h.brand.includes(j.brand)), ds = D.filter(d => h.brand.includes(d.brand)), vs = V.filter(v => h.brand.includes(v.brand));
    const answer = h.slug === 'ocean-expeditions' ? `An ARCX ocean expedition is a multi-day voyage aboard a small vessel, such as the phinisi Dunia Baru, moving between remote islands, reefs and surf breaks rather than ports. Current voyages: ${js.map(j => `${j.name} (${j.days} days)`).join(', ')}.`
      : `A TERRA Y land expedition travels overland and by air, river or small ship to wild places, from Tibet and East Africa to Antarctica with Polar Crossings. Current journeys: ${js.map(j => `${j.name} (${j.days} days)`).join(', ')}.`;
    const items = [['Home', '/'], [h.h1, `/${h.slug}/`]];
    const qs = [{ q: h.q, a: answer }, { q: 'Can we book privately or charter the whole vessel?', a: 'Yes. Every journey runs as a dated departure, a private departure on your dates, or a full-vessel charter for families, friends and companies.' },
      { q: 'How fit do I need to be?', a: h.slug === 'ocean-expeditions' ? 'Comfortable on boats and in the water. Divers need a certification suited to the journey; surf trips suit intermediate surfers and up, and non-surfing partners are welcome.' : 'Good general health and the ability to walk on uneven ground. High-altitude and polar journeys need a doctor’s check; there is no technical climbing.' }];
    const body = `<div class="hero">${crumbs(items)}<img src="${h.logo}" alt="" style="height:44px;width:auto" width="600" height="332"><h1>${e(h.h1)}</h1><p class="lead">${e(h.lead)}</p>
<div class="chips">${h.styles.map(([s, t]) => `<a href="#${s.toLowerCase().replace(/[^a-z]+/g, '-')}">${e(t)}</a>`).join('')}<a href="#destinations">Destinations</a></div></div>
<div class="ans ${h.c}"><b class="q">${e(h.q)}</b><p>${e(answer)}</p></div>
${h.styles.map(([s, t, d]) => { const sj = js.filter(j => (j.style || []).includes(s)); return sj.length ? `<section class="sec" id="${s.toLowerCase().replace(/[^a-z]+/g, '-')}"><header><div><h2>${e(t)}</h2><p>${e(d)}</p></div><a class="btn-d" href="/destinations/?style=${encodeURIComponent(s)}">Where to go</a></header><div class="grid">${sj.map(jCard).join('')}</div></section>` : ''; }).join('')}
<section class="sec" id="destinations"><header><div><h2>Destinations</h2></div><div class="railbtns"><button data-dir="prev" aria-label="Scroll back">←</button><button data-dir="next" aria-label="Scroll forward">→</button></div></header><div class="railwrap"><div class="rail">${ds.map(dCard).join('')}</div></div></section>
${vs.length ? `<section class="sec"><h2>The vessels</h2><div class="grid">${vs.map(vCard).join('')}</div></section>` : ''}
<section class="sec"><h2>Questions</h2><div>${faqHtml(qs)}</div></section>`;
    write(`${h.slug}/index.html`, page({ path: `/${h.slug}/`, title: h.title, desc: answer.slice(0, 157).replace(/\s\S*$/, '') + '.', body, cur: h.slug === 'ocean-expeditions' ? 'ocean' : 'land',
      schema: [crumbLd(items), { '@context': 'https://schema.org', '@type': 'ItemList', name: h.h1, itemListElement: js.map((j, i) => ({ '@type': 'ListItem', position: i + 1, url: DOMAIN + jUrl(j), name: j.name })) }, ...faqLd(qs)] }));
  }
}


const nm = s => clean(s) || String(s ?? '').replace(/[\[\]]/g, '').trim();
// visible content gaps on the hand-built map pages: never show a raw [PLACEHOLDER] to a traveller
function fillGaps(s) {
  const mail = `<a href="mailto:${e(SITE.email)}">${e(SITE.email)}</a>`;
  const inJs = t => t.replace(/ · \[HOTEL\]/g, ' · hotel on request').replace(/\s*\[(ARUSHA HOTEL|CONFIRM[A-Z ]*|TBC)\]/g, '').replace(/\[PRICE\]/g, 'on request').replace(/\[DATE\] — \[DATE\]/g, 'dates on request').replace(/\[MIN\]/g, 'a small group of');
  return s.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/).map((part, i) => i % 2 ? (part.startsWith('<script') ? inJs(part) : part) : part
    .replace(/\[ENQUIRY EMAIL\]/g, mail)
    .replace(/\[DATE\] — \[DATE\] (\d{4})/g, 'Dates on request · $1')
    .replace(/\[DEPOSIT\] · \[DATE\]/g, 'Confirmed with your quote')
    .replace(/\[PRICE\]/g, 'On request')
    .replace(/(guaranteed at|GUARANTEED AT) \[MIN\] (guests|GUESTS)/gi, m => /[A-Z]{4}/.test(m) ? 'SMALL-GROUP DEPARTURE' : 'Small-group departure')
    .replace(/\[(LENGTH|CABINS)\]\s*<span class="ph-tag">CONFIRM<\/span>/g, 'On request')
    .replace(/\s*\[(HOTEL|ARUSHA HOTEL)\]/g, m => m.includes('ARUSHA') ? '' : ' hotel on request')
    .replace(/\s*\[(CONFIRM[A-Z ]*|TBC)\]/g, '')
    .replace(/\[DOMAIN\]/g, DOMAIN)).join('');
}
/* ---------- polish the static map pages: titles, descriptions, canonical, social tags, nav, previews ---------- */
const KIND = j => (j.style || []).includes('Dive') ? 'Dive Liveaboard' : (j.style || []).includes('Surf') ? 'Surf Expedition' : (j.style || []).includes('Eclipse') ? 'Eclipse Journey' : (j.style || []).includes('Polar') ? 'Polar Voyage' : (j.style || []).includes('Wildlife') ? 'Safari' : j.brand === 'ARCX' ? 'Phinisi Voyage' : 'Expedition';
function trimDesc(s) { s = s.replace(/\s+/g, ' ').trim(); if (s.length <= 158) return s; const cut = s.slice(0, 158); const dot = cut.lastIndexOf('. '); return dot > 90 ? cut.slice(0, dot + 1) : cut.replace(/[\s,;:–-]+\S*$/, '') + '…'; }
function headTags(s, url, title, desc, img) {
  s = s.replace(/<title>[\s\S]*?<\/title>/, `<title>${e(title)}</title>`);
  if (/<meta name="description"[^>]*>/.test(s)) s = s.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${e(desc)}">`);
  const add = []; if (!/rel="icon"/.test(s)) add.push('<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'); if (!/rel="canonical"/.test(s)) add.push(`<link rel="canonical" href="${url}">`);
  s = s.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  if (!/property="og:image"/.test(s)) add.push(`<meta property="og:type" content="website"><meta property="og:site_name" content="${e(SITE.name)}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${img}"><meta name="twitter:card" content="summary_large_image">`);
  s = s.replace(/content="https:\/\/\[DOMAIN\]/g, `content="${DOMAIN}`).replace(/href="https:\/\/\[DOMAIN\]/g, `href="${DOMAIN}`).replace(/https:\/\/\[DOMAIN\]/g, DOMAIN);
  return s.replace(/<title>/, add.join('') + '<title>');
}
const NAV_STATIC = '<nav aria-label="Site"><a href="/destinations/">Destinations</a><a href="/journeys/">Journeys</a><a href="/departures/">Departures</a><a href="/vessels/">Vessels</a><a href="/journal/">Journal</a><a class="sb-enq" href="#enquire">Enquire</a></nav>';
const CLS_FIX = '<style id="cls-fix">#globeHero .card.live img.L.on{content-visibility:visible}</style>';
// remove the internal SEO/AEO planning panel ("remove before launch") from public pages
function stripInternal(s) { for (let guard = 0; guard < 20; guard++) { const i = s.search(/REMOVE BEFORE LAUNCH|Marketing director's report/i); if (i < 0) break;
  const cand = ['section', 'details'].map(t => [t, s.lastIndexOf('<' + t, i)]).sort((x, y) => y[1] - x[1])[0]; const [t, st] = cand; if (st < 0) break;
  const re = new RegExp('<\\/?' + t + '\\b', 'g'); re.lastIndex = st; let d = 0, k = -1, m; while ((m = re.exec(s))) { d += m[0][1] === '/' ? -1 : 1; if (!d) { k = s.indexOf('>', m.index) + 1; break; } } if (k < 0) break; s = s.slice(0, st) + s.slice(k); } return s; }
// one h1, then h2 sections, h3 sub-heads: shift the static page outline up one level (footer untouched)
function outline(s) { const f = s.indexOf('<footer class="site">'); let a = f > -1 ? s.slice(0, f) : s; const z = f > -1 ? s.slice(f) : '';
  a = a.replace(/<h2 id="(eTitle|cardTitle)"([^>]*)>([\s\S]*?)<\/h2>/, '<p class="h2" id="$1"$2>$3</p>');
  a = a.replace(/<h2 id="cTitle">([\s\S]*?)<\/h2>/, '<p class="h2" id="cTitle">$1</p>').replace(/\.card h2\{/g, '.card .h2{');
  if (/<h1[\s>]/.test(a) && !/<h2[\s>]/.test(a.replace(/<style[\s\S]*?<\/style>/g, ''))) {
    a = a.replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (m, at, css) => `<style${at}>${css.replace(/\bh3\b/g, 'h2').replace(/\bh4\b/g, 'h3')}</style>`);
    a = a.replace(/<(\/?)h3(?=[\s>])/g, '<$1h2').replace(/<(\/?)h4(?=[\s>])/g, '<$1h3'); }
  return a + z; }
function polishStatic() {
  let n = 0;
  const files = [['/', 'index.html'], ...J.map(j => [jUrl(j), jUrl(j).replace(/^\//, '') + 'index.html', j])];
  for (const [u, rel, j] of files) {
    const f = path.join(OUT, rel); if (!fs.existsSync(f)) continue; let s = fs.readFileSync(f, 'utf8');
    if (!j) { s = s.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, o, body, c) => { if (!body.includes('#org')) return m; try { const J = JSON.parse(body.replace(/https:\/\/\[DOMAIN\]/g, DOMAIN)); for (const x of (J['@graph'] || [J])) if (x['@type'] === 'Organization') Object.assign(x, { legalName: SITE.legalName, email: SITE.email, telephone: SITE.phoneHref, address: { '@type': 'PostalAddress', addressLocality: SITE.addressLocality, addressRegion: SITE.addressRegion, addressCountry: SITE.addressCountry }, parentOrganization: { '@type': 'Organization', name: SITE.parentCompany }, sameAs: Object.values(SITE.social || {}).filter(u => !u.includes('[')) }); return o + JSON.stringify(J).replace(/</g, '\\u003c') + c; } catch (err) { return m; } });
      s = headTags(s, DOMAIN + '/', 'ARC | TERRA XY · Luxury Ocean & Land Expeditions | ArcTerra', 'Private ocean voyages with ARCX and overland, polar and eclipse expeditions with TERRA Y. Every journey opens on a live, animated route chart.', DOMAIN + '/img/maps/banda-nutmeg-and-fire-poster.webp'); }
    else {
      const d = byId(D, (j.dest || [])[0]); let t = `${j.name}: ${j.days}-Day ${d ? d.name.replace(/ &.*$/, '') + ' ' : ''}${KIND(j)} | ${j.brand === 'Polar Crossings' ? 'Polar Crossings' : j.brand}`;
      if (t.length > 62) t = t.replace(/ \| .*$/, ''); if (t.length > 62) t = `${j.name}: ${j.days}-Day ${KIND(j)}`;
      const m = s.match(/<meta name="description" content="([^"]*)"/); const desc = trimDesc((m ? m[1] : j.summary).replace(/&amp;/g, '&').replace(/&#x27;/g, "'"));
      s = headTags(s, DOMAIN + u, t, desc, DOMAIN + poster(j));
      s = s.replace(/<nav aria-label="Site">[\s\S]*?<\/nav>/, NAV_STATIC);
      if (!/"BreadcrumbList"/.test(s)) { const bc = `<script type="application/ld+json">${JSON.stringify(crumbLd([['Home', '/'], ['Journeys', '/journeys/'], [j.name, u]])).replace(/</g, '\\u003c')}</script>`; s = s.includes('</body>') ? s.replace('</body>', bc + '</body>') : s + bc; }
      if (/id="globeHero"/.test(s) && !s.includes('id="cls-fix"')) s = s.replace('<section class="hero" id="globeHero"', CLS_FIX + '<section class="hero" id="globeHero"');
    }
    s = fillGaps(outline(stripInternal(s))); fs.writeFileSync(f, s); n++;
  }
  // every page: still poster first, animation when on screen
  const walk = d => { for (const x of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, x.name);
    if (x.isDirectory()) { if (!['brand', 'vendor', 'img', 'data', 'assets'].includes(x.name)) walk(p); continue; } if (!x.name.endsWith('.html')) continue;
    let s = fs.readFileSync(p, 'utf8'); const s2 = s.replace(/<img src="\/?img\/maps\/([a-z0-9-]+)\.webp"(?![^>]*data-anim)/g, (m, slug) => { slug = slug.replace(/-poster$/, ''); return `<img src="/img/maps/${slug}-card.jpg" data-anim="/img/maps/${slug}-card.mp4"`; }).replace(/(<img src="\/img\/maps\/[a-z0-9-]+-card\.jpg"[^>]*?) width="640" height="400"/g, '$1 width="960" height="600"');
    const s3 = s2.replace(/<meta name="description" content="([^"]{1,69})">/, (m, d) => `<meta name="description" content="${d.replace(/\.?$/, '.')} Small-ship expeditions by ArcTerra: ARCX ocean voyages and TERRA Y land journeys.">`);
    if (s3 !== s) fs.writeFileSync(p, s3); } };
  walk(OUT);
  // eclipse pages: clearer titles
  for (const [rel, t] of [['eclipse-expeditions/index.html', 'SYZYGY Eclipse Journeys 2027–2028: Luxor & Komodo | ArcTerra'], ['eclipse-expeditions/egypt-and-amazon/index.html', 'Solar Eclipse Journeys: Egypt 2027 & Amazon 2028 | ArcTerra']]) {
    const f = path.join(OUT, rel); if (!fs.existsSync(f)) continue; let s = fs.readFileSync(f, 'utf8'); const m = s.match(/<meta name="description" content="([^"]*)"/);
    s = headTags(s, DOMAIN + '/' + rel.replace('index.html', ''), t, trimDesc(m ? m[1].replace(/&amp;/g, '&') : t), DOMAIN + '/img/maps/' + (rel.includes('amazon') ? 'egypt-and-amazon' : 'eclipse-expeditions') + '-card.jpg');
    s = s.replace(/<nav aria-label="Site">[\s\S]*?<\/nav>/, NAV_STATIC); s = fillGaps(outline(stripInternal(s))); fs.writeFileSync(f, s); n++;
  }
  return n;
}

/* ---------- sitemap + llms ---------- */
function seo() {
  const urls = ['/', '/journeys/', ...J.map(jUrl), '/ocean-expeditions/', '/land-expeditions/', '/departures/', '/destinations/', ...D.filter(d => !isDraft(d)).map(d => `/destinations/${d.slug}/`), '/vessels/', ...V.filter(v => !isDraft(v)).map(v => `/vessels/${v.slug}/`),
    '/about/', '/about/founder/', '/about/team/', '/advisors/', '/media/', '/journal/', ...P.filter(p => !isDraft(p)).map(p => `/journal/${p.slug}/`), '/enquire/', '/privacy/', '/terms/'];
  const uniq = [...new Set(urls)];
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${uniq.map(u => { const j = J.find(x => jUrl(x) === u); return `  <url><loc>${DOMAIN}${u}</loc><lastmod>${TODAY}</lastmod>${j ? `<image:image><image:loc>${DOMAIN}${mapImg(j)}</image:loc></image:image>` : ''}</url>`; }).join('\n')}\n</urlset>\n`);
  const ll = `# ${SITE.name}\n\n> ARC | TERRA XY: ARCX ocean voyages (dive, surf, sail), TERRA Y land voyages, Polar Crossings (Antarctica, South Georgia, Arctic) and SYZYGY eclipse journeys. Every journey opens on a live, animated route chart.\n\n## Journeys\n${J.map(j => `- [${j.name}](${DOMAIN}${jUrl(j)}): ${j.brand}, ${j.days} days. ${j.summary}${fromPrice(j) ? ` From ${money(fromPrice(j))} per person.` : ''}`).join('\n')}\n\n## Destinations\n${D.filter(d => !isDraft(d)).map(d => `- [${d.name}](${DOMAIN}/destinations/${d.slug}/): ${d.brand}. Best months ${monthRanges(d.months || []) || 'year round'}; fly to ${d.gw}.`).join('\n')}\n\n## Vessels\n${V.filter(v => !isDraft(v)).map(v => `- [${clean(v.name)}](${DOMAIN}/vessels/${v.slug}/): ${v.type}${v.guests ? `, ${v.guests} guests` : ''}.`).join('\n')}\n\n## Company\n- [Founder story](${DOMAIN}/about/founder/)\n- [Team](${DOMAIN}/about/team/)\n- [${SITE.journalName} (journal)](${DOMAIN}/journal/)\n- [Travel advisors](${DOMAIN}/advisors/)\n- [Media](${DOMAIN}/media/)\n- [Enquire](${DOMAIN}/enquire/)\n`;
  fs.writeFileSync(path.join(OUT, 'llms.txt'), ll);
  return uniq.length;
}

destHub(); D.forEach(destPage); vesselHub(); V.forEach(vesselPage); journeysHub(); aboutPages(); mediaPage(); journal(); legal(); enquire(); advisors(); departures(); hubs();
const nf = staticFooters(); const np = polishStatic();
const nj = injectDepartures(); const ns = seo();
console.log(`Built ${PROD ? 'production' : 'preview'}: ${D.length} destinations, ${V.length} vessels, ${P.length} posts, ${J.length} journeys (${X.length} departures, ${nj} journey pages updated), ${ns} sitemap URLs, ${nf} static pages with the shared footer, ${np} polished → dist/`);
