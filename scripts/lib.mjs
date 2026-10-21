#!/usr/bin/env node
/* Shared data + helpers for scripts/build.mjs.
 * Runs on every Vercel deploy (vercel.json → buildCommand). Copies the static site into dist/, reads the
 * ArcTerra Expeditions Library base in Airtable (prices, departures, destinations, vessels, crew, team,
 * journal posts, media) and writes the data-driven pages. The Airtable key lives only in Vercel's
 * environment variables (AIRTABLE_TOKEN); it never reaches the browser.
 * Without AIRTABLE_TOKEN it builds from content/airtable-snapshot.json, so local previews always work.
 * Drafts: records with Status "Draft" are built on preview deployments (noindex, marked DRAFT) and left
 * out of production (VERCEL_ENV=production). */
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist');
const SITE = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const BASE = process.env.AIRTABLE_BASE || SITE.airtableBase;
const TOKEN = process.env.AIRTABLE_TOKEN || '';
const PROD = process.env.VERCEL_ENV === 'production';
const DOMAIN = (process.env.SITE_URL || SITE.domain).replace(/\/$/, '');
const TODAY = new Date().toISOString().slice(0, 10);

/* ---------- Airtable ---------- */
const TABLES = { Destinations: 'tblxM56L46OvFBu4I', Journeys: 'tblyrR7ysWAqtQw1r', Departures: 'tblOnnEff0PfutJLg', Vessels: 'tblTYBHV5bKVvtWe4',
  Crew: 'tblcqJ5ltvJhBEnJa', Team: 'tblwLWrnKFYBaN1uU', Guides: 'tbluP1n54MdIx1oNI', Posts: 'tblI4ZL13Xf9dGtPG', Media: 'tblKHzVJY2vVrooij' };
const F = {
  d: { name: 'fldO73tffc4yy2g0h', slug: 'fldFouMOKeEEO7OT6', brand: 'fldS43LBvx25JJVug', region: 'fldDxWsXz1tV6Y7kU', styles: 'fldaBmef6Lwtotikz', gw: 'fldK81GVIuzHFmiwX', months: 'fldRatqA7On1pQuNJ', quick: 'fldYgo8Qg4pOgxT4o', coord: 'fldDR9cyzmxiDDKwc', hero: 'fld7cRWQXA7M0CrDY', status: 'fldPZZucwwAJE0S2D' },
  j: { name: 'fldiu9LLMLYTpm5zM', slug: 'fldrIGZQIlLEHQVZg', code: 'fldbsgA5UKaEuQjhW', brand: 'fld905UI9M62Ne5PS', style: 'fldkR3gn2qCjQHLPT', days: 'fldVTZFAmfjhs4AOw', ways: 'flderiBdT31DH7vCy', summary: 'fld4JBzlk0QNgMbGw', page: 'fldMnLxagWmGIfCQd', map: 'fldEEuEGZhRXYIOO4', hero: 'fldDcHy58E2mQnxE1', status: 'fldiKo9sFsqqF5kcp', dest: 'fldeIZTimf123XaKy', vessel: 'fldPiHBWOimnAC8f6' },
  x: { name: 'fldYWwIPsqlMs79KR', start: 'fldVcBv6toEKZAuMu', end: 'fld8zehIdxjvdv4At', pp: 'fldHVHbG0e5HYWSzi', single: 'fld3FmuAvso80h38G', charter: 'fldjNHQWRX5eW6WSB', deposit: 'fld2WY3aGNJ7gQsaM', left: 'fldsL0PKAdD9tpwpK', status: 'fldIYeoJ5TDiUEszH', show: 'fldDCtRRbE9zsaCfw', journey: 'flde4XJnTtC82EBVm' },
  v: { name: 'fldmUjdCycIduywuL', slug: 'fldE5TE7zmXwQBrcH', brand: 'fldSK4VEm5gfyi2eb', type: 'fldOvM8uvyfArcJsP', guests: 'fldIaHwHoFqm6m9pH', len: 'fldHDil5e9ftmhSJU', cabins: 'fldMBi1owjD5D1Su3', built: 'fldehipli8DjaIw4E', ice: 'fldAXewq3zfq60sbb', summary: 'fldjMRX97d2PS186M', hero: 'fldcg5vWGRIFfcYCg', status: 'fld8Ug0n0RgEu93lx' },
  c: { name: 'fldsryb3ShsiuY3UT', role: 'fldS1p3WeG9RijXKA', bio: 'fldSQASmF3ChNU66y', photo: 'fldj7pDKsT9S1GMRL', lang: 'fldcVeW5QqHF98rD7', show: 'fldZRSl8HHPFNh417', release: 'fldKtYr5ydBmKBbsk', vessel: 'fldMgcYamcQcs4dHa' },
  t: { name: 'fldEWNcDoHh5Mxa9q', title: 'fldtiROyXkYBGdcUy', bio: 'fldWXha63CenYltW3', exp: 'fldgNc3tENTKmRUKg', photo: 'fldl3RYsMjVJNXri2', order: 'fld4Z3lbuKJbU76Uj', founder: 'fldjuCTZ4hPyZAP9m', show: 'fldK7GaZ8fbLbaN6F', story: 'fld4fuPZn0OHjDJ0L' },
  g: { name: 'fldQnlnuJFiikoi56', pdf: 'fld2TWHQremUMCkoQ', status: 'fldJMvkjI3WXwuptk', dest: 'fldl3pK2N2QkUqT92' },
  p: { title: 'fldnoHDYOgcci2Z7C', slug: 'fldkps52JAYBVB2rx', date: 'fld6fcqPWzyy2kV4S', excerpt: 'fldsalCsuiGEvYvnq', body: 'fldNl5Xvn4JZSepeY', cover: 'fldgBZwBUfZIFRA8y', seoT: 'fldMJnYoevM9GpOyi', meta: 'fldeJQGCCuNC63AdH', status: 'fldtgO4a6ocBRQ0Zb', author: 'fldxxO1WaKmDBKtdK', dest: 'fldVUjNmQc4ynxuVz' },
  m: { title: 'fldXkgp16pgB162tQ', outlet: 'fldAcXszV4G25YTKC', type: 'fldVID9zdH6TO62IE', date: 'fld0qKqXbkxrbO8y2', link: 'fldeOfXxmVWifPbl2', logo: 'fldFQwHHVLBjMumcz', show: 'fld5dJtZwsKDNolS2' },
};
async function fetchTable(id) {
  const rows = []; let offset = '';
  do {
    const u = `https://api.airtable.com/v0/${BASE}/${id}?returnFieldsByFieldId=true&pageSize=100${offset ? '&offset=' + offset : ''}`;
    const r = await fetch(u, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!r.ok) throw new Error(`Airtable ${id}: ${r.status} ${await r.text()}`);
    const j = await r.json(); rows.push(...j.records); offset = j.offset || '';
  } while (offset);
  return rows;
}
async function loadData() {
  if (TOKEN) {
    const out = {}; for (const [k, id] of Object.entries(TABLES)) out[k] = await fetchTable(id);
    console.log('Airtable: live data', Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])));
    return out;
  }
  console.log('Airtable: AIRTABLE_TOKEN not set, building from content/airtable-snapshot.json');
  return JSON.parse(fs.readFileSync(process.env.SNAPSHOT || path.join(ROOT, 'content/airtable-snapshot.json'), 'utf8'));
}
// normalise values whether they come from the REST API or an export (selects as objects, links as objects)
const val = v => v && typeof v === 'object' && !Array.isArray(v) ? (v.name ?? v.url ?? v.id ?? '') : v;
const arr = v => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]).map(x => x && typeof x === 'object' ? (x.id && /^rec/.test(x.id) ? x.id : x.name ?? x.url ?? x.value ?? x.id) : x);
function pick(rec, map) { const o = { id: rec.id }; for (const [k, f] of Object.entries(map)) { const v = rec.fields[f]; o[k] = Array.isArray(v) ? arr(v) : val(v); } return o; }

/* ---------- helpers ---------- */
const e = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = s => String(s ?? '').replace(/\s*\[[^\]]*\]/g, '').trim();
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function monthRanges(ms) {
  const on = MON.map(m => ms.includes(m)); if (!on.some(Boolean)) return ''; if (on.every(Boolean)) return 'year round';
  let s = on.indexOf(false); const runs = []; let cur = null;
  for (let k = 1; k <= 12; k++) { const i = (s + k) % 12; if (on[i]) { if (!cur) cur = [i, i]; else cur[1] = i; } else if (cur) { runs.push(cur); cur = null; } }
  if (cur) runs.push(cur);
  const t = runs.map(([a, b]) => a === b ? MON[a] : `${MON[a]}–${MON[b]}`);
  return t.length > 1 ? t.slice(0, -1).join(', ') + ' and ' + t[t.length - 1] : t[0];
}
const money = n => n ? '$' + Math.round(n).toLocaleString('en-US') : '';
const fdate = d => d ? new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';
const cls = brand => brand === 'ARCX' ? '' : brand === 'Polar Crossings' ? 'p' : brand === 'SYZYGY' ? 's' : 't';
const pathOf = brand => brand === 'ARCX' ? 'arcx' : brand === 'Polar Crossings' ? 'polar' : 'terray';
const cld = (url, w) => url && /res\.cloudinary\.com/.test(url) ? url.replace('/upload/', `/upload/f_auto,q_auto,c_fill,w_${w}/`) : url;
const write = (rel, html) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

/* minimal markdown: headings, paragraphs, lists, tables, bold/italic, links */
function inline(s) {
  return e(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^_\w])_([^_]+)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => `<a href="${u}"${/^https?:/.test(u) ? ' rel="noopener"' : ''}>${t}</a>`);
}
const slugify = s => String(s).toLowerCase().replace(/&amp;|&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function md(src, opt = {}) {
  const lines = String(src || '').replace(/\r/g, '').split('\n'); const out = []; const toc = []; let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{2,4})\s+(.*)/))) { const lv = m[1].length, id = slugify(m[2]); if (lv === 2) toc.push([id, m[2]]); out.push(`<h${lv} id="${id}">${inline(m[2])}</h${lv}>`); i++; continue; }
    if (/^\|/.test(l)) { const rows = []; while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]); const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(rows[0]), body = rows.slice(2).map(cells);
      out.push(`<table><thead><tr>${head.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`); continue; }
    if (/^[-*]\s+/.test(l)) { const it = []; while (i < lines.length && /^[-*]\s+/.test(lines[i])) it.push(lines[i++].replace(/^[-*]\s+/, '')); out.push(`<ul>${it.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`); continue; }
    if (/^\d+\.\s+/.test(l)) { const it = []; while (i < lines.length && /^\d+\.\s+/.test(lines[i])) it.push(lines[i++].replace(/^\d+\.\s+/, '')); out.push(`<ol>${it.map(x => `<li>${inline(x)}</li>`).join('')}</ol>`); continue; }
    const para = []; while (i < lines.length && lines[i].trim() && !/^(#{2,4}\s|\||[-*]\s|\d+\.\s)/.test(lines[i])) para.push(lines[i++]);
    out.push(`<p>${para.map(inline).join('<br>')}</p>`);
  }
  let html = out.join('\n');
  if (opt.glance) html = html.replace(/<p><strong>At a glance<\/strong><\/p>\n<ul>([\s\S]*?)<\/ul>/, '<div class="glance"><p><strong>At a glance</strong></p><ul>$1</ul></div>');
  return { html, toc };
}
// "## Questions travellers ask" → [{q,a}] for FAQ schema
function faqsFrom(src) {
  const s = String(src || ''); const i = s.search(/^##\s+Questions/m); if (i < 0) return [];
  const body = s.slice(i).split('\n').slice(1).join('\n'); const out = []; const re = /\*\*(.+?)\*\*\s*\n([^\n]+(?:\n(?!\*\*|##)[^\n]+)*)/g; let m;
  while ((m = re.exec(body))) out.push({ q: m[1].trim(), a: m[2].replace(/\s+/g, ' ').trim() });
  return out;
}

export { loadData, pick, F, e, clean, md, faqsFrom, monthRanges, money, fdate, cls, pathOf, cld, write, ld, slugify, MON, ROOT, OUT, SITE, DOMAIN, PROD, TODAY };
