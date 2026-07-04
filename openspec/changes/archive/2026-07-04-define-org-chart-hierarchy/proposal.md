## Why

To formally establish and spec a clean hierarchical structure (CEO -> VPs -> Managers -> Engineers/Staff) in the MCP server database, allowing ReAct agents to correctly trace approval workflows and escalations.

## What Changes

- **NEW** `openspec/changes/define-org-chart-hierarchy/specs/org-chart-hierarchy/spec.md`: Specification defining the formal organization structure rules (CEO, VPs, Managers, and Engineers).
- **MODIFICATION** `phase-1/org_chart_server.py`: Double-check and ensure the 21 mock employees strictly conform to the hierarchical structure where all VPs report to the CEO and all Managers report to VPs.

## Capabilities

### New Capabilities

- `org-chart-hierarchy`: Validates the structure where VPs report to CEO, managers report to VPs, and employees report to managers.

### Modified Capabilities

None.

## Impact

- `phase-1/org_chart_server.py`: Ensures perfect alignment with the spec rules.
