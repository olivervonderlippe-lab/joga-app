const JOGA_BRAIN = `Du bist die kreative Stimme von JOGA.

JOGA ist nicht klassisches Yoga. JOGA ist Bewegung fuer Menschen die sich in klassischem Yoga nicht wiederfinden.

JOGA ist: direkt, humorvoll, koerpernah, modern, trocken, ehrlich, manchmal frech.
JOGA ist NIEMALS: esoterisch, guruhaft, spirituell, kitschig, generisch motivierend.

Die Sprache klingt wie ein intelligenter Freund mit Lebenserfahrung der Bewegung entmystifiziert.

JOGA spricht an: Menschen mit steifen Koerpern, Bueroalltag, ueber 35, ohne Yoga-Identitaet.

JOGA verkauft keine Perfektion. JOGA verkauft Zustandsveraenderung.

Texte sollen sein: kurz, merkbar, sprechbar, menschlich, pointiert, alltagsnah.

NIEMALS: Kalaendersprueche, Achtsamkeitsphrasen, Sanskrit, Fitnessstudio-Sprache, anatomische Fachbegriffe, KI-Text.

Humor ist erlaubt. Trockenheit ist erwuenscht.

Gute JOGA-Sprache klingt so:
- Mach das statt Kaffee.
- Du bist nicht alt. Du bist unbeweglich.
- Der Koerper ist kein Burostuhl.
- JOGA. Fuer alle die Yoga nie wollten.

Antworten niemals erklaeren. Direkt liefern.`;

function buildPrompt(type, params) {
  if (type === 'statement') {
    return `Erstelle 3 Statement-Varianten fuer JOGA.
Thema: ${params.thema}
Ton: ${params.ton}
Format: ${params.format}

Jede Variante enthaelt:
HOOK: (1 praegnanter Satz)
STATEMENT: (1-2 Saetze)
CAPTION: (TikTok-ready, mit #joga #nichtyoga)
TEXTSUPER: (1-2 Woerter fuer Video-Overlay)

Kein Erklaeren. Direkt liefern.`;
  }

  if (type === 'flow') {
    return `Erstelle eine vollstaendige JOGA Content-Karte.
Gefuehl: ${params.gefuehl}
Situation: ${params.situation}
Intensitaet: ${params.intensitaet}
Format: ${params.format}

Liefere:
TITEL: 
HOOK: (1 Satz, provokant oder einladend)
ABLAUF: (3-5 Moves mit Timing, alltagstauglich zuerst)
DREHANLEITUNG: (kurz, kameratauglich)
CAPTION: (TikTok-ready)
HASHTAGS:
ENDGEFUEHL: (1 Satz was der Zuschauer nach dem Video fuehlt)

Zustand zuerst, nicht Anatomie. Kein Yoga-Vokabular.`;
  }

  if (type === 'hooks') {
    return `Generiere 5 Hook-Varianten fuer JOGA.
Thema/Move: ${params.thema}
Zielgefuehl: ${params.gefuehl || 'offen'}

Format: je 1 Satz. Direkt. Keine Erklaerungen.
Mix aus: provokant, einladend, humorvoll, ehrlich.

Danach: kurze 1-Satz Bewertung welche Hook am staerksten ist und warum.`;
  }

  return `JOGA Content fuer: ${JSON.stringify(params)}. Direkt und praegnant.`;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { type, params } = JSON.parse(event.body);
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1000,
        system: JOGA_BRAIN,
        messages: [{ role: 'user', content: buildPrompt(type, params) }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: data.error?.message || 'API error' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result: data.content[0].text })
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
