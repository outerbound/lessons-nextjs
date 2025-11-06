// src/lib/compiler.ts
// A simple TSX to JSX compiler using esbuild
import * as esbuild from 'esbuild';

export async function compileTSXToJSX(tsx: string) {
  /*
  const cleaned = tsx
    .replace(/import\s+.*?["']react["'].*?;/g, '')  // Remove all react imports
    .replace(/export\s+default\s+function\s+(\w+)/g, 'function $1')  // Optional: clean export*/

  const cleaned = tsx.replace(/import\s+.*?["']react["'].*?;/g, '');
  const result = await esbuild.transform(cleaned, {
    loader: 'tsx',
    jsx: 'transform',
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
  });
  return { jsx: result.code };
}