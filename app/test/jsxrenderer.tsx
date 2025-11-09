// src/components/JSXRenderer.tsx
'use client';

import { useEffect, useState } from 'react';
import React from 'react';

export default function JSXRenderer({ code }: { code: string }) {
  const [Comp, setComp] = useState<React.FC | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const blob = new Blob([code], { type: 'text/javascript' });
        console.log("Created blob for code", code);
        const url = URL.createObjectURL(blob);
        console.log("Importing module from URL:", url);
        // dynamic import as module
        const module = await import(/* webpackIgnore: true */ url);
        URL.revokeObjectURL(url);

        if (!cancelled) {
          setComp(() => module.default);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!Comp) return <div>Loading...</div>;
  return <Comp />;
}