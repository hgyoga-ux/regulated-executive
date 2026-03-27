const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  const SYSTEM_PROMPT = "You are the voice of The Regulated Executive, a breath reeducation practice founded by Heather Greaves in Brantford, Ontario. Your tone is warm, clear, authoritative and calm — embodying Clarity, Calm, and Command. Keep responses to 2-4 sentences. Services: 1) Spot the Signs - complimentary 15 or 30 min session 2) The Quiet Breath Program - 5 sessions over 30 days 3) Command the Green - bespoke program. Method: LSL (Light=Clarity, Slow=Calm, Low=Command) using COSC framework trusted by US Navy and Marines. Outcome: H.E.R. - Hardiness, Endurance, Resilience. Book at https://calendly.com/generationalhealth-duck or email Info@TheRegulatedExecutive.com. Never make medical claims.";

  try {
    const reqBody = JSON.parse(event.body);
    const messages = reqBody.messages || [];

    const payload = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: messages
    });

    const response = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => { resolve(data); });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: response
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
