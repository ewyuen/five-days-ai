## Why

To expose the advanced ReAct agent (which coordinates RAG policy lookup and MCP org chart queries) via a FastAPI endpoint. This allows client applications to submit complex cross-domain questions (e.g., policy rules mixed with management reporting lines) and receive reasoning-backed responses.

## What Changes

- **MODIFICATION** `phase-1/app.py`:
  - Update `lifespan` startup to launch the MCP `org_chart_server.py` as a subprocess and establish a client session.
  - Update `lifespan` shutdown to clean up and terminate the MCP subprocess.
  - Add a new endpoint `POST /agent-query` exposing the ReAct agent loop.
- **MODIFICATION** `phase-1/step5.py`:
  - Refactor to export reusable `ask` logic and tool specifications, making it cleanly importable by `app.py`.
- **NEW** `openspec/changes/expose-react-agent-mcp-fastapi/specs/react-agent-api/spec.md`: Capability spec for the ReAct Agent API endpoint.

## Capabilities

### New Capabilities

- `react-agent-api`: Exposes the ReAct RAG and MCP agent via a FastAPI `POST /agent-query` endpoint.

### Modified Capabilities

None.

## Impact

- `phase-1/app.py`: Integrates MCP lifecycle and new POST route.
- `phase-1/step5.py`: Refactored to enable clean imports.
