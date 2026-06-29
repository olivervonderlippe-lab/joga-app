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

Gute JOGA-Sprache:
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
ENDGEFUEHL: (1 Satz)

Zustand zuerst, nicht Anatomie. Kein Yoga-Vokabular.`;
  }

  if (type === 'hooks') {
    return `Generiere 5 Hook-Varianten fuer JOGA.
Thema/Move: ${params.thema}

Format: je 1 Satz. Direkt. Mix aus provokant, einladend, humorvoll, ehrlich.
Danach: 1 Satz welche Hook am staerksten ist und warum.`;
  }

  if (type === 'verpacken') {
    return `Ich habe einen fertigen JOGA-Flow. Verpacke ihn fuer TikTok.

Thema/Titel: ${params.thema}
Mein Ablauf: ${params.ablauf}

Liefere NUR:
HOOK: (1 Satz, der neugierig macht – nicht den Ablauf beschreiben)
TEXTSUPER: (1-3 Woerter fuer Video-Overlay)
DREHANLEITUNG: (2-3 Saetze: Kamera, Tempo, worauf achten)
CAPTION: (TikTok-ready, mit #joga #nichtyoga)
HASHTAGS: (5-7 relevante Tags)
ENDGEFUEHL: (1 Satz was der Zuschauer danach fuehlt)

Den Ablauf NICHT veraendern. Nur verpacken. Kein Yoga-Vokabular.`;
  }
if (type === 'woche_planen') {
    return `Du planst die naechste Woche (7 Folgen) der JOGA-Serie "100 Tage gegen den Stillstand".

Hier die Performance-Daten der laufenden Woche (pro Folge, oft mit TikTok- und YouTube-Werten):
${params.performance}

Aufgabe: Schlage 7 neue Folgen vor (eine pro Tag), die auf diesen Daten aufbauen.

Regeln:
- Was gut lief (hohe Watchtime, Saves, Abos – besonders auf YouTube), wird als Muster fortgefuehrt.
- Wiederkehrende Serien-Motive nutzen: "Der Boden luegt nicht" und "Der Koerper ist kein Campingstuhl".
- NICHT jede Folge gleich aufbauen. Mische: einige mit Mini-Konflikt (ich dachte / dann / heute), einige reine Beobachtung. Sonst wird es Formel.
- Gegner ist der Stillstand, nie der faule Mensch. Verstaendnis statt Schuld.
- Oliver ist der Beweis, nicht das Vorbild. Handstand nur als Beweis, nie Selbstzweck.
- Hoffnung/Freiheit sind Ergebnisse beim Zuschauer, nie Olivers Vokabular. Keine Trauer als Leitgefuehl.
- Bewegungsformat: Bewegung ab Sekunde 1, Hook als Text drueber, ca. 40-50 Sek.

Liefere fuer jede der 7 Folgen:
TAG:
TITEL:
HOOK: (1 Satz, Neugier in Sekunde 1)
TYP: (Konflikt oder Beobachtung)
MOVE: (kurz, nachmachbar)
SCHLUSS: (1 Satz)
YOUTUBE-TITEL: (konkret und suchbar, mit Nutzen – z.B. "Mach das fuer die Schultern")

Direkt liefern, kein Vorwort.`;
  }
  return `JOGA Content fuer: ${JSON.stringify(params)}. Direkt und praegnant.`;
}

async function callClaude(prompt, apiKey) {
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
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Claude API error');
  return data.content[0].text;
}

async function callGPT(prompt, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: JOGA_BRAIN },
        { role: 'user', content: prompt }
      ]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');
  return data.choices[0].message.content;
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
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const prompt = buildPrompt(type, params);

    // Call both in parallel
    const [claudeResult, gptResult] = await Promise.allSettled([
      anthropicKey ? callClaude(prompt, anthropicKey) : Promise.reject(new Error('No Anthropic key')),
      openaiKey ? callGPT(prompt, openaiKey) : Promise.reject(new Error('No OpenAI key'))
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        claude: claudeResult.status === 'fulfilled' ? claudeResult.value : null,
        claudeError: claudeResult.status === 'rejected' ? claudeResult.reason.message : null,
        gpt: gptResult.status === 'fulfilled' ? gptResult.value : null,
        gptError: gptResult.status === 'rejected' ? gptResult.reason.message : null,
      })
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
