import { useState, useEffect } from 'react';
import { generateText } from '../api';
import TextDisplay from '../components/TextDisplay';
import FillBlank from '../components/FillBlank';
import { useLocalStorage } from '../hooks/useLocalStorage';

const THEMES = [
  'igapäevaelu', 'toit ja köök', 'reisimine', 'transport', 'ilm',
  'perekond', 'töö ja kontor', 'tervis', 'ostlemine', 'aeg ja kuupäevad',
  'kodu', 'loodus', 'kultuur ja kunst', 'uudised', 'sport',
];

const CACHE_KEY = 'textCache';
const CACHE_MAX = 30;

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'); } catch { return []; }
}

function saveToCache(entry) {
  const cache = loadCache().filter(c => !(c.theme === entry.theme && c.text === entry.text));
  const next = [entry, ...cache].slice(0, CACHE_MAX);
  localStorage.setItem(CACHE_KEY, JSON.stringify(next));
}

function Spinner({ small }) {
  const size = small ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <svg className={`animate-spin ${size} text-white`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function Read({ words }) {
  const [theme, setTheme] = useLocalStorage('lastTheme', 'igapäevaelu');
  const [bodyText, setBodyText] = useState('');
  const [textWords, setTextWords] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showExercises, setShowExercises] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);

  useEffect(() => {
    const cached = loadCache().find(c => c.theme === theme);
    if (cached) {
      setBodyText(cached.text);
      setTextWords(cached.words || []);
      setExercises(cached.exercises || []);
      setFromCache(true);
    } else {
      setBodyText('');
      setTextWords([]);
      setExercises([]);
      setFromCache(false);
    }
    setShowExercises(false);
    setExerciseIndex(0);
  }, [theme]);

  const handleGenerate = async () => {
    setLoading(true);
    setBodyText('');
    setTextWords([]);
    setExercises([]);
    setShowExercises(false);
    setExerciseIndex(0);
    try {
      const result = await generateText(theme);
      const jsonMatch = result.match(/\{[\s\S]*"words"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const text = result.slice(0, result.indexOf(jsonMatch[0])).trim();
        const ws = parsed.words || [];
        const ex = parsed.exercises || [];
        setBodyText(text);
        setTextWords(ws);
        setExercises(ex);
        setFromCache(false);
        saveToCache({ theme, text, words: ws, exercises: ex, timestamp: Date.now() });
      } else {
        setBodyText(result.trim());
      }
    } catch {
      setBodyText('Viga teksti genereerimisel. Kontrolli API võtit ja proovi uuesti.');
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
        {THEMES.map(t => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
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
          {loading ? <><Spinner small /> Genereerin...</> : fromCache ? 'Genereeri uus' : 'Genereeri tekst'}
        </button>
      </div>

      {fromCache && bodyText && (
        <p className="text-xs text-stone-400 -mt-2 mb-3">vahemälust — vajuta "Genereeri uus" uue teksti saamiseks</p>
      )}

      {bodyText && !showExercises && (
        <div className="mb-4">
          <TextDisplay text={bodyText} words={textWords} savedWords={words.items} onSaveWord={words.add} />
        </div>
      )}

      {showExercises && exercises.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-stone-400">{exerciseIndex + 1} / {exercises.length}</span>
            <button onClick={() => setShowExercises(false)} className="text-sm text-stone-400 hover:text-stone-600">← tagasi</button>
          </div>
          <FillBlank
            key={exerciseIndex}
            exercise={exercises[exerciseIndex]}
            onNext={() => {
              if (exerciseIndex + 1 < exercises.length) setExerciseIndex(i => i + 1);
              else { setShowExercises(false); setExerciseIndex(0); }
            }}
          />
        </div>
      )}

      {bodyText && !showExercises && exercises.length > 0 && (
        <button
          onClick={() => { setShowExercises(true); setExerciseIndex(0); }}
          className="text-sm px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
        >
          ✏️ Harjuta ({exercises.length})
        </button>
      )}
    </div>
  );
}
