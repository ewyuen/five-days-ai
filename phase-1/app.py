"""FastAPI wrapper around the persistent Chroma RAG pipeline.

Endpoints:
    GET  /           Landing page (HTML)
    GET  /health     Liveness probe (returns ok & database status)
    POST /query      JSON in/out: {"question": "..."} -> {"answer": "...", "sources": [...]}

Run from root with: uv run uvicorn phase-1.app:app --reload
"""

import os
import sys
from contextlib import asynccontextmanager, AsyncExitStack
from pathlib import Path
from threading import Lock
from typing import Annotated, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from langchain_chroma import Chroma
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI, AsyncOpenAI
from pydantic import BaseModel, Field
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from .step5 import ask, build_openai_tools

load_dotenv()

DOCS_DIR = Path("phase-1/ingest_docs")
CHROMA_DIR = Path("phase-1/chroma_db")
EMBEDDING_MODEL = "text-embedding-3-small"
CHAT_MODEL = "gpt-4o-mini"
TOP_K = 3

# Module-level state populated in lifespan startup and on-demand
state: dict = {}
lock = Lock()


def build_or_load_vectorstore(api_key: str | None = None) -> Chroma:
    """Load the persistent Chroma store if it exists; otherwise build and persist it."""
    if api_key:
        embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL, openai_api_key=api_key)
    else:
        embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)

    if CHROMA_DIR.exists() and any(CHROMA_DIR.iterdir()):
        print(f"[app] loading existing persistent index from {CHROMA_DIR}")
        return Chroma(persist_directory=str(CHROMA_DIR), embedding_function=embeddings)

    print(f"[app] building persistent index from {DOCS_DIR}")
    if not DOCS_DIR.exists():
        raise FileNotFoundError(f"Source documents folder '{DOCS_DIR}' not found.")

    loader = DirectoryLoader(
        str(DOCS_DIR),
        glob="**/*.md",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
    )
    raw_docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=80)
    chunks = splitter.split_documents(raw_docs)
    return Chroma.from_documents(chunks, embeddings, persist_directory=str(CHROMA_DIR))


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[startup] checking environment for default credentials...")
    exit_stack = AsyncExitStack()
    state["exit_stack"] = exit_stack
    
    if os.environ.get("OPENAI_API_KEY"):
        try:
            print("[startup] initializing vector store...")
            state["store"] = build_or_load_vectorstore()
            state["client"] = OpenAI()
            state["async_client"] = AsyncOpenAI()
            
            # Spawn MCP Org Chart Server subprocess
            print("[startup] spawning MCP server subprocess...")
            server_params = StdioServerParameters(
                command=sys.executable,
                args=["phase-1/mcp/org_chart_server.py"],
                env=None
            )
            read_stream, write_stream = await exit_stack.enter_async_context(stdio_client(server_params))
            mcp_session = await exit_stack.enter_async_context(ClientSession(read_stream, write_stream))
            await mcp_session.initialize()
            state["mcp_session"] = mcp_session
            
            # Retrieve tools and construct OpenAI tools schema
            mcp_tools_resp = await mcp_session.list_tools()
            state["openai_tools"] = build_openai_tools(mcp_tools_resp.tools)
            print("[startup] initialization successful")
        except Exception as e:
            print(f"[startup] failed to initialize: {e}. Will attempt on-demand initialization.")
    else:
        print("[startup] OPENAI_API_KEY not found in environment. Deferring initialization to query time.")
    yield
    print("[shutdown] cleaning up resources...")
    await exit_stack.aclose()
    state.clear()


app = FastAPI(title="5-Day RAG Backend API", lifespan=lifespan)


class QueryRequest(BaseModel):
    question: Annotated[str, Field(min_length=1, max_length=500)]
    openai_api_key: str | None = None


class Source(BaseModel):
    document: str
    preview: str


class QueryResponse(BaseModel):
    answer: str
    sources: list[Source]


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return """
    <html>
      <body style="font-family: system-ui, sans-serif; max-width: 640px; margin: 4rem auto; padding: 0 1rem; background: #09090b; color: #f4f4f5;">
        <h1 style="color: #6366f1;">5-Day RAG Backend Server</h1>
        <p style="color: #a1a1aa;">Send questions via POST requests to <code>/query</code> as JSON:</p>
        <pre style="background: #18181b; padding: 1rem; border-radius: 0.5rem; border: 1px solid #27272a; color: #a78bfa;">{
  "question": "How many vacation days do I get?"
}</pre>
        <p style="color: #a1a1aa;">Interactive documentation is available at <a href="/docs" style="color: #6366f1;">/docs</a>.</p>
      </body>
    </html>
    """


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "store_ready": "store" in state,
        "database_path": str(CHROMA_DIR),
        "documents_path": str(DOCS_DIR)
    }


@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest) -> QueryResponse:
    # On-demand initialization of store and client if not already done on startup
    if "store" not in state or "client" not in state:
        resolved_key = req.openai_api_key or os.environ.get("OPENAI_API_KEY")
        if not resolved_key:
            raise HTTPException(
                status_code=400,
                detail="OpenAI API Key is missing. Set it in env or pass openai_api_key in request body."
            )
        
        with lock:
            if "store" not in state:
                try:
                    state["store"] = build_or_load_vectorstore(resolved_key)
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"Failed to build vector store: {e}")
            if "client" not in state:
                state["client"] = OpenAI(api_key=resolved_key)

    store: Chroma = state["store"]
    client: OpenAI = state["client"]

    try:
        hits = store.similarity_search(req.question, k=TOP_K)
        context = "\n\n---\n\n".join(h.page_content for h in hits)

        system = (
            "Answer the user's question using ONLY the context below. "
            "If the answer is not in the context, say 'I don't know based on the provided documents.' "
            "Quote specific numbers and names verbatim when they appear.\n\n"
            f"CONTEXT:\n{context}"
        )

        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": req.question},
            ],
        )

        sources = [
            Source(
                document=Path(h.metadata.get("source", "?")).name,
                preview=h.page_content[:160].replace("\n", " "),
            )
            for h in hits
        ]

        return QueryResponse(answer=response.choices[0].message.content, sources=sources)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Query execution failed: {e}")


async def ensure_initialized(api_key: str | None = None):
    """Ensure vector store, clients, and MCP server are initialized."""
    if "store" not in state or "mcp_session" not in state:
        resolved_key = api_key or os.environ.get("OPENAI_API_KEY")
        if not resolved_key:
            raise HTTPException(
                status_code=400,
                detail="OpenAI API Key is missing. Set it in env or pass openai_api_key in request body."
            )
        
        with lock:
            if "store" not in state:
                try:
                    state["store"] = build_or_load_vectorstore(resolved_key)
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"Failed to build vector store: {e}")
            if "client" not in state:
                state["client"] = OpenAI(api_key=resolved_key)
            if "async_client" not in state:
                state["async_client"] = AsyncOpenAI(api_key=resolved_key)
            if "mcp_session" not in state:
                try:
                    if "exit_stack" not in state:
                        state["exit_stack"] = AsyncExitStack()
                    exit_stack = state["exit_stack"]
                    server_params = StdioServerParameters(
                        command=sys.executable,
                        args=["phase-1/mcp/org_chart_server.py"],
                        env=None
                    )
                    read_stream, write_stream = await exit_stack.enter_async_context(stdio_client(server_params))
                    mcp_session = await exit_stack.enter_async_context(ClientSession(read_stream, write_stream))
                    await mcp_session.initialize()
                    state["mcp_session"] = mcp_session
                    mcp_tools_resp = await mcp_session.list_tools()
                    state["openai_tools"] = build_openai_tools(mcp_tools_resp.tools)
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"Failed to initialize MCP: {e}")


class AgentQueryRequest(BaseModel):
    question: Annotated[str, Field(min_length=1, max_length=500)]
    openai_api_key: str | None = None


class AgentQueryResponse(BaseModel):
    answer: str


@app.post("/agent-query", response_model=AgentQueryResponse)
async def agent_query(req: AgentQueryRequest) -> AgentQueryResponse:
    await ensure_initialized(req.openai_api_key)
    
    store = state["store"]
    client = state["async_client"]
    mcp_session = state["mcp_session"]
    openai_tools = state["openai_tools"]
    
    try:
        ans = await ask(req.question, store, client, mcp_session, openai_tools)
        return AgentQueryResponse(answer=ans)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Agent reasoning loop failed: {e}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
