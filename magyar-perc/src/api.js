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

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
}

export async function generateText(theme) {
  const prompt = `Write a natural B1-B2 Hungarian text (exactly 5 sentences) about one specific situation within the theme: "${theme}". Pick a narrow angle, not a general overview. Avoid rare words.

Return the text followed by ONLY this JSON (nothing else after the text):
{"words":[{"hu":"word_from_text","et":"Estonian translation","note":"brief grammar note"}],"exercises":[{"sentence":"sentence with ___","correct":"correct_word","distractors":["w1","w2"]}]}

List 8-10 key words. Include 5 fill-in-the-blank exercises using words from the text. Distractors should be the same part of speech.`;

  return callClaude([{ role: 'user', content: prompt }], null, 1000);
}

export async function translateWord(word) {
  const prompt = `Translate the Hungarian word "${word}" to Estonian. Return ONLY JSON: {"et":"translation","note":"brief grammar note or empty string"}`;
  const text = await callClaude([{ role: 'user', content: prompt }], null, 200);
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match[0]);
}

export async function explainSentence(sentence) {
  const prompt = `Briefly explain the grammar of this Hungarian sentence in Estonian (max 4 sentences, practical focus). Sentence: ${sentence}`;
  return callClaude([{ role: 'user', content: prompt }], null, 400);
}

export async function generateFillBlank(word, translation) {
  const prompt = `Write a natural B1-level Hungarian sentence using "${word}" (meaning: "${translation}"), replacing it with ___. Return ONLY JSON: {"sentence":"...___...","correct":"${word}","distractors":["w1","w2"]} — distractors must be same part of speech.`;
  const text = await callClaude([{ role: 'user', content: prompt }], null, 300);
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match[0]);
}

export async function generatePhrases(theme) {
  const prompt = `Generate 5 real Hungarian idioms or set phrases for theme "${theme}", suitable for B1-B2. Return ONLY JSON: {"phrases":[{"hu":"phrase","literal":"word-for-word Estonian","meaning":"actual meaning in Estonian","example":"short example sentence"}]}`;
  const text = await callClaude([{ role: 'user', content: prompt }], null, 800);
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match[0]);
}
