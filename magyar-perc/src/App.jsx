import { useState } from 'react';
import AuthGate from './components/AuthGate';
import Read from './views/Read';
import Review from './views/Review';
import Settings from './views/Settings';
import { useSyncedList } from './hooks/useSync';
import { useSettings } from './hooks/useSettings';
import { DEFAULT_UI, LANGUAGES } from './ui';

const TABS = [
  { id: 'read', label: (ui) => ui.tab_read },
  { id: 'review', label: (ui) => ui.tab_review },
];

function ProfileSwitcher({ profiles, activeLang, onSwitch, onAdd, onClose }) {
  const getLangLabel = (val) => LANGUAGES.find(l => l.value === val)?.label || val;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center" onClick={onClose}>
      <div className="bg-white rounded-b-2xl w-full max-w-lg p-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <p className="text-xs text-stone-400 mb-3 font-medium">PROFIILID</p>
        <div className="space-y-2 mb-3">
          {profiles.map(p => (
            <button
              key={p.learning_lang}
              onClick={() => { onSwitch(p.learning_lang); onClose(); }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                p.learning_lang === activeLang
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {getLangLabel(p.learning_lang)} <span className="text-stone-400 font-normal text-sm">· {p.reading_level}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => { onAdd(); onClose(); }}
          className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-medium transition-colors"
        >
          + Lisa uus keel
        </button>
      </div>
    </div>
  );
}

function App({ email }) {
  const [activeTab, setActiveTab] = useState('read');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [addingNew, setAddingNew] = useState(false);

  const { settings, profiles, activeLang, ready: settingsReady, save: saveSettings, switchProfile, deleteProfile } = useSettings(email);
  const words = useSyncedList('words', email, activeLang);

  const ui = DEFAULT_UI;

  const getLangLabel = (val) => LANGUAGES.find(l => l.value === val)?.label || val;

  if (!settingsReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <svg className="animate-spin h-6 w-6 text-amber-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (profiles.length === 0 || addingNew) {
    return (
      <div className="min-h-screen bg-stone-50 max-w-lg mx-auto">
        <Settings
          onSave={async (s) => { await saveSettings(s); setAddingNew(false); }}
          onBack={profiles.length > 0 ? () => setAddingNew(false) : null}
          existingLangs={profiles.map(p => p.learning_lang)}
        />
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-stone-50 max-w-lg mx-auto">
        <Settings
          current={settings}
          onSave={async (s) => { await saveSettings(s); setShowSettings(false); }}
          onBack={() => setShowSettings(false)}
          onDelete={profiles.length > 1 ? () => { deleteProfile(activeLang); setShowSettings(false); } : null}
          email={email}
          existingLangs={profiles.map(p => p.learning_lang).filter(l => l !== activeLang)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col max-w-lg mx-auto relative">
      <header className="px-4 pt-5 pb-2 bg-stone-50 flex justify-between items-center">
        <button
          onClick={() => setShowProfileSwitcher(true)}
          className="flex items-center gap-1 text-stone-800"
        >
          <span className="text-xl font-bold">{getLangLabel(activeLang)}</span>
          <span className="text-stone-400 font-normal text-base">· {settings?.reading_level}</span>
          <span className="text-stone-400 text-sm ml-1">▾</span>
        </button>
        <button onClick={() => setShowSettings(true)} className="text-stone-400 hover:text-stone-600 text-xl p-1">⚙</button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className={activeTab === 'read' ? '' : 'hidden'}>
          <Read words={words} settings={settings} ui={ui} />
        </div>
        <div className={activeTab === 'review' ? '' : 'hidden'}>
          <Review words={words} settings={settings} ui={ui} />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                activeTab === tab.id ? 'text-amber-600 border-t-2 border-amber-500 -mt-px' : 'text-stone-400'
              }`}
            >
              {tab.label(ui)}
            </button>
          ))}
        </div>
      </nav>

      {showProfileSwitcher && (
        <ProfileSwitcher
          profiles={profiles}
          activeLang={activeLang}
          onSwitch={switchProfile}
          onAdd={() => setAddingNew(true)}
          onClose={() => setShowProfileSwitcher(false)}
        />
      )}
    </div>
  );
}

export default function Root() {
  const [email, setEmail] = useState(sessionStorage.getItem('auth'));
  if (!email) return <AuthGate onSuccess={(e) => setEmail(e)} />;
  return <App email={email} />;
}
