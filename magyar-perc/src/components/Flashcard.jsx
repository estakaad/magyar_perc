import { useState } from 'react';

export default function Flashcard({ word, onAnswer }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
      <div className="text-4xl font-bold text-stone-800 mb-1">{word.hu}</div>
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-6 px-8 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-medium transition-colors"
        >
          Näita
        </button>
      ) : (
        <div className="mt-4">
          <div className="text-2xl text-stone-600 mb-1">{word.et}</div>
          {word.note && (
            <div className="text-sm text-stone-400 italic mb-6">{word.note}</div>
          )}
          <div className="flex gap-2 mt-6">
            <button onClick={() => onAnswer('hard')} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm">
              Raske
            </button>
            <button onClick={() => onAnswer('ok')} className="flex-1 py-3 bg-amber-50 text-amber-600 rounded-xl font-medium hover:bg-amber-100 transition-colors text-sm">
              Okei
            </button>
            <button onClick={() => onAnswer('easy')} className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition-colors text-sm">
              Lihtne
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
