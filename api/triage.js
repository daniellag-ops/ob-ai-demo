module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { symptom } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: `You are a clinical triage assistant for SAFE OB. The patient is Maya, week 24 of pregnancy, cared for at Lis Hospital for Women, Tel Aviv Sourasky Medical Center.

Assess the symptom and respond with ONLY valid JSON in this exact format, nothing else:
{"urgency":"routine|call|emergency","headline":"short action phrase max 8 words","message":"2 calm sentences — what to do and why"}

Urgency definitions:
- "routine": normal pregnancy symptom, monitor at home
- "call": needs attention today, call the clinic — not life-threatening
- "emergency": go to labor & delivery immediately — could be serious

Be direct, calm, and specific. Never be vague. Never add text outside the JSON.`,
        messages: [{ role: 'user', content: symptom }],
      }),
    });

    const data = await response.json();
    const parsed = JSON.parse(data.content[0].text.trim());
    res.status(200).json(parsed);
  } catch (err) {
    res.status(200).json({
      urgency: 'call',
      headline: 'Call the clinic to be safe',
      message: "We weren't able to assess this automatically. Please call your clinic now to describe what you're experiencing.",
    });
  }
};
