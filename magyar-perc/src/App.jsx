import { useState } from 'react';
import AuthGate from './components/AuthGate';
import Read from './views/Read';
import Review from './views/Review';
import Ask from './views/Ask';
import { useLocalStorage } from './hooks/useLocalStorage';

const TABS = [
  { id: 'read', label: 'Loe' },
  { id: 'review', label: 'Korda' },
  { id: 'ask', label: 'Küsi' },
];

function App() {
  const [activeTab, setActiveTab] = useState('read');
  const [savedWords, setSavedWords] = useLocalStorage('savedWords', []);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col max-w-lg mx-auto relative">
      <header className="px-4 pt-5 pb-2 bg-stone-50">
        <h1 className="text-xl font-bold text-stone-800">Magyar Perc 🇭🇺</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className={activeTab === 'read' ? '' : 'hidden'}><Read savedWords={savedWords} setSavedWords={setSavedWords} /></div>
        <div className={activeTab === 'review' ? '' : 'hidden'}><Review savedWords={savedWords} setSavedWords={setSavedWords} /></div>
        <div className={activeTab === 'ask' ? '' : 'hidden'}><Ask /></div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-amber-600 border-t-2 border-amber-500 -mt-px'
                  : 'text-stone-400'
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
  const [authed, setAuthed] = useState(!!sessionStorage.getItem('auth'));
  if (!authed) return <AuthGate onSuccess={() => setAuthed(true)} />;
  return <App />;
}
