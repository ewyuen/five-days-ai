# mcp-subordinates Specification

## Purpose
TBD - created by archiving change add-mcp-subordinates-tool. Update Purpose after archive.
## Requirements
### Requirement: Querying Direct Reports
The MCP server tool `get_subordinates` SHALL return a formatted string listing the name and role of each employee whose manager field matches the queried employee name.

#### Scenario: Querying the CEO
- **WHEN** `get_subordinates` is called with "Sarah Jenkins" (Chief Executive Officer)
- **THEN** it SHALL return the list of VPs who report directly to Sarah Jenkins.

#### Scenario: Querying an IC with no direct reports
- **WHEN** `get_subordinates` is called with an employee who has no reports
- **THEN** it SHALL return a friendly message stating they have no immediate subordinates.

#### Scenario: Querying an invalid employee name
- **WHEN** `get_subordinates` is called with a name not present in the organization database
- **THEN** it SHALL return an error message indicating the employee was not found.

