// app/lessons.tsx
// ssr component for lessons listing with real-time updates
import { createClient } from '../lib/supabase/server';
import LessonsList from '../components/lessons-list';

export const revalidate = 0; // optional: disables static caching (SSR only)

export default async function LessonsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <LessonsList initialLessons={data || []} />
  );
}