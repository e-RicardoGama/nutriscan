'use client';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    const u = new URL(window.location.href);
    if (u.searchParams.get('bypass-sw') === 'true' || u.searchParams.get('bypass') === 'true') {
      console.log('[CLIENT-DEBUG] bypass flag in initial URL:', window.location.href);
    }

    // intercept pushState para detectar quando o app altera a URL dinamicamente
    const origPush = history.pushState;
    history.pushState = function (...args) {
      origPush.apply(this, args);
      try {
        const uu = new URL(window.location.href);
        if (uu.searchParams.get('bypass-sw') === 'true') {
          console.log('[CLIENT-DEBUG] bypass-sw added via pushState:', window.location.href);
        }
      } catch (e) {}
    };
  }, []);
  return <html><body>{children}</body></html>;
}
