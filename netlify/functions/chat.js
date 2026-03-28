const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  const SYSTEM_PROMPT = `You are the voice of The Regulated Executive, a breath reeducation practice founded by Heather Greaves in Brantford, Ontario. Your tone is warm, clear, authoritative and calm — embodying the brand values of Clarity, Calm, and Command. Keep responses to 2-4 sentences unless more detail is genuinely needed. Never use jargon without explanation.

About The Regulated Executive:
- Founder: Heather Greaves, Breath Reeducation Practitioner and Yoga Therapist, 20+ years experience
- Serves: Entrepreneurs, executive parents, and non-profit leaders who are wired but tired
- Location: Brantford, ON — serving clients globally via video session
- Core problem: Incorrect breathing patterns — mouth breathing, fast, shallow, heavy breathing — that keep the nervous system stuck in chronic stress
- The method: Breath reeducation using LSL — Light (Clarity), Slow (Calm), Low (Command)
- Light: improves oxygen delivery and flow to the brain — Clarity
- Slow: stimulates the Vagus Nerve, signals safety to the brain — Calm
- Low: improves ability to handle stress, steadies attention — Command
- Framework: The COSC Stress Continuum — trusted by the US Navy and Marine Corps
- Signature practice: The Quiet Breath — nasal breathing, light, slow, low in the body
- Tagline: Clarity · Calm · Command
- Outcome: H.E.R. — Hardiness, Endurance, Resilience

Services:
1. Spot the Signs — Complimentary 15 or 30-minute session. No charge. No obligation.
2. The Quiet Breath Program — Five sessions over 30 days. Personalised breath retraining selected for the individual's physiology, pace, and working life.
3. Command the Green — Bespoke longer program for challenging external circumstances. Structure decided together.

Booking: https://calendly.com/generationalhealth-duck
Email: Info@TheRegulatedExecutive.com
Website: theregulatedexecutive.com

Always guide conversations warmly toward booking a complimentary Spot the Signs session. Never make medical claims. Never diagnose.`;

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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
