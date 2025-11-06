// lessons
'use client';
import React, { useEffect, useState } from 'react';
import TextRenderDialog from '../components/textrenderdialog';
import { supabase } from '../lib/supabaseClient';
import { Lesson } from '../lib/models';
import axios from 'axios';
import Link from 'next/link';



export function Lessons() {
  const [outline, setOutline] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase.from('lessons').select('*').order('created_at', { ascending: false });
      if (mounted) setLessons(data ?? []);
    }
    load();

    const subscription = supabase
      .channel('public:lessons').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        (payload) => {
          const newLesson = payload.new as Lesson;
          setLessons((prev) => {
            // replace or insert
            const idx = prev.findIndex((p) => p.id === newLesson.id);
            if (idx === -1) return [newLesson, ...prev];
            const copy = [...prev];
            copy[idx] = newLesson;
            return copy;
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!outline.trim()) return;
    setLoading(true);
    try {
      const resp = await axios.post('/api/lessons', { outline });
      setOutline('');
      // API will create DB row; realtime will add/update the UI without us polling
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
              <td className="p-2">{x.title ?? x.outline}</td>
              <td className="p-2">{x.status}</td>
              <td className="p-2">
                {x.status === 'generated' ? (
                  <Link
                    href={`/${x.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className='text-indigo-600'
                    title='Lets Go'
                  >
                    View
                  </Link>
                ) : (
                  <span className="text-gray-500"></span>
                )}
                <span className='px-2'></span>
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
                <span className='px-2'></span>
                {x.status === 'generated' ? (
                  <button
                    onClick={() => showJSXLesson(x)}
                    className="text-blue-600"
                    title='View compiled JSX'
                  >
                    JSX
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
