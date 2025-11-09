// services/llm.service.ts
// Service to interact with LLM (e.g., OpenAI) and trace calls using Langfuse
import OpenAI from 'openai';
import { startObservation } from '@langfuse/tracing';
import { flushLangfuse } from '@/instrumentation';

const traceEnabled = process.env.TRACE_ENABLED === 'true'; //TODO implement trace toggle

// call OpenAI compatible (Chat completions or API of your LLM)
const baseURL = process.env['LLM_BASE_URL'];
const apiKey = process.env['LLM_API_KEY'];
const model = process.env['LLM_MODEL'] || 'gpt-4o-mini';
const inputCostPer1kTokens = parseFloat(process.env['LLM_INPUT_COST_PER_1K_TOKENS'] || '0');
const outputCostPer1kTokens = parseFloat(process.env['LLM_OUTPUT_COST_PER_1K_TOKENS'] || '0');
const temperature = parseFloat(process.env['LLM_TEMPERATURE'] || '0.0');
const openai = new OpenAI({
  baseURL: baseURL,//incase of custom endpoint
  apiKey: apiKey,
});


export async function generateLLMResponse(prompt: string, userId?: string, sessionId?: string): Promise<string> {
  userId = userId || 'outerbound';
  sessionId = sessionId || 'session-123';
  // Create the root span for this operation
  const span = startObservation('astral-chat', {
    input: { query: prompt },
  });
  let generation; // For error handling
  try {
    // Create a generation span for the LLM call
    generation = span.startObservation(
      'astral-generation',
      {//attributes
        model: model,
        input: [{ role: 'user', content: prompt }],
      },
      { //options
        asType: 'generation' 
      }
    );

    // Call LLM API
    const result = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: temperature,
    });
    // Extract response and usage
    const responseText = result.choices[0]?.message?.content || '';
    const usage = result.usage;
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;
    const totalTokens = usage?.total_tokens || inputTokens + outputTokens;

    // Update generation with details
    generation.update({
      model: result.model, // Actual model used
      modelParameters: { temperature: temperature },
      input: [{ role: 'user', content: prompt }],
      output: { role: 'assistant', content: responseText },
      usageDetails: {
        inputTokens,
        outputTokens,
        totalTokens,
      },
      costDetails: {
        inputCost: (inputTokens / 1000) * inputCostPer1kTokens, // Example cost calculation
        outputCost: (outputTokens / 1000) * outputCostPer1kTokens,
        totalCost: (totalTokens / 1000) * (inputCostPer1kTokens + outputCostPer1kTokens),
      }
    }).end();

    // End the root span with final status
    span.update({
      output: 'Successfully generated response from LLM.',
      metadata: { userId: userId, sessionId: sessionId }, // Consistent metadata
    }).end();
    //await flushLangfuse(); // Ensure all traces are sent
    console.log('Response:', responseText);
    return responseText;
  } catch (error: any) {
    console.error('Error:', error);
    if (generation) {
      generation.update({ level: 'ERROR', statusMessage: error.message }).end();
    }
    span.update({ level: 'ERROR', statusMessage: error.message }).end();
    throw error;
  }
}
