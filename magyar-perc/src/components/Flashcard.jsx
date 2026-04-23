import { useState, useEffect } from 'react';
import { generateExamples } from '../api';
import { DEFAULT_UI } from '../ui';

export default function Flashcard({ word, onAnswer, settings, ui = DEFAULT_UI }) {
  const [examples, setExamples] = useState(word.examples || null);

  useEffect(() => {
    if (word.examples && word.examples.length > 0) {
      setExamples(word.examples);
      return;
    }
    if (!word.translation) return;
    let cancelled = false;
    generateExamples(
      word.word,
      word.translation,
      settings?.learning_lang || 'Hungarian',
      settings?.native_lang || 'Estonian'
    )
      .then(result => { if (!cancelled) setExamples(result.examples || []); })
      .catch(() => { if (!cancelled) setExamples([]); });
    return () => { cancelled = true; };
  }, [word.word]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="text-3xl font-bold text-stone-800 mb-1">{word.word}</div>
      <div className="text-xl text-stone-500 mb-1">{word.translation}</div>
      {word.note && <div className="text-sm text-stone-400 italic mb-3">{word.note}</div>}

      <div className="mt-3 space-y-2 min-h-[80px]">
        {examples === null ? (
          <div className="flex items-center gap-2 text-xs text-stone-400 py-2">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {ui.loading_examples}
          </div>
        ) : examples.length > 0 ? (
          examples.map((ex, i) => (
            <div key={i} className="bg-stone-50 rounded-xl px-4 py-2.5">
              <div className="text-sm text-stone-700">{ex.word || ex.hu}</div>
              <div className="text-xs text-stone-400 mt-0.5">{ex.translation || ex.et}</div>
            </div>
          ))
        ) : null}
      </div>

      <div className="flex gap-2 mt-5">
        <button onClick={() => onAnswer('easy')} className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition-colors text-sm">
          {ui.easy}
        </button>
        <button onClick={() => onAnswer('ok')} className="flex-1 py-3 bg-amber-50 text-amber-600 rounded-xl font-medium hover:bg-amber-100 transition-colors text-sm">
          {ui.ok}
        </button>
        <button onClick={() => onAnswer('hard')} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm">
          {ui.hard}
        </button>
      </div>
    </div>
  );
}
