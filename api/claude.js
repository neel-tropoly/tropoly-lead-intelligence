export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { model, max_tokens, messages, enableWebSearch } = req.body;

    const body = {
      model: model || 'claude-sonnet-4-6',
      max_tokens: max_tokens || 1000,
      messages,
    };

    if (enableWebSearch) {
      body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
    }

    // Log what we're sending so we can see it in Vercel logs
    console.log('Anthropic request:', JSON.stringify({
      model: body.model,
      max_tokens: body.max_tokens,
      has_tools: !!body.tools,
      message_count: messages?.length
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      // Log the actual Anthropic error so we can see it in Vercel logs
      console.error('Anthropic error:', response.status, err);
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('Handler error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
