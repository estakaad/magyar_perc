export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (req.body.stream) {
      res.setHeader('content-type', 'text/event-stream');
      res.setHeader('cache-control', 'no-cache');
      const reader = response.body.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) { res.end(); return; }
        res.write(value);
        await pump();
      };
      await pump();
    } else {
      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
