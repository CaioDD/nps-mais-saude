'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          action: string;
          callback: (token: string) => void;
          'expired-callback': () => void;
          'error-callback': () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export default function TurnstileField({
  action,
  siteKey,
  onToken,
}: {
  action: string;
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || !loaded || !containerRef.current || widgetRef.current || !window.turnstile) return;

    widgetRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      callback: onToken,
      'expired-callback': () => onToken(''),
      'error-callback': () => onToken(''),
    });

    return () => {
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [action, loaded, onToken, siteKey]);

  if (!siteKey) return null;

  return (
    <div className="min-h-[65px]">
      <Script
        id={`turnstile-${id}`}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
      <div ref={containerRef} />
    </div>
  );
}
