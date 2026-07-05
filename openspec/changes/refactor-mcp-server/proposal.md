## Why

To clean up the repository organization by placing the MCP server into its own subdirectory (`phase-1/mcp`) and separating data from logic by moving the hardcoded organizational database from `org_chart_server.py` into a standalone JSON file (`org_chart.json`).

## What Changes

- **NEW** `phase-1/mcp/org_chart.json`: JSON file storing the 21 employee profile records.
- **NEW** `phase-1/mcp/org_chart_server.py`: Refactored server loading employee data from `org_chart.json`.
- **DELETE** `phase-1/org_chart_server.py`: Removal of the old, hardcoded server script.
- **MODIFY** `phase-1/app.py`: Spawns the MCP server using the new path.
- **MODIFY** `phase-1/step5.py`: Spawns the MCP server using the new path.
- **NEW SPEC** `openspec/changes/refactor-mcp-server/specs/mcp-refactor/spec.md`: Spec documenting folder structure and database decoupling.

## Capabilities

### New Capabilities

- `mcp-folder-restructure`: Dedicated directory and externalized data source layout for org chart MCP server.

### Modified Capabilities

None.

## Impact

- `phase-1/org_chart_server.py` (deleted)
- `phase-1/mcp/org_chart_server.py` (new)
- `phase-1/mcp/org_chart.json` (new)
- `phase-1/app.py` (modified)
- `phase-1/step5.py` (modified)
