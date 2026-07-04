## Context

Exposing the async ReAct agent loop via a FastAPI endpoint requires a persistent connection to the MCP org chart server. Re-spawning a subprocess on every HTTP request is highly inefficient and risks process leaks. Therefore, we must manage the MCP server subprocess connection in the application lifespan.

## Goals / Non-Goals

**Goals:**
- Add `POST /agent-query` to `app.py`.
- Refactor `step5.py` to export its core logic (`ask` and OpenAI tool list construction) cleanly.
- Use `AsyncExitStack` inside FastAPI `lifespan` to manage the async contexts (`stdio_client` and `ClientSession`) cleanly.

**Non-Goals:**
- Supporting hot-reloads of the MCP server schema without restarting FastAPI.

## Decisions

### 1. Refactoring `step5.py` for Imports
We will make `step5.py` cleanly importable by ensuring that the database loading, OpenTelemetry initialization, and core `ask` logic can be imported without executing the main CLI test block (which will remain under `if __name__ == "__main__":`).

### 2. Lifespan Subprocess Management in FastAPI
FastAPI's `lifespan` will use `contextlib.AsyncExitStack` to safely enter the asynchronous contexts of the MCP client:
```python
from contextlib import AsyncExitStack
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    exit_stack = AsyncExitStack()
    state["exit_stack"] = exit_stack
    try:
        # Spawn MCP server subprocess
        server_params = StdioServerParameters(command=sys.executable, args=["phase-1/org_chart_server.py"])
        read_stream, write_stream = await exit_stack.enter_async_context(stdio_client(server_params))
        mcp_session = await exit_stack.enter_async_context(ClientSession(read_stream, write_stream))
        await mcp_session.initialize()
        state["mcp_session"] = mcp_session
        
        # Build tools
        mcp_tools_resp = await mcp_session.list_tools()
        # Save tools and session globally
    except Exception as e:
        print(f"Error starting MCP session: {e}")
    yield
    # Clean up and terminate subprocesses
    await exit_stack.aclose()
```
This guarantees that when uvicorn stops or reloads, the MCP subprocess is cleanly terminated.

### 3. Route Signature for `/agent-query`
```python
class AgentQueryRequest(BaseModel):
    question: str
    openai_api_key: Optional[str] = None

class AgentQueryResponse(BaseModel):
    answer: str
```
We will check if `OPENAI_API_KEY` is provided in the request or exists in the environment, and use it to instantiate the async OpenAI client.

## Risks / Trade-offs

- **[Risk]** If uvicorn crashes abruptly, subprocesses might become zombies.
- **[Mitigation]** Standard standard error/close handling of `AsyncExitStack` guarantees subprocess termination on normal exits. On abnormal exits, the OS cleans up child processes, and the port/file bindings are released.
