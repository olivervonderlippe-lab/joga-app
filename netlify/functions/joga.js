const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const OPENAI_API   = 'https://api.openai.com/v1/chat/completions';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const ok  = body => ({ statusCode: 200, headers: CORS, body: JSON.stringify(body) });
const err = (code, msg) => ({ statusCode: code, headers: CORS, body: JSON.stringify({ error: msg }) });

// ─── System prompt ──────────────────────────────────────────────────────────
const SYSTEM = `Du bist Creative Director bei JOGA – "Nicht Yoga. Für alle, die nie Yoga machen wollten."
JOGA ist anti-esoterisch, direkt, humorvoll. Keine Gurus, kein Sanskrit-Bingo, keine Räucherstäbchen.
Zielgruppe: Leute, die bei echtem Yoga sofort abschalten würden – aber Bewegung brauchen.
Plattformen: TikTok, Instagram Reels, YouTube Shorts. Vertikal. Kurz. Direkt.

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt – kein Markdown, keine Backticks, kein Präfix:
{
  "hook": "Erster Satz / erste 3 Sekunden – provokant, niemals mit 'Hey' oder einer Frage. Sofort Bild im Kopf.",
  "textsuper": ["Supertitel 1", "Supertitel 2", "Supertitel 3"],
  "caption": "Vollständige Caption für Instagram/TikTok – kein Emoji-Spam, kein Eso-Geschwätz, direkte Sprache, Zeilenumbrüche ok",
  "drehanleitung": "Konkrete Drehanleitung – Kamerawinkel, Perspektive, Bewegung, Schnitte, ungefähre Länge",
  "hashtags": ["#joga", "#nichtyoga"],
  "endgefuehl": "Das Gefühl das nach dem Video bleibt – ein präziser Satz"
}`;

function buildPrompt(ablauf, pillar, platform) {
  const pillars = {
    nutzlich: 'Nützlich – praktischer Mehrwert, Lösung für ein echtes körperliches Problem',
    wow:      'Wow – beeindruckend, skill-basiert, zum Nachahmen animierend',
    ehrlich:  'Ehrlich – Humor, Selbstironie, relatable Momente aus dem Bewegungsalltag',
  };
  const platforms = {
    tiktok:    'TikTok (Hook in 3 Sek, max. 60s)',
    instagram: 'Instagram Reels (bis 90s, etwas mehr Kontext ok)',
    youtube:   'YouTube Shorts (bis 60s, Thumbnail-Optimierung beachten)',
  };
  return `Content-Säule: ${pillars[pillar] || pillar}
Plattform: ${platforms[platform] || platform}

JOGA-Ablauf:
${ablauf}`;
}

// ─── API calls ───────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system:     SYSTEM,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content?.[0]?.text?.trim() ?? '{}';
  return JSON.parse(text);
}

async function callGPT4o(prompt) {
  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model:           'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens:      1024,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user',   content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`GPT-4o ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim() ?? '{}';
  return JSON.parse(text);
}

// ─── Handler: verpacken ──────────────────────────────────────────────────────
async function handleVerpacken({ ablauf, pillar, platform }) {
  if (!ablauf?.trim()) return err(400, 'ablauf fehlt');

  const prompt = buildPrompt(ablauf.trim(), pillar, platform);

  const [r1, r2] = await Promise.allSettled([
    callClaude(prompt),
    callGPT4o(prompt),
  ]);

  return ok({
    claude: r1.status === 'fulfilled' ? r1.value : { error: r1.reason?.message ?? 'Fehler' },
    gpt4o:  r2.status === 'fulfilled' ? r2.value : { error: r2.reason?.message ?? 'Fehler' },
  });
}

// ─── Main handler ────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST')    return err(405, 'Method not allowed');

  let body;
  try { body = JSON.parse(event.body); }
  catch { return err(400, 'Invalid JSON'); }

  try {
    switch (body.type) {
      case 'verpacken': return await handleVerpacken(body);
      default:          return err(400, `Unbekannter type: ${body.type}`);
    }
  } catch (e) {
    return err(500, e.message);
  }
};
