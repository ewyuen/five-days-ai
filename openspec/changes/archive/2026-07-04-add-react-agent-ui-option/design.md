## Context

The Next.js client interface communicates with local backend endpoints. By adding the `local-react-agent` model key to the model list, we configure the frontend to talk to `/agent-query` on the FastAPI server, exposing the ReAct RAG and MCP tool flow.

## Goals / Non-Goals

**Goals:**
- Register `local-react-agent` in `models.ts`.
- Update `ModelSelector.tsx` to require an OpenAI key for the ReAct agent model.
- Add interception and forwarding logic to `route.ts` that hits `/agent-query` and simulates token streaming.

**Non-Goals:**
- Exposing the individual tool traces/thoughts to the UI chat bubbles (the UI will only show the final markdown answer, matching the simulated stream pattern).

## Decisions

### 1. Interception and Routing in Next.js Router
We will duplicate the interception logic of `local-rag` in `route.ts` for the `local-react-agent` ID, but send the request to `http://127.0.0.1:8000/agent-query` instead of `http://127.0.0.1:8000/query`.
- **Request payload**: `{"question": lastQuestion, "openai_api_key": resolvedApiKey}`
- **Response payload**: `{"answer": "..."}`
- **Streaming**: We will use `createUIMessageStream` and output the text delta by splitting the returned answer and writing word-by-word with a micro-delay, matching the exact UX of the local RAG model.

### 2. UI Key Configuration Validation
In `ModelSelector.tsx`, we will update:
```typescript
if (model.id === 'local-rag' || model.id === 'local-react-agent') {
  // Both require OpenAI key
  return serverAvailability['gpt-4o-mini'] || !!apiKeys['openai'];
}
```
This ensures the key indicator lights (green/orange) match configuration status.
