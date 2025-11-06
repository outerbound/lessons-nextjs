// lib/langfuse.ts
import { LangfuseClient } from "@langfuse/client";

//const langfuse = new LangfuseClient();

// Initialize Langfuse client with environment variables 
const langfuse = new LangfuseClient({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
    secretKey: process.env.LANGFUSE_SECRET_KEY!,
    baseUrl: process.env.LANGFUSE_BASE_URL, // or your self-hosted instance
});