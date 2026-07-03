## Context

The system consists of a Python FastAPI backend and a Next.js web application frontend. The Python backend manages document ingestion, text splitting, persistent vector storage, similarity search, and LLM grounded completion. The Next.js frontend implements a premium-quality chat interface with standard model selections, a local RAG client route, and a programmatic multi-agent orchestration engine. 

The architecture is shown below:

```
┌───────────────────────────────────────────────┐
│              Next.js Web Client               │
└───────────────────────┬───────────────────────┘
                        │ HTTP / JSON
                        ▼
┌───────────────────────────────────────────────┐
│            FastAPI Backend Service            │
│                 (Port 8000)                   │
├───────────────────────┬───────────────────────┤
│    Chroma Vector DB   │   OpenAI / Gemini     │
│    (Local Storage)    │   Completion API      │
└───────────────────────┴───────────────────────┘
```

## Goals / Non-Goals

**Goals:**
- **Local Ingestion & Persistence**: Index policy documents from `ingest_docs/` and store vectors persistently in `chroma_db/`.
- **FastAPI Endpoints**: Serve health checks at `/health` and grounded queries at `/query`.
- **Modern Chat UI**: Build a responsive dashboard using Next.js 16, React 19, and Tailwind CSS v4.
- **Programmatic Multi-Agent Orchestration**: Implement a programmatic loop coordinating Planner, Coder, and Designer agents in Next.js to solve tasks.
- **Model Router**: Intercept `local-rag` requests on the frontend and delegate them to the FastAPI RAG server.

**Non-Goals:**
- Production MLOps model training or fine-tuning.
- Multi-tenant account authentication or secure file vaults.
- Multi-agent code executing in sandbox terminals (agents generate files; executing code is out of scope).

## Decisions

### 1. Programmatic Orchestration in Next.js
- **Rationale**: Implementing the multi-agent coordination loop (Planner -> Coder/Designer) directly in the Next.js API using the Vercel AI SDK ensures it runs autonomously as a web app. It makes the application portable and perfect for a Kaggle demo.
- **Alternatives Considered**: VS Code Insiders custom agents. This is an IDE-dependent setup that cannot be showcased in a web browser or hosted live.

### 2. Persistent Chroma Vector Store
- **Rationale**: Persisting vector chunks in `./chroma_db` prevents re-embedding the corpus on every backend startup, reducing latency and cost.
- **Alternatives Considered**: In-memory vector database. Re-embeds documents on every execution, leading to excessive API usage and delay.

### 3. Vercel AI SDK for Streaming Agents
- **Rationale**: The Vercel AI SDK provides native streaming primitives (`streamText`, `convertToModelMessages`, and stream helpers) which seamlessly coordinate API completions and serialize message chunks for real-time frontend typing effects.
- **Alternatives Considered**: Custom WebSockets or SSE loops. Higher implementation complexity and maintenance overhead.

### 4. OpenTelemetry Observability for Agent Loops
- **Rationale**: Using manual OpenTelemetry spans to trace the ReAct loop (agent queries, thoughts, and tool executions) enables structured observability of the Chain-of-Thought. The console span exporter provides raw validation, and OTLP exporters allow integration with dashboards like Arize Phoenix.
- **Alternatives Considered**: Standard stdout printing only. Lacks standard structure and trace metrics.

## Risks / Trade-offs

- **Rate Limits & API Token Costs** → *Mitigation*: Enable persistent vector caching to avoid re-embedding. Use `gpt-4o-mini` or `gemini-1.5-flash` as the default models.
- **Agent Hallucinations in Grounded QA** → *Mitigation*: Enforce a strict system prompt instructing the model to reply *only* using context and refuse questions not addressed in the retrieved documents.
- **Concurrent File Conflict** → *Mitigation*: The Orchestrator agent serialize updates to overlapping files and uses separate sub-components for parallel work.
