
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { generateLLMResponse } from '../../../lib/llm.service';
import { compileTSXToJSX } from '../../../lib/compiler';
import { getHtmlGeneratorPrompt, getTsxGeneratorPrompt } from "@/lib/prompt";

export async function GET(req: Request) {
    console.log("Received GET request for lessons");
    const { data } = await supabaseAdmin.from('lessons').select('*').order('created_at', { ascending: false });
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}

export async function POST(req: Request) {
    console.log("Received POST request to create lesson");
    const { outline } = await req.json();
    if (!outline) {
        return new Response(JSON.stringify({ error: 'outline required' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        });
    }
    // create db row in generating state
    const insert = await supabaseAdmin
        .from('lessons')
        .insert([{ outline, status: 'generating' }])
        .select('*')
        .single();
    const lesson = insert.data;
    const lessonId = lesson.id;

    (async () => {
        try {
            //const prompt = await getHtmlGeneratorPrompt(outline);
            const prompt = await getTsxGeneratorPrompt(outline);
            const tsx = await generateLLMResponse(prompt);// Call LLM
            console.log("LLM response Generated!!");

            await supabaseAdmin
                .from('lessons')
                .update({
                    generated_tsx: tsx,
                    status: 'generated', 
                    title: (JSON.parse(JSON.stringify(outline)).substr?.(0, 120) || outline) })
                .eq('id', lessonId);
            // Can it be compiled?
            const {jsx} = await compileTSXToJSX(tsx);
            // update lesson with compiled JS and status
            await supabaseAdmin
                .from('lessons')
                .update({
                    generated_tsx: tsx,
                    compiled_jsx: jsx,
                    status: 'generated', 
                    title: (JSON.parse(JSON.stringify(outline)).substr?.(0, 120) || outline) })
                .eq('id', lessonId);
        } catch (err: any) {
            console.error(err);
            await supabaseAdmin.from('lessons')
                .update({ 
                    status: 'failed', 
                    error_text: String(err) })
                .eq('id', lessonId);
            return new Response(JSON.stringify({ error: String(err) }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }
    })();

    return new Response(JSON.stringify({ id: lessonId }), {
        headers: { 'Content-Type': 'application/json' },
        status: 201,
    });
}
