import { streamText, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { MODELS } from '@/lib/models';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, systemPrompt, apiKeys } = body;
    const modelId = body.modelId || body.model;

    console.log(`[API/chat] Request received for modelId: "${modelId}", messages count: ${messages?.length}`);

    if (!modelId) {
      console.warn('[API/chat] Missing modelId parameter.');
      return NextResponse.json({ error: 'Missing modelId parameter' }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      console.warn('[API/chat] Missing or invalid messages array.');
      return NextResponse.json({ error: 'Missing or invalid messages array' }, { status: 400 });
    }

    // Intercept Local ReAct Agent requests
    if (modelId === 'local-react-agent') {
      const userMessages = messages.filter((m: any) => m.role === 'user');
      const lastMessage = userMessages[userMessages.length - 1];
      let lastQuestion = '';
      if (lastMessage) {
        if (lastMessage.content) {
          lastQuestion = lastMessage.content;
        } else if (Array.isArray(lastMessage.parts)) {
          lastQuestion = lastMessage.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('');
        }
      }

      const resolvedApiKey =
        req.headers.get('x-openai-api-key') ||
        apiKeys?.openai ||
        body.openaiApiKey ||
        process.env.OPENAI_API_KEY ||
        '';

      console.log(`[API/chat] Routing to Local ReAct Agent API with question: "${lastQuestion}"`);

      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          const textId = 'react-content';
          try {
            const AGENT_API_URL = process.env.AGENT_API_URL || 'http://127.0.0.1:8000/agent-query';
            const response = await fetch(AGENT_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                question: lastQuestion,
                openai_api_key: resolvedApiKey 
              }),
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              let friendlyError = `Error from ReAct Agent API: ${response.status} - ${errorText}`;
              if (errorText.includes('Sync client is not available') || errorText.includes('OpenAI API Key is missing') || errorText.includes('credentials')) {
                friendlyError = `⚠️ **OpenAI API Key is missing.**\n\nPlease open the **Settings** menu in the top-right corner of the UI, enter a valid **OpenAI API Key**, and try again. The local ReAct system requires this key to call OpenAI APIs.`;
              } else if (errorText.includes('invalid_api_key') || errorText.includes('Incorrect API key') || errorText.includes('401')) {
                friendlyError = `⚠️ **Invalid OpenAI API Key.**\n\nThe OpenAI API key provided in settings is incorrect or expired. Please update it in the **Settings** menu.`;
              }
              writer.write({ type: 'text-start', id: textId });
              writer.write({ type: 'text-delta', id: textId, delta: friendlyError });
              writer.write({ type: 'text-end', id: textId });
              return;
            }
            
            const data = await response.json();
            const answer = data.answer || '';

            // Stream the content chunk-by-chunk to simulate typing
            writer.write({ type: 'text-start', id: textId });
            const words = answer.split(/(\s+)/);
            for (const word of words) {
              if (word) {
                writer.write({ type: 'text-delta', id: textId, delta: word });
                await new Promise((resolve) => setTimeout(resolve, 8));
              }
            }
            writer.write({ type: 'text-end', id: textId });
          } catch (err: any) {
            console.error('[API/chat] Local ReAct Agent execution error:', err);
            writer.write({ type: 'text-start', id: textId });
            writer.write({ type: 'text-delta', id: textId, delta: `Failed to execute ReAct Agent query: ${err.message}` });
            writer.write({ type: 'text-end', id: textId });
          }
        }
      });

      return createUIMessageStreamResponse({ stream });
    }

    // Intercept Local RAG requests
    if (modelId === 'local-rag') {
      const userMessages = messages.filter((m: any) => m.role === 'user');
      const lastMessage = userMessages[userMessages.length - 1];
      let lastQuestion = '';
      if (lastMessage) {
        if (lastMessage.content) {
          lastQuestion = lastMessage.content;
        } else if (Array.isArray(lastMessage.parts)) {
          lastQuestion = lastMessage.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('');
        }
      }

      const resolvedApiKey =
        req.headers.get('x-openai-api-key') ||
        apiKeys?.openai ||
        body.openaiApiKey ||
        process.env.OPENAI_API_KEY ||
        '';

      console.log(`[API/chat] Routing to Local RAG API with question: "${lastQuestion}"`);

      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          const textId = 'rag-content';
          try {
            const RAG_API_URL = process.env.RAG_API_URL || 'http://127.0.0.1:8000/query';
            const response = await fetch(RAG_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                question: lastQuestion,
                openai_api_key: resolvedApiKey 
              }),
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              let friendlyError = `Error from RAG API: ${response.status} - ${errorText}`;
              if (errorText.includes('Sync client is not available') || errorText.includes('OpenAI API Key is missing') || errorText.includes('credentials')) {
                friendlyError = `⚠️ **OpenAI API Key is missing.**\n\nPlease open the **Settings** menu in the top-right corner of the UI, enter a valid **OpenAI API Key**, and try again. The local RAG system requires this key to embed the document corpus.`;
              } else if (errorText.includes('invalid_api_key') || errorText.includes('Incorrect API key') || errorText.includes('401')) {
                friendlyError = `⚠️ **Invalid OpenAI API Key.**\n\nThe OpenAI API key provided in settings is incorrect or expired. Please update it in the **Settings** menu.`;
              }
              writer.write({ type: 'text-start', id: textId });
              writer.write({ type: 'text-delta', id: textId, delta: friendlyError });
              writer.write({ type: 'text-end', id: textId });
              return;
            }
            
            const data = await response.json();
            const answer = data.answer || '';
            const sources = data.sources || [];
            
            let finalContent = answer;
            if (sources.length > 0) {
              finalContent += '\n\n---\n\n### 📚 Sources\n';
              sources.forEach((s: any) => {
                finalContent += `- **${s.document}**: *"${s.preview.trim()}"*\n`;
              });
            }

            // Stream the content chunk-by-chunk to simulate typing
            writer.write({ type: 'text-start', id: textId });
            const words = finalContent.split(/(\s+)/);
            for (const word of words) {
              if (word) {
                writer.write({ type: 'text-delta', id: textId, delta: word });
                await new Promise((resolve) => setTimeout(resolve, 8));
              }
            }
            writer.write({ type: 'text-end', id: textId });
          } catch (err: any) {
            console.error('[API/chat] Local RAG execution error:', err);
            writer.write({ type: 'text-start', id: textId });
            writer.write({ type: 'text-delta', id: textId, delta: `Failed to execute RAG query: ${err.message}` });
            writer.write({ type: 'text-end', id: textId });
          }
        }
      });

      return createUIMessageStreamResponse({ stream });
    }

    // 1. Find the model metadata
    const selectedModel = MODELS.find((m) => m.id === modelId);
    if (!selectedModel) {
      console.warn(`[API/chat] Model "${modelId}" not found in supported registry.`);
      return NextResponse.json(
        { error: `Model "${modelId}" is not supported. Please select a registered model.` },
        { status: 400 }
      );
    }

    const { provider } = selectedModel;

    // 2. Resolve the API key based on priority:
    //    a) Headers
    //    b) Body custom keys
    //    c) Process Env fallback
    let resolvedApiKey = '';

    if (provider === 'openai') {
      resolvedApiKey =
        req.headers.get('x-openai-api-key') ||
        apiKeys?.openai ||
        body.openaiApiKey ||
        process.env.OPENAI_API_KEY ||
        '';
    } else if (provider === 'anthropic') {
      resolvedApiKey =
        req.headers.get('x-anthropic-api-key') ||
        apiKeys?.anthropic ||
        body.anthropicApiKey ||
        process.env.ANTHROPIC_API_KEY ||
        '';
    } else if (provider === 'google') {
      resolvedApiKey =
        req.headers.get('x-gemini-api-key') ||
        req.headers.get('x-google-api-key') ||
        apiKeys?.google ||
        apiKeys?.gemini ||
        body.googleApiKey ||
        body.geminiApiKey ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        '';
    }

    if (!resolvedApiKey) {
      console.warn(`[API/chat] API key for provider "${provider}" is missing.`);
      return NextResponse.json(
        {
          error: `API key for provider "${provider}" is missing. Please provide it in the UI settings or configure it on the server.`,
        },
        { status: 400 }
      );
    }

    // 3. Initialize the model provider with resolved API key
    let modelInstance;
    if (provider === 'openai') {
      const openai = createOpenAI({ apiKey: resolvedApiKey });
      modelInstance = openai(selectedModel.id);
    } else if (provider === 'anthropic') {
      const anthropic = createAnthropic({ apiKey: resolvedApiKey });
      modelInstance = anthropic(selectedModel.id);
    } else {
      // google
      const google = createGoogleGenerativeAI({ apiKey: resolvedApiKey });
      modelInstance = google(selectedModel.id);
    }

    // Convert UI messages to AI core messages
    const coreMessages = await convertToModelMessages(messages);

    console.log(`[API/chat] Launching streamText for model "${selectedModel.id}" using provider "${provider}".`);

    // 4. Stream response
    const result = streamText({
      model: modelInstance,
      messages: coreMessages,
      system: systemPrompt || undefined,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('[API/chat] Error in streaming handler:', error);
    return NextResponse.json(
      { error: error?.message || 'An error occurred during chat stream processing.' },
      { status: 500 }
    );
  }
}
