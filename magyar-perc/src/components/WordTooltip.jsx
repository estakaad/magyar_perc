import { DEFAULT_UI } from '../ui';

export default function WordTooltip({ word, savedWords, onSave, onClose, style, ui = DEFAULT_UI }) {
  const isSaved = savedWords.some(w => w.word === word.word);
  const loading = !word.translation;

  return (
    <div
      className="absolute z-50 bg-white border border-stone-200 rounded-xl shadow-xl p-3 w-56"
      style={style}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-stone-800 text-base">{word.word}</span>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-sm ml-2 leading-none">✕</button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-1">
          <svg className="animate-spin h-3 w-3 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-stone-400 text-sm">{ui.translating}</span>
        </div>
      ) : (
        <>
          <div className="text-stone-600 text-sm mb-1">{word.translation}</div>
          {word.note && <div className="text-stone-400 text-xs mb-2 italic">{word.note}</div>}
          <button
            onClick={() => { onSave(word); onClose(); }}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${
              isSaved ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-600'
            }`}
          >
            {isSaved ? ui.word_saved : ui.word_save}
          </button>
        </>
      )}
    </div>
  );
}
