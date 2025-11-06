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
        const wrapped = `
          const React = window.__REACT__;
          const { useState, useEffect } = React;
          ${code}
        `;

        const blob = new Blob([wrapped], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);

        (window as any).__REACT__ = React;

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
      delete (window as any).__REACT__;
    };
  }, [code]);

  if (!Comp) return <div>Loading...</div>;
  return <Comp />;
}