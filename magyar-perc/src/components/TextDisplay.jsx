import { useState, useRef, useEffect } from 'react';
import WordTooltip from './WordTooltip';
import { translateWord } from '../api';
import dict from '../data/hu_et_dict.json';

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
      setActiveWord(activeWord?.hu === known.hu ? null : known);
      return;
    }

    // Check static dictionary first
    const dictEntry = dict[clean.toLowerCase()];
    if (dictEntry) {
      setActiveWord({ hu: clean, et: dictEntry.et, note: dictEntry.note });
      return;
    }

    // Fall back to API
    setActiveWord({ hu: clean });
    try {
      const result = await translateWord(clean);
      setActiveWord({ hu: clean, et: result.et, note: result.note });
    } catch {
      setActiveWord({ hu: clean, et: '—', note: '' });
    }
  };

  const isWord = (token) => /[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/.test(token);

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
                isKnown
                  ? 'underline decoration-dotted decoration-amber-400 underline-offset-2'
                  : ''
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
        />
      )}
    </div>
  );
}
