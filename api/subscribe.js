// POST /api/subscribe  · "Get the guide" and newsletter sign-ups → Airtable Subscribers table.
// The Airtable automation "Send destination guide to subscriber" then emails the PDF.
// Needs Vercel environment variable AIRTABLE_TOKEN (personal access token with data.records:read + write on the base).
const BASE = process.env.AIRTABLE_BASE || 'appXUzePYs6cZrQKx';
const SUBS = 'tblgACYFp0kUsnSiX', GUIDES = 'tbluP1n54MdIx1oNI';
const FLD = { email: 'fldMUUwpQXucgh1E4', name: 'fldmqxlm5J8TlNng5', consent: 'fldJ6h8lth3tt6vRv', source: 'fldWnzGsm7xLY9KHL', sent: 'fldJLhIwnZV9JqePj', unsub: 'fld39gq2b7JOZPKlv', guide: 'fldnbq2MGrw2sGAHe', interests: 'fldc7ihbEtmF4U3D2' };
const REC = /^rec[A-Za-z0-9]{14}$/, EMAIL = /^[^\s@<>()]{1,64}@[^\s@<>()]{1,190}\.[a-z]{2,24}$/i;

async function at(path, opt = {}) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${path}`, { ...opt, headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, 'Content-Type': 'application/json', ...(opt.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Airtable ${r.status}: ${JSON.stringify(j).slice(0, 200)}`);
  return j;
}
function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise(res => { let s = ''; req.on('data', c => { s += c; if (s.length > 1e4) req.destroy(); }); req.on('end', () => {
    try { res(JSON.parse(s)); } catch { res(Object.fromEntries(new URLSearchParams(s))); } }); });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Use POST' }); }
  const b = await readBody(req);
  const isForm = !String(req.headers['content-type'] || '').includes('json');
  const done = (code, obj) => isForm ? res.writeHead(303, { Location: (req.headers.referer || '/') .split('#')[0] + (code < 300 ? '#guide-sent' : '#guide-error') }).end() : res.status(code).json(obj);
  if (b.website) return done(200, { ok: true, message: 'Thank you.' });               // honeypot: bots fill hidden fields
  const email = String(b.email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return done(400, { error: 'Please enter a valid email address.' });
  const consent = b.consent === true || b.consent === 'on' || b.consent === 'true';
  if (!consent) return done(400, { error: 'Please tick the box so we can email you the guide.' });
  if (!process.env.AIRTABLE_TOKEN) return done(503, { error: 'Sign-ups are not switched on yet. Please email us instead.' });
  const clip = (x, n) => String(x || '').slice(0, n).replace(/[<>]/g, '').trim();
  const name = [clip(b.name, 80), clip(b.agency, 80), b.iata ? 'IATA ' + clip(b.iata, 20) : ''].filter(Boolean).join(' · ');
  const guide = REC.test(b.guide || '') ? b.guide : null, dest = REC.test(b.destination || '') ? b.destination : null;
  const source = ['Guide download', 'Newsletter', 'Enquiry', 'Event', 'Advisor'].includes(b.source) ? b.source : (guide ? 'Guide download' : 'Newsletter');
  try {
    if (guide) await at(`${GUIDES}/${guide}`);                                       // must be a real guide record
    const q = encodeURIComponent(`LOWER({Email})='${email.replace(/'/g, "\\'")}'`);
    const found = (await at(`${SUBS}?filterByFormula=${q}&maxRecords=1&returnFieldsByFieldId=true`)).records[0];
    const fields = { [FLD.email]: email, [FLD.consent]: true, [FLD.unsub]: false };
    if (name) fields[FLD.name] = name;
    if (guide) { fields[FLD.guide] = [guide]; fields[FLD.sent] = false; }               // a new guide request re-arms the email
    if (dest) fields[FLD.interests] = [...new Set([...(found ? found.fields[FLD.interests] || [] : []), dest])];
    if (found) await at(SUBS, { method: 'PATCH', body: JSON.stringify({ records: [{ id: found.id, fields }] }) });
    else { fields[FLD.source] = source; await at(SUBS, { method: 'POST', body: JSON.stringify({ records: [{ fields }], typecast: true }) }); }
    return done(200, { ok: true, message: source === 'Advisor' ? 'Thank you. We will be in touch within one business day.' : guide ? 'Thank you. Your guide is on its way; check your inbox (and spam folder) in a few minutes.' : 'Thank you. You are on the list.' });
  } catch (err) {
    console.error('subscribe failed', err.message);
    return done(500, { error: 'Sorry, that did not go through. Please try again or email us.' });
  }
};
