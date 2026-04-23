import { useState, useRef, useEffect } from 'react';
import WordTooltip from './WordTooltip';

export default function TextDisplay({ text, words, savedWords, onSaveWord }) {
  const [activeWord, setActiveWord] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    const close = () => setActiveWord(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const wordMap = {};
  words.forEach(w => { wordMap[w.hu.toLowerCase()] = w; });

  // Tokenize preserving whitespace and punctuation
  const tokens = text.split(/(\s+|[.,!?;:„"()\[\]\-–—«»])/);

  const handleWordClick = (e, wordObj) => {
    e.stopPropagation();
    if (activeWord?.hu === wordObj.hu) {
      setActiveWord(null);
      return;
    }
    const rect = e.target.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const left = Math.min(
      rect.left - containerRect.left,
      containerRect.width - 232
    );
    setTooltipStyle({ top: rect.bottom - containerRect.top + 6, left: Math.max(0, left) });
    setActiveWord(wordObj);
  };

  return (
    <div ref={containerRef} className="relative text-lg leading-relaxed text-stone-800">
      {tokens.map((token, i) => {
        const clean = token.replace(/[.,!?;:„"()\[\]\-–—«»]/g, '').toLowerCase();
        const wordObj = clean.length > 0 ? wordMap[clean] : null;
        if (wordObj) {
          return (
            <button
              key={i}
              onClick={e => handleWordClick(e, wordObj)}
              className="underline decoration-dotted decoration-amber-400 underline-offset-2 cursor-pointer hover:bg-amber-50 rounded px-0.5 transition-colors"
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
        />
      )}
    </div>
  );
}
