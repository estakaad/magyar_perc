import { useState } from 'react';
import Flashcard from '../components/Flashcard';
import FillBlank from '../components/FillBlank';

const today = () => new Date().toISOString().split('T')[0];

export default function Review({ words, settings }) {
  const savedWords = words.items;
  const dueWords = savedWords.filter(w => !w.next_review || w.next_review <= today());
  const upcomingCount = savedWords.length - dueWords.length;

  const [mode, setMode] = useState('cards');
  const [queue, setQueue] = useState(null);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState({ easy: 0, ok: 0, hard: 0 });

  const startSession = (all = false) => {
    const source = all ? savedWords : dueWords;
    setQueue([...source].sort(() => Math.random() - 0.5));
    setIndex(0);
    setDone(false);
    setScore({ easy: 0, ok: 0, hard: 0 });
  };

  const handleAnswer = (difficulty) => {
    const word = queue[index];
    words.updateReview(word.word, difficulty);
    words.updateStats(word.word, difficulty === 'hard' ? 'wrong' : 'correct');
    setScore(s => ({ ...s, [difficulty]: s[difficulty] + 1 }));
    if (index + 1 < queue.length) setIndex(i => i + 1);
    else setDone(true);
  };

  const handleFillNext = (wasCorrect) => {
    const word = queue[index];
    words.updateReview(word.word, wasCorrect ? 'ok' : 'hard');
    if (index + 1 < queue.length) setIndex(i => i + 1);
    else setDone(true);
  };

  if (!words.ready) {
    return (
      <div className="flex justify-center py-16">
        <svg className="animate-spin h-6 w-6 text-amber-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (savedWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="text-4xl mb-3">⭐</div>
        <p className="text-stone-500 text-lg">Lisa sõnu Loe vaates ⭐ nupuga.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMode('cards'); setQueue(null); setDone(false); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'cards' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
        >
          Kaardid
        </button>
        <button
          onClick={() => { setMode('fill'); setQueue(null); setDone(false); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'fill' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
        >
          Lünktäitmine
        </button>
      </div>

      {!queue && !done && (
        <div className="text-center py-8">
          {dueWords.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-stone-800 mb-1">{dueWords.length}</p>
              <p className="text-stone-500 mb-1">sõna täna korrata</p>
              {upcomingCount > 0 && (
                <p className="text-stone-400 text-sm mb-4">{upcomingCount} sõna tuleb hiljem</p>
              )}
              <button onClick={() => startSession(false)} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors mb-2">
                Alusta tänastega
              </button>
              <button onClick={() => startSession(true)} className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors text-sm">
                Korda kõiki ({savedWords.length})
              </button>
            </>
          ) : (
            <div>
              <div className="text-4xl mb-3">✓</div>
              <p className="text-stone-700 font-medium mb-1">Täna on kõik tehtud!</p>
              {upcomingCount > 0 && <p className="text-stone-400 text-sm mb-4">{upcomingCount} sõna tuleb järgmistel päevadel</p>}
              <button onClick={() => startSession(true)} className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold rounded-xl transition-colors">
                Korda kõiki ({savedWords.length})
              </button>
            </div>
          )}
        </div>
      )}

      {queue && !done && (
        <div>
          <div className="flex justify-between text-sm text-stone-400 mb-4">
            <span>{index + 1} / {queue.length}</span>
            <span>🟢 {score.easy} · 🟡 {score.ok} · 🔴 {score.hard}</span>
          </div>
          {mode === 'cards' ? (
            <Flashcard key={queue[index].word} word={queue[index]} onAnswer={handleAnswer} settings={settings} />
          ) : (
            <FillBlank key={queue[index].word + index} word={queue[index]} onNext={handleFillNext} settings={settings} />
          )}
        </div>
      )}

      {done && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-xl font-bold text-stone-800 mb-2">Sessioon lõppenud!</p>
          <div className="flex justify-center gap-4 text-sm mb-6">
            <span className="text-green-600">Lihtne: {score.easy}</span>
            <span className="text-amber-600">Okei: {score.ok}</span>
            <span className="text-red-500">Raske: {score.hard}</span>
          </div>
          <button
            onClick={() => { setQueue(null); setDone(false); }}
            className="px-8 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold rounded-xl transition-colors"
          >
            Tagasi
          </button>
        </div>
      )}
    </div>
  );
}
