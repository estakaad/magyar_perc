import { useState } from 'react';

export default function Flashcard({ word, onKnew, onDidntKnow }) {
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
          <div className="flex gap-3 mt-6">
            <button
              onClick={onDidntKnow}
              className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors text-lg"
            >
              ✗ Ei teadnud
            </button>
            <button
              onClick={onKnew}
              className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl font-medium hover:bg-green-100 transition-colors text-lg"
            >
              ✓ Teadsin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
