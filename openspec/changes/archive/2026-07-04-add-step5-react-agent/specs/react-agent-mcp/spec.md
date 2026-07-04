## ADDED Requirements

### Requirement: ReAct Agent Loop with RAG and MCP tools
The system SHALL support running a ReAct reasoning loop that integrates:
1. A RAG retrieval tool querying the company policy knowledge base.
2. An MCP client connecting to an organization chart MCP server to retrieve reporting structures and employee roles.
The agent SHALL execute multiple reasoning turns (Thought, Action/Tool Call, Observation/Tool Result) to resolve complex, cross-domain questions that require both policy and hierarchy information.

#### Scenario: Answering cross-domain questions
- **WHEN** the agent is asked a query combining policy constraints and organization hierarchy (e.g., "Who can approve John to purchase a computer which costs $1,500?")
- **THEN** the agent SHALL query the MCP server to identify John's manager, query the RAG policy to determine the approval threshold and required approval level, and output the correct approving authority.

### Requirement: Model Context Protocol (MCP) Organization Chart Server
The system SHALL provide an MCP server exposing tools to inspect the organization structure of Cumulonimbus Robotics. 
The server data SHALL include a hierarchy of at least 20 mock employees representing roles such as executives, VP-level officers, engineering managers, engineers, operations staff, and human resources.
The server SHALL expose a tool to:
1. Retrieve employee details (role, manager, department) by name.
2. Trace the management chain from an employee to the executive team.

#### Scenario: Employee lookup via MCP tool
- **WHEN** a client invokes the MCP lookup tool for an employee (e.g., "John")
- **THEN** the tool returns their position, department, and reporting manager.
