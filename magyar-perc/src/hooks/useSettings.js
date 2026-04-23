import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useSettings(email) {
  const [settings, setSettings] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!email) return;
    supabase.from('settings').select('*').eq('email', email).single()
      .then(({ data }) => {
        setSettings(data || null);
        setReady(true);
      });
  }, [email]);

  const save = async (s) => {
    const row = { email, ...s };
    await supabase.from('settings').upsert(row);
    setSettings(row);
  };

  return { settings, ready, save };
}
