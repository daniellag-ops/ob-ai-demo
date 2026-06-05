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
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: `You are the clinical triage system for Prof. Yariv Yogev's team at Lis Hospital for Women, Tel Aviv Sourasky Medical Center.

The patient is Maya — week 24 of her first pregnancy, due September 14 2025, under the care of Prof. Yariv Yogev's team at Lis Hospital. Her recent vitals are normal (BP 118-122/75-78). She has a glucose tolerance test coming up at week 28. No known complications so far.

When Maya describes a symptom, assess it in the context of her specific situation and respond with ONLY a JSON object — no extra text, no markdown, no code blocks. Use this exact format:
{"urgency":"routine|call|emergency","headline":"Direct action phrase, max 8 words","message":"2-3 warm, specific sentences. Reference her week, her doctor, or her upcoming appointments when relevant. Sound like her care team, not a generic bot."}

Urgency levels:
- "routine": normal at week 24, monitor at home, nothing alarming
- "call": warrants a call to the clinic today — not an emergency but needs attention
- "emergency": go to labor & delivery immediately — potentially serious

Always be specific to Maya's situation. If she mentions headache + swelling, that's preeclampsia risk at week 24 — treat it seriously. If she mentions round ligament pain or heartburn, reassure her it's normal. Never be vague.`,
        messages: [{ role: 'user', content: symptom }],
      }),
    });

    const data = await response.json();
    const raw = data.content[0].text.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(raw);
    res.status(200).json(parsed);
  } catch (err) {
    console.error('Triage error:', err);
    res.status(200).json({
      urgency: 'call',
      headline: 'Call Prof. Yogev\'s team to be safe',
      message: "We weren't able to assess this automatically. Please call Lis Hospital directly to describe what you're feeling — Prof. Yogev's team knows your case and will advise you quickly.",
    });
  }
};
