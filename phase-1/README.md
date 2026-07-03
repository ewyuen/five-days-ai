# Phase 1 — RAG & AI Agent Backend Prototyping

This folder contains the Python scripts, configuration files, and raw documents for the 5-Day RAG and Multi-Agent project backend.

---

## 🛠️ Environment Setup & Configuration

### 1. Initialize Virtual Environment & Packages
Using `uv`, sync dependencies and initialize the virtual environment:
```powershell
# In PowerShell:
uv venv
uv sync
```

### 2. Configure Environment Secrets
Create a `.env` file in the `phase-1/` directory and populate it with your OpenAI API key:
```ini
OPENAI_API_KEY=your-api-key-here
```

---

## 🧪 Testing and Verification Procedures

### Day 1: Conversation Basics & Connection Tests

#### 1. Single-Call LLM Completion (`step1.py`)
This script verifies basic OpenAI API connectivity by asking a single conceptual question.
*   **Run command (from repository root)**:
    ```bash
    uv run phase-1/step1.py
    ```
*   **Expected output**:
    ```
    Calling OpenAI API for a single chat completion...

    Response:
    An AI engineer is a professional who designs, develops, and implements artificial intelligence systems and applications to solve complex problems and enhance automation across various industries.
    ```

#### 2. Multi-Turn Mentoring Chat Loop (`step2.py`)
This script hosts an interactive CLI chatbot loop acting as a terse senior developer mentoring you. It includes built-in exponential backoff retries for connection stability.
*   **Run command (from repository root)**:
    ```bash
    uv run phase-1/step2.py
    ```
*   **Expected interaction**:
    ```
    Chatting with gpt-4o-mini. Type 'exit' to quit.

    you> what is an embedding?
    bot> An embedding is a vector representation of data (like words or images) that captures its semantic meaning in a high-dimensional space. It allows models to easily compare and find relationships between different items. What kind of data are you looking to embed?

    you> text data
    bot> Text embeddings represent words, sentences, or documents as dense vectors. We use similarity measures like cosine distance to find semantically similar texts. Do you have a specific embedding model in mind for your project?

    you> exit
    bye.
    ```

### Day 2: Persistent RAG Ingestion & FastAPI Server

#### 1. Ingest Documents into Persistent Chroma Vector DB (`step3.py`)
This script loads documents from `phase-1/ingest_docs/`, recursively splits them, embeds them, and persists the vector database to `phase-1/chroma_db/`.
*   **Run command**:
    ```bash
    uv run phase-1/step3.py
    ```
*   **Expected behavior**: Checks for existing `chroma_db/` directory, builds it if missing, and executes baseline similarity search test queries.

#### 2. Run the FastAPI Server (`app.py`)
Exposes the RAG system as an API endpoint. Reuses the persistent database index created by `step3.py` for sub-second startup times.
*   **Run command (starts on port 8000)**:
    ```bash
    uv run uvicorn phase-1.app:app --host 127.0.0.1 --port 8000
    ```

#### 3. Health Check Endpoint
*   **Test command**:
    ```bash
    curl.exe http://127.0.0.1:8000/health
    ```
*   **Expected response**:
    ```json
    {"status":"ok","store_ready":true,"database_path":"phase-1\\chroma_db","documents_path":"phase-1\\ingest_docs"}
    ```

#### 4. Grounded Query Endpoint
*   **Test command**:
    ```bash
    curl.exe -X POST http://127.0.0.1:8000/query -H "Content-Type: application/json" -d "{\"question\": \"How many vacation days do I get?\"}"
    ```
*   **Expected response**:
    ```json
    {
      "answer": "Full-time employees at Cumulonimbus Robotics accrue 22 days of paid vacation per calendar year.",
      "sources": [
        {
          "document": "vacation_policy.md",
          "preview": "# Cumulonimbus Robotics — Vacation Policy  Effective: 2026-01-15  ## Annual Leave  ..."
        }
      ]
    }
    ```

---

### Day 3: Autonomous Agent Loop & OpenTelemetry Tracing

#### 1. ReAct Agent Loop & Safe Calculator Tool (`step4.py`)
This script executes a ReAct reasoning loop. If a prompt requires mathematical calculations, the agent generates a calculator tool request, executes it safely, feeds it back into context, and generates a final response. The entire lifecycle is instrumented with OpenTelemetry.
*   **Run command**:
    ```bash
    uv run phase-1/step4.py
    ```

#### 2. OpenTelemetry Telemetry Verification
When running the script, OpenTelemetry dumps JSON objects representing tracing spans straight to the terminal standard output.
*   **Expected trace spans**:
    *   `llm_call`: Captures call duration, model, and whether tool calling was utilized.
    *   `tool_execution`: Tracks arguments and output of the calculator tool.
    *   `agent_step_N`: Spans representing each reasoning turn in the ReAct process.
    *   `agent_query`: Root parent span encapsulating the complete user query lifecycle.

---

### Day 4: Next.js UI & Local RAG Integration

#### 1. Start the FastAPI RAG Backend (If not already running)
Ensure the FastAPI backend is running on port 8000 so the Next.js app can intercept and route local RAG queries:
*   **Run command**:
    ```bash
    uv run uvicorn phase-1.app:app --host 127.0.0.1 --port 8000
    ```

#### 2. Start the Next.js Development Server
Start the frontend interface from the `generic-ai-client/` directory:
*   **Run commands**:
    ```bash
    cd generic-ai-client
    npm run dev
    ```

#### 3. Frontend Verification Steps
1.  Open your browser and navigate to `http://localhost:3000`.
2.  Open the **Settings Modal** (gear icon in the sidebar or top-right header) and save a valid OpenAI API key.
3.  Choose the **Local RAG (ag20)** model in the selector dropdown.
4.  Submit a policy query (e.g., *"How many vacation days do I accrue?"*).
5.  **Expected Output**: The UI streams the grounded answer from the FastAPI server and displays a structured **Sources** block listing referenced documents (e.g. `vacation_policy.md`) with context previews.



