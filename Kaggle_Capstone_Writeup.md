# Kaggle Capstone Project: Local RAG Knowledge Search & Spec-Driven Agent Workspace

This document serves as the final submission write-up for the Capstone Project. It presents a high-performance, spec-driven local Retrieval-Augmented Generation (RAG) backend combined with an interactive multi-model frontend web client.

---

## 1. System Architecture

The workspace is split into two unified components: a Python FastAPI RAG backend and a Next.js App Router frontend interface.

```
                  ┌───────────────────────────────────────────────┐
                  │          Next.js App Router Client            │
                  │                 (Port 3000)                   │
                  └───────────────────────┬───────────────────────┘
                                          │
                                          │ HTTP /api/chat Intercept
                                          ▼
                  ┌───────────────────────────────────────────────┐
                  │            FastAPI Backend Service            │
                  │                 (Port 8000)                   │
                  ├───────────────────────┬───────────────────────┤
                  │    Chroma Vector DB   │   OpenAI / Gemini     │
                  │    (Local Storage)    │   Completion API      │
                  └───────────────────────┴───────────────────────┘
```

### Component Details
*   **Vector Database (Chroma DB)**: A local, persistent database index mapping chunked document embeddings to source files.
*   **FastAPI API**: Exposes RAG similarity search and grounded LLM completion at `/query`, and system status at `/health`.
*   **Next.js Client**: A premium dark-mode web application featuring model provider selectors (OpenAI, Anthropic, Gemini, Local RAG), chat history persistence via local storage, and real-time response streaming using the Vercel AI SDK.

---

## 2. Key Features

### 1. Document Ingestion Pipeline (`step3.py`)
*   Recursively loads Markdown corporate policy files (vacation leave, equipment guidelines, and on-call schedules).
*   Splits text using `RecursiveCharacterTextSplitter` with target chunk size of 500 characters and 80-character overlap.
*   Generates embeddings via OpenAI's `text-embedding-3-small` and caches them to a persistent disk database (`chroma_db/`).

### 2. Grounded FastAPI Router (`app.py`)
*   Accepts questions, queries Chroma DB for the top-3 most relevant snippets, constructs a context-bounded completion prompt, and returns the grounded answer.
*   Performs strict system-prompt validation ensuring the model refuses to answer questions not covered by the ingested text.
*   Returns referenced source document names and matching text snippets for front-end transparency.

### 3. ReAct Agent Reasoning Loop (`step4.py`)
*   An autonomous agent implementing the ReAct (Reason-Act-Observe) loop using OpenAI Tool Calling.
*   Includes a safe arithmetic `calculate` calculator tool that parses and evaluates mathematical expressions.
*   Instrumented with custom **OpenTelemetry tracing** spans (`agent_query`, `agent_step_N`, `llm_call`, `tool_execution`) exported directly to the terminal stdout for debugging.

### 4. Interactive Next.js Chat Client (`generic-ai-client`)
*   Features a responsive, high-fidelity sidebar for managing chat conversations and theme switching.
*   Includes a credentials settings drawer to let users securely save API keys on the client-side.
*   Automatically detects when a user selects "Local RAG" and routes requests through a custom proxy API, rendering document source reference badges alongside answer text.

---

## 3. Verification & Evaluation Results

### RAG Retrieval Precision (100% Pass Rate)
Our evaluation suite (`evaluate_rag.py`) ran similarity search tests across key questions targeting specific policies. The system achieved **100% Retrieval Precision** in returning the expected source document within the Top-3 results:

| Question Tested | Expected Source Document | Result |
| :--- | :--- | :---: |
| *"How many vacation days do I accrue each month?"* | `vacation_policy.md` | **PASS** |
| *"What is the maximum yearly reimbursement for equipment?"* | `equipment_reimbursement.md` | **PASS** |
| *"Who should I contact if secondary support does not respond?"* | `oncall_schedule.md` | **PASS** |
| *"How do I request a new laptop?"* | `equipment_reimbursement.md` | **PASS** |
| *"Can I carry over unused vacation days to the next year?"* | `vacation_policy.md` | **PASS** |
| *"What is the rotation cycle for primary support on-call duty?"* | `oncall_schedule.md` | **PASS** |

### Integration Tests
Our automated integration test (`test_integration.py`) verified core system interactions:
*   **Health Status**: `/health` successfully reports `ok` and verifies the vector store is loaded.
*   **Structure Validation**: `/query` returns expected JSON keys containing the generated answer string and a populated sources array.

---

## 4. Setup & Running Instructions

### Prerequisites
*   Python 3.10+ with `uv` package manager installed.
*   Node.js v18+ with `npm`.
*   A valid `OPENAI_API_KEY` configured in `phase-1/.env`.

### 1. Synchronize Dependencies
Sync the python project packages:
```bash
uv sync
```

### 2. Run Document Ingestion
Build the persistent Chroma index from the document corpus:
```bash
uv run phase-1/step3.py
```

### 3. Run Autonomous Agent & Telemetry Verification
Run the ReAct agent loop and view the OpenTelemetry span details in standard output:
```bash
uv run phase-1/step4.py
```

### 4. Run the Evaluation Suite
Validate RAG retrieval precision:
```bash
uv run phase-1/evaluate_rag.py
```

### 5. Start the Application
1.  **FastAPI Backend Server**:
    ```bash
    uv run uvicorn phase-1.app:app --host 127.0.0.1 --port 8000
    ```
2.  **Next.js Frontend Client**:
    ```bash
    cd generic-ai-client
    npm run dev
    ```
    Open `http://localhost:3000` in your web browser. Configure your API credentials in Settings, choose the **Local RAG (ag20)** model, and start chatting.

---

## 5. Future Roadmap: Phase 2 Multi-Agent Orchestration

The current codebase delivers the core foundation for **Phase 1** (persistent local RAG retrieval, OpenAI/Gemini/Anthropic client routing, and single-agent ReAct telemetry loops). 

To scale this workspace for advanced development tasks, the proposed **Phase 2** roadmap outlines the implementation of a **Multi-Agent Orchestration Engine**:

1. **Planner Agent**: A specialist agent that accepts high-level prompts, designs a structured development plan, and breaks it down into sequential or parallel sub-phases.
2. **Coder & Designer Agents**: Execution sub-agents that receive scoped tasks from the Planner, write code, create mockups, and run validation tests.
3. **Execution Timeline UI**: A live frontend dashboard that visualizes the orchestrator's thoughts, showing spinner states for active agents, real-time code output blocks, and rendered visual previews.
4. **OTLP Collector Integration**: Forwarding standard OpenTelemetry spans from the agent loops to external visualization dashboards (such as Arize Phoenix or Jaeger) for system-wide tracing.

