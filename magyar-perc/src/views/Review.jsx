import { useState } from 'react';
import Flashcard from '../components/Flashcard';
import FillBlank from '../components/FillBlank';

export default function Review({ words }) {
  const savedWords = words.items;
  const [mode, setMode] = useState('cards'); // 'cards' | 'fill'
  const [queue, setQueue] = useState(null); // null = not started
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const startSession = () => {
    setQueue([...savedWords].sort(() => Math.random() - 0.5));
    setIndex(0);
    setWrong([]);
    setDone(false);
    setScore({ correct: 0, wrong: 0 });
  };

  const handleKnew = () => {
    const word = queue[index];
    words.updateStats(word.hu, 'correct');
    setScore(s => ({ ...s, correct: s.correct + 1 }));
    next(false);
  };

  const handleDidntKnow = () => {
    const word = queue[index];
    words.updateStats(word.hu, 'wrong');
    setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    setWrong(w => [...w, word]);
    next(true);
  };

  const next = (addedWrong) => {
    const nextIndex = index + 1;
    if (nextIndex < queue.length) {
      setIndex(nextIndex);
    } else if (wrong.length > 0 || addedWrong) {
      // Retry wrong words
      const retryQueue = addedWrong ? [...wrong, queue[index]] : [...wrong];
      setQueue(retryQueue);
      setIndex(0);
      setWrong([]);
    } else {
      setDone(true);
    }
  };

  const handleFillNext = (wasCorrect) => {
    setScore(s => wasCorrect ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 });
    const nextIndex = index + 1;
    if (nextIndex < queue.length) {
      setIndex(nextIndex);
    } else {
      setDone(true);
    }
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
      <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center">
        <div className="text-4xl mb-3">⭐</div>
        <p className="text-stone-500 text-lg">Lisa sõnu Loe vaates ⭐ nupuga.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMode('cards'); setQueue(null); setDone(false); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            mode === 'cards' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Kaardid
        </button>
        <button
          onClick={() => { setMode('fill'); setQueue(null); setDone(false); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            mode === 'fill' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Lünktäitmine
        </button>
      </div>

      {/* Not started */}
      {!queue && !done && (
        <div className="text-center py-8">
          <p className="text-stone-500 mb-2">{savedWords.length} sõna salvestatud</p>
          <button
            onClick={startSession}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
          >
            Alusta
          </button>
        </div>
      )}

      {/* Session */}
      {queue && !done && (
        <div>
          <div className="flex justify-between text-sm text-stone-400 mb-4">
            <span>{index + 1} / {queue.length}</span>
            <span className="text-green-600">✓ {score.correct} &nbsp; <span className="text-red-400">✗ {score.wrong}</span></span>
          </div>
          {mode === 'cards' ? (
            <Flashcard
              key={queue[index].hu}
              word={queue[index]}
              onKnew={handleKnew}
              onDidntKnow={handleDidntKnow}
            />
          ) : (
            <FillBlank
              key={queue[index].hu + index}
              word={queue[index]}
              onNext={handleFillNext}
            />
          )}
        </div>
      )}

      {/* Done */}
      {done && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-xl font-bold text-stone-800 mb-2">Sessioon lõppenud!</p>
          <p className="text-stone-500 mb-6">
            Õigesti: <span className="text-green-600 font-bold">{score.correct}</span>
            &nbsp;· Valesti: <span className="text-red-500 font-bold">{score.wrong}</span>
          </p>
          <button
            onClick={startSession}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
          >
            Uuesti
          </button>
        </div>
      )}
    </div>
  );
}
