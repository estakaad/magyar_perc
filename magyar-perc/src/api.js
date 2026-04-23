const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(messages, system = null, maxTokens = 1000) {
  const body = { model: MODEL, max_tokens: maxTokens, messages };
  if (system) body.system = system;

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
}

export async function generateText(theme, learningLang, nativeLang, level) {
  const prompt = `Write a natural ${level} ${learningLang} text (exactly 5 sentences) about one specific situation within the theme: "${theme}". Pick a narrow angle, not a general overview. Avoid rare words.

Return the text followed by ONLY this JSON (nothing else after the text):
{"words":[{"word":"word_from_text","translation":"${nativeLang} translation","note":"brief grammar note in ${nativeLang}"}]}

List 8-10 key words from the text.`;

  return callClaude([{ role: 'user', content: prompt }], null, 1000);
}

export async function translateWord(word, learningLang, nativeLang) {
  const prompt = `Translate the ${learningLang} word "${word}" to ${nativeLang}. Return ONLY JSON: {"translation":"translation","note":"brief grammar note in ${nativeLang} or empty string"}`;
  const text = await callClaude([{ role: 'user', content: prompt }], null, 200);
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match[0]);
}

export async function generateFillBlank(word, translation, learningLang, nativeLang, level) {
  const prompt = `Write a natural ${level} ${learningLang} sentence using "${word}" (meaning: "${translation}"), replacing it with ___. Return ONLY JSON, no markdown: {"sentence":"...___...","correct":"${word}","distractors":["w1","w2"]} — distractors must be same part of speech.`;
  const text = await callClaude([{ role: 'user', content: prompt }], null, 400);
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]);
}

export async function generateExamples(word, translation, learningLang, nativeLang) {
  const prompt = `Generate 3 natural B1-B2 ${learningLang} example sentences using "${word}" (meaning: "${translation}"). Return ONLY JSON, no markdown: {"examples":[{"word":"sentence","translation":"${nativeLang} translation"}]}`;
  const text = await callClaude([{ role: 'user', content: prompt }], null, 400);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { examples: [] };
  return JSON.parse(match[0]);
}

export async function generatePhrases(theme, learningLang, nativeLang, level) {
  const prompt = `Generate 5 real ${learningLang} idioms or set phrases for theme "${theme}", suitable for ${level}. Return ONLY JSON: {"phrases":[{"word":"phrase","literal":"word-for-word ${nativeLang}","meaning":"actual meaning in ${nativeLang}","example":"short example sentence"}]}`;
  const text = await callClaude([{ role: 'user', content: prompt }], null, 800);
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match[0]);
}
