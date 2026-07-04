## Why

To support complex multi-turn queries that cross-reference both company policies (via RAG) and organizational reporting structures (via MCP). This expands the Day 3 ReAct agent to integrate multiple tools and reason across disparate data sources (e.g., matching a person's manager to policy thresholds).

## What Changes

- **NEW** `phase-1/step5.py`: ReAct agent execution loop connecting to RAG and MCP tools to resolve multi-step scenarios.
- **NEW** `phase-1/org_chart_server.py`: MCP server providing organization chart lookup tools (employee information, managers, and reporting lines).
- **MODIFICATION** `phase-1/pyproject.toml`: Add `mcp` dependency to enable standard Model Context Protocol client-server communication.
- **NEW** `openspec/changes/add-step5-react-agent/specs/react-agent-mcp/spec.md`: Capability spec for the ReAct agent and MCP server integration.

## Capabilities

### New Capabilities

- `react-agent-mcp`: ReAct reasoning agent that integrates local RAG policy document search and MCP organization chart queries to solve multi-turn organizational questions.

### Modified Capabilities

None.

## Impact

- `phase-1/pyproject.toml`: Adds `mcp` dependency.
- `phase-1/step5.py`: New entry point script.
- `phase-1/org_chart_server.py`: New MCP server script.
- `phase-1/chroma_db/`: Relies on the persisted vector database from Day 2.
