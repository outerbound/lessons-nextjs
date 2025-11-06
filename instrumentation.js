// instrumentation.js
// Langfuse OpenTelemetry instrumentation setup
import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";

//-- Langfuse instrumentation setup --
const traceEnabled = process.env.TRACE_ENABLED === "true";//TODO implement trace toggle
// Export a top-level, reassignable flush function (no-op by default)
/*
export let flushLangfuse = async () => {
  return Promise.resolve(); // no-op when tracing is disabled
};*/


console.log("Langfuse Tracing is ENABLED");
const sdk = new NodeSDK({
  spanProcessors: [new LangfuseSpanProcessor()],
});
sdk.start();
//flush function implementation
export const flushLangfuse = async () => {
  console.log("Flushing Langfuse traces...");
  await sdk.forceFlush(); // or sdk.shutdown() for full cleanup
  console.log("Flush complete.");
};

// Optional: Graceful shutdown on process exit (Vercel, Node, etc.)
/*
process.on("SIGTERM", async () => {
  await sdk.forceFlush();
  process.exit(0);
});
process.on("SIGINT", async () => {
  await sdk.forceFlush();
  process.exit(0);
});*/

//CHECK REQUIRED ENV VARIABLES
export function register() {
  const baseURL = process.env['LLM_BASE_URL'];
  const apiKey = process.env['LLM_API_KEY'];
  const model = process.env['LLM_MODEL'];
  console.log('LLM baseURL: ', baseURL);
  console.log('LLM apiKey: ', apiKey);
  console.log('LLM model:', model);
  if (baseURL === undefined || baseURL === '') {
    console.error(`Error: LLM_BASE_URL env variable is empty or undefined`);
    //process.exit(1);
  }
  if (apiKey === undefined || apiKey === '') {
    console.error(`Error: LLM_API_KEY env variable is empty or undefined`);
    //process.exit(1);
  }
  if (model === undefined || model === '') {
    console.error(`Error: LLM_MODEL env variable is empty or undefined`);
    //process.exit(1);
  }
  // ...other checks
}