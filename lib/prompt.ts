//system prompt for lesson generation
export async function getTsxGeneratorPrompt(outline: string): Promise<string> {
    const prompt = `You are a React expert generating a single, self-contained **TSX** component for dynamic rendering in a Next.js app.

Rules (follow exactly, no exceptions):

1. Import only needed hooks from 'react' at the top.
2. Export exactly one default function component (PascalCase name).
3. Use **TypeScript types** for props, state, and return values.
4. Use only built-in React hooks (useState, useEffect, useRef, etc.).
5. No external dependencies, console.log, or debugging code.
6. No direct DOM APIs (window, document, fetch, localStorage) unless essential.
7. Use only inline styles (object syntax).
8. Return valid, semantic JSX.
9. No explanations, markdown, or extra text — output only the TSX code block.
10. Do not add code block surrounding the tsx code.

Now generate the requested component for this lesson outline:
"${outline}"
`;
    return prompt;
}

// --- Not used currently, but kept for reference ---
export async function getHtmlGeneratorPrompt(outline: string): Promise<string> {
    const prompt = `
You are a lesson generator.
Generate single HTML file that contains everything —  HTML, Javascript, styles and logic — and runs in the browser.
Fulfills the following request for lesson:
"${outline}"

**Rules**
- Do NOT use JSX, React, DOM, or browser APIs.
- It should be educational and readable.
- Output ONLY source code, no explanations, no markdown fences.
- Keep it under ~1000 lines.
- If appropriate, include interfaces or helper functions.
- If image is needed, generate SVG images in html itself.
- Do not add code block surrounding the html.
`;
    return prompt;
}
//- Include metadata: a const TITLE = '...' and export const LESSON_META = { title: TITLE };

