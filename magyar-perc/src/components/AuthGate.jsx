import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';

function decodeJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

export default function AuthGate({ onSuccess }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const payload = decodeJwt(response.credential);
            const { data } = await supabase
              .from('allowed_emails')
              .select('email')
              .eq('email', payload.email)
              .single();
            if (!data) {
              setError('Juurdepääs keelatud');
              return;
            }
            sessionStorage.setItem('auth', payload.email);
            onSuccess(payload.email);
          } catch {
            setError('Sisselogimine ebaõnnestus');
          }
        },
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
        });
      }
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          init();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [onSuccess]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">📚</div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Tohuvabohu</h1>
        <p className="text-stone-500">Keeleõppe harjutused</p>
      </div>
      <div ref={buttonRef} />
      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
    </div>
  );
}
