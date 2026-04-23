import { useState, useEffect, useCallback } from 'react';
import { generateFillBlank } from '../api';

export default function FillBlank({ word, exercise: preGenerated, onNext, settings }) {
  const [exercise, setExercise] = useState(preGenerated || null);
  const [options, setOptions] = useState(
    preGenerated ? [...preGenerated.distractors, preGenerated.correct].sort(() => Math.random() - 0.5) : []
  );
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(!preGenerated);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (preGenerated) return;
    let cancelled = false;
    setLoading(true);
    setExercise(null);
    setSelected(null);
    setError('');

    generateFillBlank(
      word.word,
      word.translation,
      settings?.learning_lang || 'Hungarian',
      settings?.native_lang || 'Estonian',
      settings?.production_level || 'B1'
    )
      .then(result => {
        if (cancelled) return;
        setExercise(result);
        setOptions([...result.distractors, result.correct].sort(() => Math.random() - 0.5));
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[FillBlank] error:', err);
        setError('Viga ülesande genereerimisel');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [word?.word, preGenerated, settings]);

  useEffect(() => {
    return load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-stone-500">
        <p className="mb-4">{error}</p>
        <button onClick={load} className="text-amber-600 underline">Proovi uuesti</button>
      </div>
    );
  }

  const isCorrect = selected === exercise.correct;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="text-sm text-stone-400 mb-1 font-medium">Täida lünk</div>
      <p className="text-xl text-stone-800 mb-6 leading-relaxed font-medium">
        {exercise.sentence.replace('___', '______')}
      </p>
      <div className="flex flex-col gap-2 mb-4">
        {options.map(opt => {
          let cls = 'w-full py-3 px-4 rounded-xl text-left font-medium transition-colors border ';
          if (!selected) {
            cls += 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700';
          } else if (opt === exercise.correct) {
            cls += 'bg-green-50 border-green-300 text-green-700';
          } else if (opt === selected) {
            cls += 'bg-red-50 border-red-300 text-red-600';
          } else {
            cls += 'bg-stone-50 border-stone-200 text-stone-400';
          }
          return (
            <button key={opt} onClick={() => !selected && setSelected(opt)} className={cls}>
              {opt}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className={`rounded-xl p-3 mb-4 text-sm ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isCorrect ? '✓ Õige!' : `✗ Õige vastus: ${exercise.correct}`}
        </div>
      )}
      {selected && (
        <button
          onClick={() => onNext(isCorrect)}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
        >
          Järgmine →
        </button>
      )}
    </div>
  );
}
