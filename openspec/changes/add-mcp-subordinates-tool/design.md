## Context

Expose a new `get_subordinates` tool via the FastMCP server `org_chart_server.py` to allow the ReAct agent to traverse down the manager-to-subordinate hierarchy.

## Goals / Non-Goals

**Goals:**
- Implement case-insensitive subordinate lookup matching the existing `EMPLOYEES` mock database structure.
- Return structured list of names and roles for all direct reports.

**Non-Goals:**
- Returning nested recursive subordinates (only immediate direct reports are returned by this query).

## Decisions

### 1. Tool Signature and Logic
Implement `get_subordinates(name: str) -> str` decorated with `@mcp.tool()`:
1. Call `find_employee_by_name(name)` to validate existence and resolve exact capitalization.
2. Iterate through the `EMPLOYEES` directory and collect all records where the `manager` field matches the validated employee's name.
3. If the list is empty, return a string indicating no subordinates.
4. If found, format the list of direct reports as a bulleted list: `"- {name} ({role})"`.
