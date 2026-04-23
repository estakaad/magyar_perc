import { useState, useRef, useEffect } from 'react';
import WordTooltip from './WordTooltip';
import { translateWord } from '../api';
import { DEFAULT_UI } from '../ui';

export default function TextDisplay({ text, words, savedWords, onSaveWord, settings, ui = DEFAULT_UI }) {
  const [activeWord, setActiveWord] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    const close = () => setActiveWord(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const wordMap = {};
  words.forEach(w => { wordMap[w.word.toLowerCase()] = w; });

  const tokens = text.split(/(\s+|[.,!?;:„"()\[\]\-–—«»])/);

  const handleWordClick = async (e, token) => {
    e.stopPropagation();
    const clean = token.replace(/[.,!?;:„"()\[\]\-–—«»]/g, '').trim();
    if (!clean) return;

    const rect = e.target.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const left = Math.max(0, Math.min(rect.left - containerRect.left, containerRect.width - 232));
    setTooltipStyle({ top: rect.bottom - containerRect.top + 6, left });

    const known = wordMap[clean.toLowerCase()];
    if (known) {
      setActiveWord(activeWord?.word === known.word ? null : known);
      return;
    }

    setActiveWord({ word: clean });
    try {
      const result = await translateWord(clean, settings?.learning_lang || 'Hungarian', settings?.native_lang || 'Estonian');
      setActiveWord({ word: clean, translation: result.translation, note: result.note });
    } catch {
      setActiveWord({ word: clean, translation: '—', note: '' });
    }
  };

  const isWord = (token) => /\p{L}/u.test(token);

  return (
    <div ref={containerRef} className="relative text-lg leading-relaxed text-stone-800">
      {tokens.map((token, i) => {
        const clean = token.replace(/[.,!?;:„"()\[\]\-–—«»]/g, '').toLowerCase();
        const isKnown = !!wordMap[clean];

        if (isWord(token)) {
          return (
            <button
              key={i}
              onClick={e => handleWordClick(e, token)}
              className={`rounded px-0.5 transition-colors cursor-pointer hover:bg-amber-50 ${
                isKnown ? 'underline decoration-dotted decoration-amber-400 underline-offset-2' : ''
              }`}
            >
              {token}
            </button>
          );
        }
        return <span key={i}>{token}</span>;
      })}
      {activeWord && (
        <WordTooltip
          word={activeWord}
          savedWords={savedWords}
          onSave={onSaveWord}
          onClose={() => setActiveWord(null)}
          style={tooltipStyle}
          ui={ui}
        />
      )}
    </div>
  );
}
