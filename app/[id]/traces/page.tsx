// app/{uid}/traces.tsx
// The page component (pure server component)
import { notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { Lesson, Trace } from '../../../lib/models';


export default async function TracesPage({ params }: { params: { id: string } }) {
    const { id } = await params;           // ← this is your {uid}
    if (!id) notFound();                // safety net

    const supabase = await createClient();
    // Fetch Lesson to verify it exists
    const { data: lessonData, error: lessonError } = await supabase.from('lessons')
        .select('id,title,status')
        .eq('id', id)
        .single<Lesson>();
    if (lessonError || !lessonData) {
        console.error('Supabase error:', lessonError);
        // you can render a friendly error UI or throw notFound()
        return <div className="p-8 text-red-600">Lesson not found.</div>;
    }
    // Fetch Traces for the Lesson
    const { data: traceData, error: traceError } = await supabase.from('traces')
        .select('*')
        .eq('lesson_id', id)
        .order('created_at', { ascending: true }) as { data: Trace[] | null; error: any; };
    if (traceError) {
        console.error('Supabase error:', traceError);
        return <div className="p-8 text-red-600">Failed to load traces.</div>;
    }


    // ── Render (Tailwind example – adjust to your design)
    return (
        <section className="p-8 max-w-4xl mx-auto">
            <h1 className="text-xl font-bold mb-6">
                <span className="text-blue-600">{lessonData.title}</span>
            </h1>

            {traceData?.length ? (
                <ul className="space-y-4">
                    {traceData.map((trace) => (
                        <li
                            key={trace.id}
                            className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                        >
                            <h2 className="text-xl font-semibold mb-2">step: {trace.step} </h2>
                            <h2 className="text-sm mb-2">date: {formatLocalDate(trace.created_at || '')}</h2>
                            <pre className="whitespace-pre-wrap break-words text-sm">
                                {JSON.stringify(trace.payload, null, 2)}
                            </pre>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600">No traces found for this UID.</p>
            )}
        </section>
    );
}

function formatLocalDate(
    isoString: string,
    locale = 'en-US',
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    }
) {
    return new Intl.DateTimeFormat(locale, options).format(new Date(isoString));
}