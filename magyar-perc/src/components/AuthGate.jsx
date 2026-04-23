import { useEffect, useRef, useState } from 'react';

function decodeJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

export default function AuthGate({ onSuccess }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL;

    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          try {
            const payload = decodeJwt(response.credential);
            if (payload.email === allowedEmail) {
              sessionStorage.setItem('auth', payload.email);
              onSuccess(payload.email);
            } else {
              setError('Juurdepääs keelatud');
            }
          } catch {
            setError('Sisselogimine ebaõnnestus');
          }
        },
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          locale: 'et',
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
        <div className="text-4xl mb-3">🇭🇺</div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Magyar Perc</h1>
        <p className="text-stone-500">Ungari keele harjutused</p>
      </div>
      <div ref={buttonRef} />
      {error && (
        <p className="mt-4 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
