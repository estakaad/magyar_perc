const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(messages, system = null, maxTokens = 1000) {
  const body = { model: MODEL, max_tokens: maxTokens, messages };
  if (system) body.system = system;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API viga: ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
}

export async function generateText(theme) {
  const prompt = `Genereeri ungarikeelne tekst tasemel B1-B2.
Teema: ${theme}.
Pikkus: täpselt 5 lauset.
Stiil: loomulik, konkreetne, ühe kitsa olukorra või tegevuse kirjeldus — mitte üldine ülevaade teemast.
Vali alati mingi spetsiifiline nurk: nt "igapäevaelu" puhul mitte "minu päev" vaid nt "rattaga tööle sõitmine" või "naabriga liftis kohtumine". "Toit ja köök" puhul mitte "mulle meeldib süüa" vaid nt "küüslaugu koorimine" või "poe lähituleviku ostunimekirja koostamine".
Väldi liiga haruldasi sõnu.

Lisa teksti lõppu AINULT JSON-blokk (mitte midagi muud peale teksti ja JSON-i):
{"words": [{"hu": "sõna_tekstist", "et": "eesti_tõlge", "note": "lühike grammatikanote"}]}

Loetle 8-10 tekstis esinevat kasulikku sõna. Note näited: "tagasõna + -ban/-ben", "-t akusatiiv", "mitmus -k".`;

  return callClaude([{ role: 'user', content: prompt }], null, 800);
}

export async function explainSentence(sentence) {
  const prompt = `Selgita lühidalt selle ungarikeelse lause grammatikat eesti keeles.
Ole praktiline — mis vorm on, miks kasutatakse.
Mitte rohkem kui 4 lauset.
Lause: ${sentence}`;

  return callClaude([{ role: 'user', content: prompt }]);
}

export async function generateFillBlank(word, translation) {
  const prompt = `Tee loomulik ungarikeelne B1-tasemel lause sõnaga "${word}" (tõlge: "${translation}").
Asenda sõna kolme allkriipsuga ___.
Tagasta AINULT JSON, ilma preamblita:
{
  "sentence": "lause ___ asendusega",
  "correct": "õige_sõna",
  "distractors": ["eksitav1", "eksitav2"]
}
Eksitavad sõnad olgu sama sõnaliik, natuke sarnased.`;

  const text = await callClaude([{ role: 'user', content: prompt }]);
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match[0]);
}

export async function chat(messages) {
  const system = `Sa oled ungari keele õpetaja. Kasutaja räägib eesti keelt ja õpib ungari keelt tasemel B1-B2 (pikk paus, harjutab uuesti).
Vasta lühidalt ja praktiliselt eesti keeles.
Kasuta ungarikeelseid näiteid koos tõlgetega.
Ära loe loengut — vasta ainult küsimusele.
Maksimaalne vastuse pikkus: 150 sõna.`;

  return callClaude(messages, system);
}
