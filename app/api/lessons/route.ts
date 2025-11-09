
import { createClient } from '../../../lib/supabase/server';
import { generateLLMResponse } from '../../../lib/llm.service';
import { compileTSXToJSX } from '../../../lib/compiler';
import { getTsxGeneratorPrompt } from "@/lib/prompt";

export async function GET(req: Request) {
    console.log("Received GET request for lessons");
    const supabase = await createClient();
    const { data } = await supabase.from('lessons')
        .select('*')
        .order('created_at', { ascending: false });
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}

export async function POST(req: Request) {
    const { outline } = await req.json();
    if (!outline) {
        return new Response(JSON.stringify({ error: 'outline required' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        });
    }
    const supabase = await createClient()
    // create db row in generating state
    const insert = await supabase.from('lessons')
        .insert([{ outline, status: 'generating' }]).select('*').single();
    const lesson = insert.data;
    const lessonId = lesson.id;

    const encoder = new TextEncoder();
    //Vercel Hack: long-running requests get killed after 10s of no response
    // So we use a streaming response to keep the connection alive
    const stream = new ReadableStream({
        async start(controller) {
            // Send "keep-alive" pings every 5s to prevent Vercel timeout
            const keepAlive = setInterval(() => {
                controller.enqueue(encoder.encode(" ")); // invisible space
            }, 5000);

            try {
                const prompt = await getTsxGeneratorPrompt(outline);
                const title = (JSON.parse(JSON.stringify(outline)).substr?.(0, 120) || outline);
                
                // Generate TSX via LLM
                await supabase.from('traces')
                    .insert([{ lesson_id: lessonId, step: 'generation_started', payload: { outline, prompt } }]);
                const start = performance.now();
                const tsx = await generateLLMResponse(prompt);// Call LLM
                const end = performance.now();
                console.log(`LLM generation took ${(end - start).toFixed(2)} ms`);
                await supabase.from('lessons')
                    .update({generated_tsx: tsx, status: 'generated', title: title})
                    .eq('id', lessonId);
                await supabase.from('traces')
                    .insert([{ lesson_id: lessonId, step: 'generation_received', payload: { length: tsx.length, generationTime: `${(end - start).toFixed(3)} milliseconds` } }]);
                
                // Compile TSX to JSX
                await supabase.from('traces')
                    .insert([{ lesson_id: lessonId, step: 'compile_start', payload: {} }]);
                const { jsx } = await compileTSXToJSX(tsx);
                await supabase.from('traces')
                    .insert([{ lesson_id: lessonId, step: 'compile_end', payload: {} }]);
                await supabase.from('lessons')
                    .update({compiled_jsx: jsx, status: 'generated'})
                    .eq('id', lessonId);


                clearInterval(keepAlive);
                controller.enqueue(encoder.encode("[DONE]"));
                controller.close();
            } catch (err: any) {
                await supabase.from('lessons')
                    .update({status: 'failed', error_text: String(err)})
                    .eq('id', lessonId);
                await supabase.from('traces')
                    .insert([{ lesson_id: lessonId, step: 'generation_failed', payload: { error: String(err) } }]);
                
                clearInterval(keepAlive);
                controller.enqueue(encoder.encode(`[ERROR]: ${err.message}`));
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}