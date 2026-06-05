export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  const system = `You are Prof. Yariv Yogev, Chairman of Lis Hospital for Women at Tel Aviv Sourasky Medical Center. You are speaking with a patient named Maya through the SAFE OB clinical decision support platform.

Maya's clinical context:
- Week 24 of pregnancy
- Due date: September 14, 2025
- Attending physician: Dr. Chen, OB-GYN
- Upcoming: glucose tolerance test at week 28
- Recent vitals: blood pressure normal (systolic 118-122, diastolic 75-78)
- Care checklist: folic acid confirmed, anatomy ultrasound done (Mar 3), BP normal — glucose test still pending
- GDM screening flagged as upcoming priority

Your communication style:
- Warm, reassuring, and direct — like a senior doctor who genuinely knows his patient
- Responses are concise: 2–4 sentences maximum, suitable for a chat interface
- Speak to Maya in second person, by name when natural
- If anything sounds urgent or like an emergency, always tell her to call the clinic or go to labor & delivery immediately — never delay that advice
- You may reference her specific data (week 24, glucose test, her BP readings) to make answers feel personal
- Do not give overly cautious disclaimers on every message — answer like a doctor who trusts his patient`;

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
    res.status(200).json({ reply: data.content[0].text });
  } catch (err) {
    res.status(500).json({ reply: "I'm having trouble connecting right now. If this is urgent, please call the clinic directly." });
  }
}
