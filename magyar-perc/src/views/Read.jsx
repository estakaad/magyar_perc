import { useState } from 'react';
import { generateText, explainSentence } from '../api';
import TextDisplay from '../components/TextDisplay';
import { useLocalStorage } from '../hooks/useLocalStorage';

const THEMES = [
  'igapäevaelu', 'toit ja köök', 'reisimine', 'transport', 'ilm',
  'perekond', 'töö ja kontor', 'tervis', 'ostlemine', 'aeg ja kuupäevad',
  'kodu', 'loodus', 'kultuur ja kunst', 'uudised', 'sport',
];

function Spinner({ small }) {
  const size = small ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <svg className={`animate-spin ${size} text-white`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function Read({ savedWords, setSavedWords }) {
  const [theme, setTheme] = useLocalStorage('lastTheme', 'igapäevaelu');
  const [bodyText, setBodyText] = useState('');
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [explainMode, setExplainMode] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setBodyText('');
    setWords([]);
    setExplanation('');
    setExplainMode(false);
    try {
      const result = await generateText(theme);
      const jsonMatch = result.match(/\{[\s\S]*"words"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setWords(parsed.words || []);
        setBodyText(result.slice(0, result.indexOf(jsonMatch[0])).trim());
      } else {
        setBodyText(result.trim());
      }
    } catch {
      setBodyText('Viga teksti genereerimisel. Kontrolli API võtit ja proovi uuesti.');
    }
    setLoading(false);
  };

  const handleSentenceClick = async (sentence) => {
    if (!explainMode || explainLoading) return;
    setExplainLoading(true);
    setExplanation('');
    try {
      const result = await explainSentence(sentence.trim());
      setExplanation(result);
    } catch {
      setExplanation('Viga selgituse saamisel.');
    }
    setExplainLoading(false);
  };

  const handleSaveWord = (word) => {
    setSavedWords(prev => {
      if (prev.some(w => w.hu === word.hu)) return prev;
      return [...prev, word];
    });
  };

  // Split into sentences for explain mode
  const sentences = bodyText
    ? bodyText.split(/(?<=[.!?])\s+/).filter(Boolean)
    : [];

  return (
    <div className="p-4">
      {/* Theme pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
        {THEMES.map(t => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
              theme === t
                ? 'bg-amber-500 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-semibold rounded-xl mb-4 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <><Spinner small /> Genereerin...</> : 'Genereeri tekst'}
      </button>

      {/* Text */}
      {bodyText && (
        <div className="mb-4">
          {explainMode ? (
            <div className="text-lg leading-relaxed text-stone-800">
              {sentences.map((s, i) => (
                <span
                  key={i}
                  onClick={() => handleSentenceClick(s)}
                  className="cursor-pointer hover:bg-amber-50 rounded px-0.5 transition-colors"
                >
                  {s}{' '}
                </span>
              ))}
            </div>
          ) : (
            <TextDisplay
              text={bodyText}
              words={words}
              savedWords={savedWords}
              onSaveWord={handleSaveWord}
            />
          )}
        </div>
      )}

      {/* Explain toggle */}
      {bodyText && (
        <button
          onClick={() => { setExplainMode(!explainMode); setExplanation(''); }}
          className={`text-sm px-3 py-1.5 rounded-lg mb-3 transition-colors ${
            explainMode
              ? 'bg-amber-100 text-amber-700'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          {explainMode ? '✕ Lõpeta' : '💡 Selgita lauset'}
        </button>
      )}

      {/* Explanation */}
      {explainMode && bodyText && !explanation && !explainLoading && (
        <p className="text-stone-400 text-sm italic">Vajuta lausele selgituse saamiseks</p>
      )}
      {explainLoading && (
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}
      {explanation && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-stone-700 text-sm leading-relaxed">
          {explanation}
        </div>
      )}
    </div>
  );
}
