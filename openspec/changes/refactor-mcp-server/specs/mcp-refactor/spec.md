## ADDED Requirements

### Requirement: Dedicated MCP Directory
The Org Chart MCP server script and its data files SHALL reside within `phase-1/mcp/`.

#### Scenario: Script execution path
- **WHEN** running the MCP server via FastAPI or Step 5
- **THEN** it must execute `phase-1/mcp/org_chart_server.py`.

### Requirement: Externalized Org Chart Data
The organizational structure database SHALL be loaded dynamically from `org_chart.json` located in the same directory.

#### Scenario: Database decoupling
- **WHEN** the server is started
- **THEN** it reads and validates `org_chart.json` instead of using a hardcoded dictionary.

### Requirement: Tool Behavior Consistency
All existing MCP tools (`get_employee`, `get_manager_chain`, and `get_subordinates`) SHALL preserve their logic and behavior when querying the parsed JSON database.

#### Scenario: Direct reports query
- **WHEN** the ReAct agent runs a subordinate lookup for "Sarah Jenkins"
- **THEN** the server returns the three correct VPs resolved from JSON.
