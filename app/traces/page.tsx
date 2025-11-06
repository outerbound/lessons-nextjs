// pages/index.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import TextRenderDialog from '../../components/textrenderdialog';

type Trace = {
    id: string;
    lesson_id: string;
    step: string;
    payload: any;
    created_at?: string;
};

export default function TracesList() {
    const [traces, setTraces] = useState<Trace[]>([]);
    useEffect(() => {
        let mounted = true;
        async function load() {
            const { data } = await supabase.from('traces').select('*').order('created_at', { ascending: false });
            if (mounted) setTraces(data ?? []);
        }
        load();
        //listen to changes
        const subscription = supabase
            .channel('public:traces')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'traces' },
                (payload) => {
                    const newTrace = payload.new as Trace;
                    setTraces((prev) => {
                        // replace or insert
                        const idx = prev.findIndex((p) => p.id === newTrace.id);
                        if (idx === -1) return [newTrace, ...prev];
                        const copy = [...prev];
                        copy[idx] = newTrace;
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

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalText, setModalText] = useState('');

    const showPayload = (trace: Trace) => {
        console.log("Trace Payload:", trace.payload);
        setModalTitle('Step - ' + trace.step);

        const prettyJson = JSON.stringify(trace.payload, null, 2);
        setModalText(prettyJson);
        setShowModal(true);
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-xl font-semibold mt-8 mb-2">Traces</h2>
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr>
                        <th className="text-left p-2">lesson_id</th>
                        <th className="text-left p-2">step </th>
                        <th className="text-left p-2">payload</th>
                    </tr>
                </thead>
                <tbody>
                    {traces.map((x) => (
                        <tr key={x.id} className="border-t">
                            <td className="p-2">{x.lesson_id}</td>
                            <td className="p-2">{x.step}</td>
                            <td className="p-2">
                                <button
                                    onClick={() => showPayload(x)}
                                    className="text-indigo-600 underline"
                                >
                                    Payload
                                </button>
                                {showModal && TextRenderDialog(modalTitle, modalText, () => setShowModal(false))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

