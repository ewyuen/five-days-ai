## 1. Day 1 - Environment Setup & Conversation Basics

- [x] 1.1 Initialize project workspace directories under `phase-1/` and set up virtual environment using uv.
- [x] 1.2 Copy document corpus from `ingest_docs/` (vacation policy, equipment reimbursement, and oncall schedule).
- [x] 1.3 Implement `step1.py` for single-call LLM completions and `step2.py` for multi-turn mentoring chat with retries.
- [x] 1.4 Create workspace rules configuration `AGENTS.md` under `.agents/` to define operational constraints and toolchains.
- [x] 1.5 Update `phase-1/README.md` with setup and testing instructions for Day 1 deliverables.
- [x] 1.6 [Human Verification] Verify Day 1 scripts (`step1.py` and `step2.py`) run and output correctly.

## 2. Day 2 - Local RAG Ingestion & FastAPI API

- [x] 2.1 Implement `step3.py` for recursive text splitting, text embedding, and persistent Chroma vector indexing.
- [x] 2.2 Implement FastAPI server `app.py` exposing health checks at `/health` and grounded context search at `/query`.
- [x] 2.3 Verify RAG query response formatting, metadata tracking, and validation using curl client.
- [x] 2.4 [Human Verification] Run Chroma DB ingestion and perform manual query testing on the FastAPI server.

## 3. Day 3 - Agentic Loops & Tool Calling

- [x] 3.1 Implement autonomous agentic ReAct loop `step4.py` with OpenAI tool calling schemas.
- [x] 3.2 Add arithmetic validation and safe mathematical evaluation function as a calculator tool.
- [x] 3.3 Instrument the agentic loop with OpenTelemetry tracing to output reasoning steps, LLM spans, and tool call attributes.
- [x] 3.4 Verify agentic execution and trace spans by sending mixed prompts requiring tool calls.
- [x] 3.5 [Human Verification] Interact with the ReAct agent and verify correct tool calling and telemetry span output.

## 4. Day 4 - Next.js UI & Multi-Agent Orchestrator

- [ ] 4.1 Initialize the Next.js frontend project with Tailwind CSS v4 styling and Lucide icons.
- [ ] 4.2 Build `/api/chat` route using Vercel AI SDK to stream OpenAI, Anthropic, or Google Gemini responses.
- [ ] 4.3 Implement `local-rag` intercept routing to forward requests to the FastAPI RAG server.
- [ ] 4.4 Build programmatic multi-agent execution client (Orchestrator calling Planner to generate phases, then executing Coder/Designer tasks).
- [ ] 4.5 [Human Verification] Test the model selector, Local RAG routing, and programmatic orchestrator in the browser UI.

## 5. Day 5 - Verification & Kaggle Package Prep

- [ ] 5.1 Run full integration tests connecting Next.js interface to the Python RAG backend.
- [ ] 5.2 Build RAG evaluation verification script checking retrieval precision and correctness.
- [ ] 5.3 Draft Kaggle Capstone Project Writeup.md summarizing system design, outcomes, and setup commands.
- [ ] 5.4 [Human Verification] Conduct final end-to-end user testing of the integrated system and approve the Kaggle submission materials.
