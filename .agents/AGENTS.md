# Agent Instructions

## Critical Operational Constraints
- **Always run commands from the repository root.** Phase 1 implementation files (`phase-1/app.py`, `phase-1/step3.py`, `phase-1/step4.py`) use relative paths (e.g., `phase-1/ingest_docs/`, `phase-1/chroma_db/`) that will fail if executed from within the `phase-1/` directory.

## Toolchain & Environment
- **Package Manager:** `uv`
- **Dependency Sync:** `uv sync` (run in `phase-1/` or root accordingly)
- **Environment Variables:** Requires `OPENAI_API_KEY` in a `.env` file under `phase-1/`.

## Phase 1 Entrypoints (Run from root or phase-1/)
- **LLM Single-call Completion:** `uv run phase-1/step1.py`
- **LLM Chat Mentoring:** `uv run phase-1/step2.py`
- **RAG Pipeline Ingestion:** `uv run phase-1/step3.py`
- **Agentic ReAct Loop:** `uv run phase-1/step4.py`
- **FastAPI Server:** `uv run uvicorn phase-1.app:app --reload`
- **API Query Example:** 
  ```bash
  curl -X POST http://127.0.0.1:8000/query \
    -H "Content-Type: application/json" \
    -d '{"question": "How many vacation days do I get?"}'
  ```

## Repository Structure & Context
- `openspec/`: The primary source of truth for architectural intent, design specs, and the 5-day roadmap.
- `phase-1/`: Current implementation of the RAG prototype backend.
- `phase-1/ingest_docs/`: The document corpus used for RAG retrieval.
- `phase-1/chroma_db/`: Persisted Chroma vector store.

## Development Workflow
- Follow the "Spec-First" approach defined in `openspec/`. Major changes should be preceded by a spec/design document.
- When implementing new features, consult the existing Phase 1 patterns.
- **Testing & Verification:** Before finishing any day's milestones, update `phase-1/README.md` with detailed, reproducible commands to verify the day's deliverables, and ensure all scripts run without errors.
- **Human-in-the-Loop Gating:** Tasks marked with `[Human Verification]` in `tasks.md` MUST NOT be checked off or completed by the AI agent. These tasks must be validated and checked off manually by the user.
