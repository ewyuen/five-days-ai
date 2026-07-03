## Why

The user wants to master Retrieval-Augmented Generation (RAG), AI agents, Spec-Driven Development, and multi-agent orchestration through a hands-on, 5-day project based on their previous Kaggle Capstone Project. This proposal establishes a structured, spec-driven roadmap and architecture to guide the development and integration of these components within a 5-day timeline leading to the Kaggle submission.

## What Changes

- **FastAPI RAG Backend**: A Python FastAPI service (`app.py`) providing document ingestion, vector storage, and query execution over a local policy corpus (`docs/`).
- **Interactive Multi-Agent UI**: A Next.js 16/React 19 web application (`ultralight-orchestration`) allowing selection of various model providers (OpenAI, Anthropic, Google) and local RAG.
- **Programmatic Multi-Agent Orchestrator**: A programmatic execution loop within the web application that coordinates specialist agents (Planner, Coder, Designer) to solve development tasks.
- **5-Day Curriculum Structure**: A structured milestone plan with daily tasks, verification harnesses, and Kaggle submission deliverables.

## Capabilities

### New Capabilities
- `rag-backend`: Python FastAPI service providing document ingestion, vector storage, and query execution for a local policy corpus.
- `multi-agent-orchestrator`: Next.js frontend application with a model provider selector and a programmatic orchestration engine routing queries to specialist agents (Planner, Coder, Designer) and the RAG backend.

### Modified Capabilities
<!-- None -->

## Impact

- **Codebase**: Creates a new Python backend workspace under `phase-1/` containing scripts `step1.py` through `step4.py` and `app.py`.
- **Frontend**: Installs a new Next.js project under `ultralight-orchestration/` with Tailwind CSS v4 styling and Lucide icons.
- **Dependencies**: Adds Python dependencies (`fastapi`, `uvicorn`, `langchain-chroma`, `langchain-openai`, `langchain-text-splitters`) and npm packages (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`).
