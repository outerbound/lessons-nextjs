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
