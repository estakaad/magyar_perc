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

export async function generateTextStreaming(theme, learningLang, nativeLang, level, onChunk) {
  const prompt = `Write a natural ${level} ${learningLang} text (exactly 5 sentences) about one specific situation within the theme: "${theme}". Pick a narrow angle, not a general overview. Avoid rare words.

Return the text followed by ONLY this JSON (nothing else after the text):
{"words":[{"word":"word_from_text","translation":"${nativeLang} translation","note":"brief grammar note in ${nativeLang}"}]}

List 8-10 key words from the text.`;

  const body = {
    model: MODEL, max_tokens: 1000, stream: true,
    messages: [{ role: 'user', content: prompt }],
  };

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          fullText += parsed.delta.text;
          onChunk(fullText);
        }
      } catch {}
    }
  }
  return fullText;
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

export async function generateUITranslations(learningLang) {
  const prompt = `Translate these Estonian UI strings to ${learningLang}. Keep them short and natural (1-3 words each). Return ONLY valid JSON with the same keys:
${JSON.stringify({
  tab_read: 'Loe', tab_review: 'Korda', tab_phrases: 'Väljendid',
  generate: 'Genereeri', from_cache: 'Vahemälust', generating: 'Genereerin...',
  cards: 'Kaardid', fill_blank_mode: 'Lünktäitmine',
  words_due: 'sõna täna korrata', words_upcoming: 'sõna tuleb hiljem',
  start_today: 'Alusta tänastega', review_all: 'Korda kõiki',
  all_done: 'Täna on kõik tehtud!', words_coming_next: 'sõna tuleb järgmistel päevadel',
  session_done: 'Sessioon lõppenud!', easy: 'Lihtne', ok: 'Okei', hard: 'Raske',
  back: 'Tagasi', loading_examples: 'Laen näitelauseid...', fill_blank_title: 'Täida lünk',
  next: 'Järgmine →', correct: '✓ Õige!', wrong_prefix: '✗ Õige vastus:',
  exercise_error: 'Viga ülesande genereerimisel', try_again: 'Proovi uuesti',
  generate_phrases: 'Genereeri väljendid', review_btn: 'Korda',
  tap_for_explanation: 'vajuta selgituse nägemiseks', word_for_word: 'sõna-sõnalt',
  save_phrases_hint: 'Salvesta väljendeid tärniga', show: 'Näita',
  to_start: 'Algusesse ↺', translating: 'Tõlgin...', word_saved: '★ Salvestatud',
  word_save: '☆ Salvesta', add_words_hint: 'Lisa sõnu Loe vaates ⭐ nupuga.',
  no_saved_phrases: 'Salvesta väljendeid tärniga',
})}`;
  const text = await callClaude([{ role: 'user', content: prompt }], null, 1000);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

export async function generatePhrases(theme, learningLang, nativeLang, level) {
  const prompt = `Generate 5 real ${learningLang} idioms or set phrases for theme "${theme}", suitable for ${level}. Return ONLY JSON: {"phrases":[{"word":"phrase","literal":"word-for-word ${nativeLang}","meaning":"actual meaning in ${nativeLang}","example":"short example sentence"}]}`;
  const text = await callClaude([{ role: 'user', content: prompt }], null, 800);
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match[0]);
}
