import { useState } from 'react';
import { generatePhrases } from '../api';

const THEMES = [
  'üldised', 'emotsioonid', 'argielust', 'toit', 'aeg', 'raha',
  'töö', 'suhted', 'ilm', 'keha', 'loodus', 'liikumine',
];

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function PhraseCard({ phrase, savedPhrases, onSave }) {
  const [revealed, setRevealed] = useState(false);
  const isSaved = savedPhrases.some(p => p.hu === phrase.hu);

  return (
    <div
      className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 cursor-pointer select-none"
      onClick={() => setRevealed(r => !r)}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-lg font-semibold text-stone-800">{phrase.hu}</p>
        <button
          onClick={e => { e.stopPropagation(); onSave(phrase); }}
          className={`text-lg flex-shrink-0 transition-colors ${isSaved ? 'text-amber-400' : 'text-stone-300 hover:text-amber-400'}`}
        >
          {isSaved ? '★' : '☆'}
        </button>
      </div>
      {revealed && (
        <div className="mt-3 space-y-1.5 border-t border-stone-100 pt-3">
          <p className="text-sm text-stone-400 italic">sõna-sõnalt: {phrase.literal}</p>
          <p className="text-sm text-stone-700 font-medium">→ {phrase.meaning}</p>
          <p className="text-sm text-stone-500 mt-1">📝 {phrase.example}</p>
        </div>
      )}
      {!revealed && (
        <p className="text-xs text-stone-300 mt-1">vajuta selgituse nägemiseks</p>
      )}
    </div>
  );
}

function ReviewMode({ savedPhrases, onBack }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (savedPhrases.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-3xl mb-2">☆</p>
        <p>Salvesta väljendeid tärniga</p>
        <button onClick={onBack} className="mt-4 text-amber-600 text-sm underline">← tagasi</button>
      </div>
    );
  }

  const phrase = savedPhrases[index];
  const isLast = index === savedPhrases.length - 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-stone-400 text-sm hover:text-stone-600">← tagasi</button>
        <span className="text-sm text-stone-400">{index + 1} / {savedPhrases.length}</span>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 text-center">
        <p className="text-2xl font-bold text-stone-800 mb-4">{phrase.hu}</p>
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-medium transition-colors"
          >
            Näita
          </button>
        ) : (
          <div className="space-y-2 text-left border-t border-stone-100 pt-4">
            <p className="text-sm text-stone-400 italic">sõna-sõnalt: {phrase.literal}</p>
            <p className="text-stone-700 font-medium">→ {phrase.meaning}</p>
            <p className="text-sm text-stone-500">📝 {phrase.example}</p>
            <button
              onClick={() => { setIndex(isLast ? 0 : index + 1); setRevealed(false); }}
              className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              {isLast ? 'Algusesse ↺' : 'Järgmine →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Phrases({ phrases }) {
  const [theme, setTheme] = useState('üldised');
  const [generated, setGenerated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const savedPhrases = phrases.items;

  const handleGenerate = async () => {
    setLoading(true);
    setGenerated([]);
    try {
      const result = await generatePhrases(theme);
      setGenerated(result.phrases || []);
    } catch {
      setGenerated([]);
    }
    setLoading(false);
  };

  const handleSave = (phrase) => phrases.toggle(phrase);

  if (reviewMode) {
    return (
      <div className="p-4">
        <ReviewMode savedPhrases={savedPhrases} onBack={() => setReviewMode(false)} />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Theme pills */}
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
          {loading ? <><Spinner /> Genereerin...</> : 'Genereeri väljendid'}
        </button>
        <button
          onClick={() => setReviewMode(true)}
          className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-medium transition-colors relative"
        >
          Korda
          {savedPhrases.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {savedPhrases.length}
            </span>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {generated.map((phrase, i) => (
          <PhraseCard
            key={i}
            phrase={phrase}
            savedPhrases={savedPhrases}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}
