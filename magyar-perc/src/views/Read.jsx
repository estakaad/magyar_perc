import { useState } from 'react';
import { generateTextStreaming } from '../api';
import TextDisplay from '../components/TextDisplay';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_UI } from '../ui';

const THEMES = [
  'igapäevaelu', 'toit ja köök', 'reisimine', 'transport', 'ilm',
  'perekond', 'töö ja kontor', 'tervis', 'ostlemine', 'aeg ja kuupäevad',
  'kodu', 'loodus', 'kultuur ja kunst', 'uudised', 'sport',
];

const CACHE_MAX = 30;

function cacheKey(settings) {
  return `textCache_${settings?.learning_lang || 'default'}_${settings?.native_lang || 'default'}`;
}

function loadCache(settings) {
  try { return JSON.parse(localStorage.getItem(cacheKey(settings)) || '[]'); } catch { return []; }
}

function saveToCache(settings, entry) {
  const cache = loadCache(settings).filter(c => !(c.theme === entry.theme && c.text === entry.text));
  localStorage.setItem(cacheKey(settings), JSON.stringify([entry, ...cache].slice(0, CACHE_MAX)));
}

export default function Read({ words, settings, ui = DEFAULT_UI }) {
  const [theme, setTheme] = useLocalStorage('lastTheme', 'everyday life');
  const [bodyText, setBodyText] = useState('');
  const [textWords, setTextWords] = useState([]);
  const [loading, setLoading] = useState(false);

  const hasCached = !!loadCache(settings).find(c => c.theme === theme);

  const handleGenerate = async () => {
    setLoading(true);
    setBodyText('');
    setTextWords([]);
    try {
      const result = await generateTextStreaming(
        theme,
        settings?.learning_lang || 'Hungarian',
        settings?.native_lang || 'Estonian',
        settings?.reading_level || 'B1',
        (partial) => {
          const jsonMatch = partial.match(/\{[\s\S]*"words"[\s\S]*\}/);
          if (jsonMatch) {
            setBodyText(partial.slice(0, partial.indexOf(jsonMatch[0])).trim());
          } else {
            setBodyText(partial);
          }
        }
      );
      const jsonMatch = result.match(/\{[\s\S]*"words"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const text = result.slice(0, result.indexOf(jsonMatch[0])).trim();
        const ws = parsed.words || [];
        setBodyText(text);
        setTextWords(ws);
        saveToCache(settings, { theme, text, words: ws, timestamp: Date.now() });
      } else {
        setBodyText(result.trim());
      }
    } catch {
      setBodyText('Viga teksti genereerimisel.');
    }
    setLoading(false);
  };

  const handleFromCache = () => {
    const all = loadCache(settings).filter(c => c.theme === theme);
    const others = all.filter(c => c.text !== bodyText);
    const pick = others.length > 0 ? others : all;
    if (pick.length === 0) return;
    const cached = pick[Math.floor(Math.random() * pick.length)];
    setBodyText(cached.text);
    setTextWords(cached.words || []);
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {THEMES.map(t => (
          <button
            key={t}
            onClick={() => { setTheme(t); setBodyText(''); setTextWords([]); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              theme === t ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {ui.generating}
            </>
          ) : ui.generate}
        </button>
        <button
          onClick={handleFromCache}
          disabled={!hasCached || loading}
          className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-600 font-semibold rounded-xl transition-colors"
        >
          {ui.from_cache}
        </button>
      </div>

      {bodyText && (
        <TextDisplay
          text={bodyText}
          words={textWords}
          savedWords={words.items}
          onSaveWord={words.add}
          settings={settings}
          ui={ui}
        />
      )}
    </div>
  );
}
