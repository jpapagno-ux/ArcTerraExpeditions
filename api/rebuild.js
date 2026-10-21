// GET /api/rebuild?key=REBUILD_KEY · republishes the site so new Airtable prices, departures and posts go live.
// Called by (a) the daily Vercel cron in vercel.json and (b) a "Publish site" button field in Airtable.
// Needs Vercel env vars: DEPLOY_HOOK_URL (Project → Settings → Git → Deploy Hooks) and REBUILD_KEY (any long random string).
module.exports = async (req, res) => {
  const key = (req.query && req.query.key) || new URL(req.url, 'http://x').searchParams.get('key');
  const cron = process.env.CRON_SECRET && req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
  if (!cron && (!process.env.REBUILD_KEY || key !== process.env.REBUILD_KEY)) return res.status(401).send('Not allowed');
  if (!process.env.DEPLOY_HOOK_URL) return res.status(503).send('DEPLOY_HOOK_URL is not set in Vercel.');
  const r = await fetch(process.env.DEPLOY_HOOK_URL, { method: 'POST' });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(r.ok ? 200 : 502).send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:16px/1.6 system-ui;padding:40px;max-width:560px;margin:auto;background:#F6F4EF;color:#081A26"><h1 style="font-size:22px">${r.ok ? 'Publishing the site' : 'Could not start publishing'}</h1><p>${r.ok ? 'Your Airtable changes will be live on arcterra.travel in about one to two minutes.' : 'Vercel did not accept the request. Check DEPLOY_HOOK_URL in the project settings.'}</p></body>`);
};
