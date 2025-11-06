// app/[id]/page.tsx
import { notFound } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Lesson } from '../../lib/models';
import JSXRenderer from '@/components/jsx.renderer';

export default async function ViewJSXLesson({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('lessons')
    .select('status,compiled_jsx,title')
    .eq('id', id)
    .single<Lesson>();

  if (error || !data) {
    // You can log `error` in production if you want
    notFound();
  }
  const { compiled_jsx, title } = data;
  return (
    <main style={{ padding: '2rem' }}>
      <h1>{title}</h1>
      <JSXRenderer code={compiled_jsx || ''} />
    </main>
  );
}

// ------------- NOT USED CURRENTLY ----------------
// View HTML Lesson in iframe implementation
// Ask LLM to generate full HTML document instead of TSX component - saved in generated_tsx field
export async function ViewHtmlLesson({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('lessons')
    .select('status,generated_tsx,title')
    .eq('id', id)
    .single<Lesson>();

  if (error || !data) {
    // You can log `error` in production if you want
    notFound();
  }
  const { generated_tsx, title } = data;

  // --------------------------------------------------------------
  // Render inside an iframe (full HTML document preserved)
  // --------------------------------------------------------------
  return (
    <iframe
      srcDoc={generated_tsx}
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
      title={title}
      loading="lazy"
    />
  );
}
