import { useState } from 'react';
import { LANGUAGES } from '../ui';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function Settings({ current, onSave, onBack, onDelete, email, existingLangs = [] }) {
  const [learningLang, setLearningLang] = useState(current?.learning_lang || 'Hungarian');
  const [nativeLang, setNativeLang] = useState(current?.native_lang || 'Estonian');
  const [readingLevel, setReadingLevel] = useState(current?.reading_level || 'B1');
  const [productionLevel, setProductionLevel] = useState(current?.production_level || 'B1');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOnboarding = !current;
  const availableLangs = LANGUAGES.filter(l => !existingLangs.includes(l.value));

  const handleSave = async () => {
    setSaving(true);
    await onSave({ learning_lang: learningLang, native_lang: nativeLang, reading_level: readingLevel, production_level: productionLevel });
    setSaving(false);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {isOnboarding ? (
        <div className="text-center mb-8 pt-8">
          <div className="text-4xl mb-3">📚</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-1">Tere tulemast!</h2>
          <p className="text-stone-500">Seadista oma keeleõpe</p>
        </div>
      ) : (
        <div className="pt-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            {onBack && <button onClick={onBack} className="text-stone-400 hover:text-stone-600">←</button>}
            <h2 className="text-lg font-bold text-stone-800">Seaded</h2>
          </div>
          {email && <p className="text-sm text-stone-400">{email}</p>}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Õpin keelt</label>
          <select
            value={learningLang}
            onChange={e => setLearningLang(e.target.value)}
            disabled={!!current}
            className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-amber-400 disabled:opacity-50"
          >
            {(current ? LANGUAGES : availableLangs).map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Minu emakeel</label>
          <select
            value={nativeLang}
            onChange={e => setNativeLang(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-amber-400"
          >
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Lugemise tase</label>
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setReadingLevel(l)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${readingLevel === l ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Harjutuste tase</label>
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setProductionLevel(l)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${productionLevel === l ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-semibold rounded-xl transition-colors"
        >
          {saving ? 'Salvestan...' : isOnboarding ? 'Alusta →' : 'Salvesta'}
        </button>

        {onDelete && (
          confirmDelete ? (
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm">Tühista</button>
              <button onClick={onDelete} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium">Kustuta profiil</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="w-full py-2 text-red-400 hover:text-red-600 text-sm transition-colors">
              Kustuta see keeleprofiin
            </button>
          )
        )}
      </div>
    </div>
  );
}
