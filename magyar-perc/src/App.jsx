import { useState } from 'react';
import AuthGate from './components/AuthGate';
import Read from './views/Read';
import Review from './views/Review';
import Settings from './views/Settings';
import { useSyncedList } from './hooks/useSync';
import { useSettings } from './hooks/useSettings';
import { DEFAULT_UI } from './ui';

function App({ email }) {
  const [activeTab, setActiveTab] = useState('read');
  const [showSettings, setShowSettings] = useState(false);
  const words = useSyncedList('words', email);
  const { settings, ready: settingsReady, save: saveSettings } = useSettings(email);

  const ui = settings?.ui ?? DEFAULT_UI;

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

  if (!settings) {
    return (
      <div className="min-h-screen bg-stone-50 max-w-lg mx-auto">
        <Settings onSave={saveSettings} />
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-stone-50 max-w-lg mx-auto">
        <Settings current={settings} onSave={saveSettings} onBack={() => setShowSettings(false)} />
      </div>
    );
  }

  const TABS = [
    { id: 'read', label: ui.tab_read },
    { id: 'review', label: ui.tab_review },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col max-w-lg mx-auto relative">
      <header className="px-4 pt-5 pb-2 bg-stone-50 flex justify-between items-center">
        <h1 className="text-xl font-bold text-stone-800">
          {settings.learning_lang} <span className="text-stone-400 font-normal text-base">· {settings.reading_level}</span>
        </h1>
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
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function Root() {
  const [email, setEmail] = useState(sessionStorage.getItem('auth'));
  if (!email) return <AuthGate onSuccess={(e) => setEmail(e)} />;
  return <App email={email} />;
}
