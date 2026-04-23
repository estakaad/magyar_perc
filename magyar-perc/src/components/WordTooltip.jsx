export default function WordTooltip({ word, savedWords, onSave, onClose, style }) {
  const isSaved = savedWords.some(w => w.hu === word.hu);

  return (
    <div
      className="absolute z-50 bg-white border border-stone-200 rounded-xl shadow-xl p-3 w-56"
      style={style}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-stone-800 text-base">{word.hu}</span>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-sm ml-2 leading-none">✕</button>
      </div>
      <div className="text-stone-600 text-sm mb-1">{word.et}</div>
      {word.note && (
        <div className="text-stone-400 text-xs mb-2 italic">{word.note}</div>
      )}
      <button
        onClick={() => { onSave(word); onClose(); }}
        className={`text-xs px-2 py-1 rounded-lg transition-colors ${
          isSaved
            ? 'bg-amber-100 text-amber-600'
            : 'bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-600'
        }`}
      >
        {isSaved ? '★ Salvestatud' : '☆ Salvesta'}
      </button>
    </div>
  );
}
