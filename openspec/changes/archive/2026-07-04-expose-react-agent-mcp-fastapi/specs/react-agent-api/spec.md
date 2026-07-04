## ADDED Requirements

### Requirement: FastAPI `/agent-query` Endpoint
The FastAPI system SHALL expose a `POST /agent-query` endpoint that accepts a JSON payload with a question and optional OpenAI API key, executes the ReAct reasoning agent loop with access to both RAG policies and MCP organization tools, and returns the final response.

#### Scenario: Submitting a cross-domain query
- **WHEN** a client POSTs a query to `/agent-query` with `{"question": "Who can approve John Doe to purchase a computer which costs $1500?"}`
- **THEN** the server runs the ReAct loop, coordinates tool calls to the RAG database and the MCP server, and returns `{"answer": "<the correct approving VP name and explanation>"}`.

### Requirement: Lifespan Management of the MCP Server Subprocess
The FastAPI application SHALL manage the lifecycle of the local MCP organization chart server using FastAPI `lifespan` handlers. It must launch the MCP server as a subprocess on startup, maintain a persistent connection in the application state, and terminate the subprocess cleanly on application shutdown.

#### Scenario: Server startup and shutdown
- **WHEN** the FastAPI server starts up and shuts down
- **THEN** it spawns the MCP server subprocess on start, initializes the MCP client session, and terminates the subprocess on shutdown to prevent process leaks.
