import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useSettings(email) {
  const [profiles, setProfiles] = useState([]);
  const [activeLang, setActiveLang] = useState(
    () => localStorage.getItem(`activeLang_${email}`) || null
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!email) return;
    supabase.from('settings').select('*').eq('email', email)
      .then(({ data }) => {
        const list = data || [];
        setProfiles(list);
        if (list.length > 0) {
          const stored = localStorage.getItem(`activeLang_${email}`);
          const valid = list.find(p => p.learning_lang === stored);
          const active = valid ? stored : list[0].learning_lang;
          setActiveLang(active);
          localStorage.setItem(`activeLang_${email}`, active);
        }
        setReady(true);
      });
  }, [email]);

  const settings = profiles.find(p => p.learning_lang === activeLang) || null;

  const switchProfile = (lang) => {
    setActiveLang(lang);
    localStorage.setItem(`activeLang_${email}`, lang);
  };

  const save = async (s) => {
    const row = { email, ...s };
    await supabase.from('settings').upsert(row);
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.learning_lang === s.learning_lang);
      if (idx >= 0) { const u = [...prev]; u[idx] = row; return u; }
      return [...prev, row];
    });
    setActiveLang(s.learning_lang);
    localStorage.setItem(`activeLang_${email}`, s.learning_lang);
  };

  const deleteProfile = async (lang) => {
    await supabase.from('settings').delete().eq('email', email).eq('learning_lang', lang);
    const remaining = profiles.filter(p => p.learning_lang !== lang);
    setProfiles(remaining);
    if (activeLang === lang) {
      const next = remaining[0]?.learning_lang || null;
      setActiveLang(next);
      if (next) localStorage.setItem(`activeLang_${email}`, next);
    }
  };

  return { settings, profiles, activeLang, ready, save, switchProfile, deleteProfile };
}
