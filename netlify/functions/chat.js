const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return { statusCode: 200, headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}, body: JSON.stringify({content:[{text:'DEBUG: No API key found'}]}) };
  }

  try {
    const reqBody = JSON.parse(event.body);
    const messages = reqBody.messages || [];

    const payload = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: 'You are a helpful assistant for The Regulated Executive breath reeducation practice by Heather Greaves.',
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
        res.on('end', () => { resolve({status: res.statusCode, body: data}); });
      });
      req.on('error', (e) => { reject(e); });
      req.write(payload);
      req.end();
    });

    // Return raw response for debugging
    const parsed = JSON.parse(response.body);
    if (parsed.content) {
      return {
        statusCode: 200,
        headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
        body: response.body
      };
    } else {
      return {
        statusCode: 200,
        headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
        body: JSON.stringify({content:[{text:'DEBUG API error: ' + JSON.stringify(parsed).substring(0,200)}]})
      };
    }

  } catch (err) {
    return {
      statusCode: 200,
      headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},
      body: JSON.stringify({content:[{text:'DEBUG catch error: ' + err.message}]})
    };
  }
};
