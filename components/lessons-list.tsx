// app/client-lessons.tsx
// client component for lessons with real-time updates
'use client';

import React, { useEffect, useState } from 'react';
import TextRenderDialog from './textrenderdialog';
import { createClient } from '../lib/supabase/client';
import { Lesson } from '../lib/models';
import axios from 'axios';
import Link from 'next/link';


export default function Lessons({initialLessons}: {initialLessons: any[];}) {  
    const [outline, setOutline] = useState('');
    const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Subscribe to real-time inserts
        const supabase = createClient();
        const channel = supabase
            .channel('public:lessons')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'lessons' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setLessons((prev) => [payload.new as Lesson, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setLessons((prev) =>
                            prev.map((t) => (t.id === payload.new.id ? (payload.new as Lesson) : t))
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setLessons((prev) => prev.filter((t) => t.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function handleGenerate(e: React.FormEvent) {
        e.preventDefault();
        if (!outline.trim()) return;
        setLoading(true);
        try {
            axios.post('/api/lessons', { outline });
            //const resp = await axios.post('/api/lessons', { outline });
            //setOutline('');
            // API will create DB row; realtime will add/update the UI without us polling
            // Vercel Hack: manually set loading false after a delay to account for generation time
            setTimeout(() =>{
                setOutline('');
                setLoading(false);
            }, 500);
        } catch (err) {
            console.error(err);
            alert('Failed to create lesson');
        } finally {
            setLoading(false);
        }
    }

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalText, setModalText] = useState('');

    const showTSXLesson = (lesson: Lesson) => {
        setModalTitle('Prompt - ' + lesson.outline);
        setModalText(lesson.generated_tsx || 'No generated TSX found');
        setShowModal(true);
    };
    const showJSXLesson = (lesson: Lesson) => {
        setModalTitle('Prompt - ' + lesson.outline);
        setModalText(lesson.compiled_jsx || 'No compiled JSX found');
        setShowModal(true);
    };

return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Generate Lesson</h1>
      <form onSubmit={handleGenerate}>
        <textarea
          className="w-full p-3 border rounded-md mb-2"
          rows={4}
          placeholder={`Enter a lesson outline - e.g. A 10 question pop quiz on Florida`}
          value={outline}
          onChange={(e) => setOutline(e.target.value)}
        />
        <button
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </form>

      <h2 className="text-xl font-semibold mt-8 mb-2">Recent Lessons</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((x) => (
            <tr key={x.id} className="border-t">
              <td className="p-2 wordwrap">{x.title ?? x.outline}</td>
              <td className="p-2">{x.status}</td>
              <td className="p-2 nowrap">
                {x.status === 'generated' ? (
                  <Link
                    href={`/${x.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className='text-indigo-600'
                    title='View generated lesson'
                  >
                    View
                  </Link>
                ) : (
                  <span className="text-gray-500"></span>
                )}
                <span className='px-1'></span>
                {x.status === 'generated' ? (
                  <Link
                    href={`/${x.id}/traces`}
                    className='text-indigo-600'
                    title='Traces for this lesson'
                  >
                    Traces
                  </Link>
                ) : (
                  <span className="text-gray-500"></span>
                )}                
                <span className='px-1'></span>
                {x.status === 'generated' ? (
                  <button
                    onClick={() => showTSXLesson(x)}
                    className="text-blue-600"
                    title='View generated TSX'
                  >
                    TSX
                  </button>
                ) : (
                  <span className="text-gray-500"></span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && TextRenderDialog(modalTitle, modalText, () => setShowModal(false))}
    </div>
  );
}
