/* Meta Conversions API relay for the intake form's Lead event.
   Runs server-side so em/ph are hashed here rather than trusted from the
   client, and so client_ip_address comes from the real request instead of
   a value the browser could spoof.

   Requires META_CAPI_ACCESS_TOKEN to be set in the Vercel project's
   environment variables (Events Manager > Data Sources > Pixel > Settings
   > Conversions API > Set up manually > Generate access token). Until
   that's set, this endpoint no-ops (200, skipped: true) so it never
   breaks the form. */

const crypto = require('crypto');

const PIXEL_ID = '1676816126768459';
const GRAPH_API_VERSION = 'v21.0';

function sha256(value) {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(200).json({ skipped: true, reason: 'META_CAPI_ACCESS_TOKEN not configured' });
    return;
  }

  try {
    const body = req.body || {};
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || '')
      .split(',')[0].trim() || req.socket?.remoteAddress;

    const userData = {
      em: sha256(body.email),
      ph: sha256(body.phone),
      fn: sha256(body.firstName),
      ln: sha256(body.lastName),
      client_ip_address: clientIp,
      client_user_agent: body.clientUserAgent,
      fbp: body.fbp || undefined,
      fbc: body.fbc || undefined
    };
    Object.keys(userData).forEach((key) => {
      if (userData[key] === undefined || userData[key] === '') delete userData[key];
    });

    const eventPayload = {
      data: [{
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.eventId,
        event_source_url: body.pageUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: {
          content_name: body.projectType || 'General Inquiry',
          content_category: 'Intake Form',
          currency: 'INR',
          value: body.value || 0
        }
      }]
    };

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`;
    const metaRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload)
    });
    const metaJson = await metaRes.json();

    if (!metaRes.ok) {
      console.error('Meta CAPI error:', metaJson);
      res.status(200).json({ success: false, meta: metaJson });
      return;
    }

    res.status(200).json({ success: true, meta: metaJson });
  } catch (err) {
    console.error('CAPI handler error:', err);
    res.status(200).json({ success: false, error: String(err) });
  }
};
