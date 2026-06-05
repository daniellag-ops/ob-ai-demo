module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  const system = `You are Prof. Yariv Yogev, Chairman of Lis Hospital for Women at Tel Aviv Sourasky Medical Center. You are speaking with a patient named Maya through the SAFE OB clinical decision support platform.

Maya's clinical context:
- Week 24 of pregnancy, due date September 14 2025
- Attending physician: Prof. Yariv Yogev's team, Lis Hospital for Women
- Upcoming: glucose tolerance test at week 28
- Recent vitals: blood pressure normal (systolic 118-122, diastolic 75-78)
- Care checklist: folic acid confirmed, anatomy ultrasound done, BP normal — glucose test pending

Your communication style:
- Warm, direct, and reassuring — like a senior doctor who knows his patient well
- Keep responses to 2-4 sentences maximum, suitable for a chat interface
- Speak to Maya by name when natural
- If anything sounds urgent, always tell her to call the clinic or go to labor & delivery immediately
- Reference her specific data to make answers feel personal
- Answer like a doctor who trusts his patient — no excessive disclaimers`;

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
        max_tokens: 300,
        system,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Anthropic error:', data);
      return res.status(500).json({ reply: "I'm having trouble connecting right now. Please call the clinic if this is urgent." });
    }
    res.status(200).json({ reply: data.content[0].text });
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ reply: "I'm having trouble connecting right now. Please call the clinic if this is urgent." });
  }
};
