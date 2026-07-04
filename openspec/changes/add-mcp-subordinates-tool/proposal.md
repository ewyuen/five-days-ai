## Why

To support querying the immediate subordinates / direct reports of a given manager (e.g. Sarah Jenkins or Priya Rao) using our ReAct agent via the FastAPI backend and Next.js web client.

## What Changes

- **NEW TOOL** `phase-1/org_chart_server.py`: Add the `get_subordinates` FastMCP tool to query the list of direct reports for a given employee name.
- **NEW SPEC** `openspec/changes/add-mcp-subordinates-tool/specs/mcp-subordinates/spec.md`: Capability spec outlining subordinates querying requirements.

## Capabilities

### New Capabilities

- `mcp-subordinates`: MCP tool that returns a list of direct reports/immediate subordinates for a given employee name.

### Modified Capabilities

None.

## Impact

- `phase-1/org_chart_server.py`: Modifies the MCP server to implement the new tool handler.
