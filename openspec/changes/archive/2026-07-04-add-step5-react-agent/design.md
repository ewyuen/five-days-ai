## Context

The current ReAct agent implementation (`step4.py`) executes a reasoning loop with a single safe math tool. To answer complex operational queries (e.g., policy constraints combined with organization hierarchy), the agent needs access to company policies (RAG) and the reporting structure (MCP). 

## Goals / Non-Goals

**Goals:**
- Implement a Python-based MCP server containing a mock 20-employee organization chart for Cumulonimbus Robotics.
- Expose MCP tools for looking up employee details and tracing reporting/management chains.
- Implement a `step5.py` ReAct agent that:
  - Spawns the local MCP server as a subprocess using standard Model Context Protocol stdio transport.
  - Utilizes a RAG tool to search the persistent Chroma vector store.
  - Combines these tools to resolve multi-step queries (e.g., matching a person's manager to policy limits).
- Keep instrumentation with OpenTelemetry console spans for step-by-step tracing.

**Non-Goals:**
- Exposing the multi-tool ReAct agent through the FastAPI server or Next.js UI (this change focuses on the core Python CLI script `step5.py` for verification).

## Decisions

### 1. Model Context Protocol (MCP) Integration
- **Choice**: Use the official `mcp` Python SDK (FastMCP) for the server, and `mcp.client` for the client transport.
- **Alternative**: Writing a custom JSON-RPC protocol over stdin/stdout.
- **Rationale**: The official `mcp` SDK handles schema validation, standard protocol handshake, and asynchronous message framing, reducing bug surface and aligning with standard MCP tooling.

### 2. Employee Hierarchy Data Structure
We will populate a 20-employee structure with:
- CEO (Sarah Jenkins)
- VP of Hardware (Priya Rao)
- VP of Software (Alex Rivera)
- Engineering Managers (e.g., Marcus Liang, Emily Chen)
- Engineers (e.g., John Doe, Alice Smith)
- HR / Operations staff
John Doe reports to Engineering Manager Marcus Liang, who reports to VP of Hardware Priya Rao, who reports to CEO Sarah Jenkins.

### 3. Tool Suite for the ReAct Agent
- `search_policies`: Queries the local Chroma database to retrieve relevant segments of company policy.
- `get_employee`: Searches the organization chart MCP server to retrieve roles and manager details.
- `get_management_chain`: Traces reporting manager chain up to VP/CEO to find who has approval authorities.

## Risks / Trade-offs

- **[Risk] Subprocess Python environment mismatches** when spawning the MCP server.
- **[Mitigation]** Use `sys.executable` (current Python interpreter) in the stdio client client parameters to ensure the subprocess runs in the exact same virtual environment (`.venv`) containing all required dependencies.
