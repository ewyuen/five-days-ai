## ADDED Requirements

### Requirement: UI Model Option for ReAct Agent
The Next.js user interface SHALL display a model option named "Local ReAct Agent (MCP)" in the model selector dropdown to let users switch to the ReAct agent.

#### Scenario: Selector lists ReAct agent
- **WHEN** the user opens the model selector dropdown
- **THEN** it displays "Local ReAct Agent (MCP)" as one of the options.

### Requirement: Model Configuration Check
The UI SHALL validate that the OpenAI API key is configured (either on the server or in the client settings) before marking the "Local ReAct Agent (MCP)" option as configured.

#### Scenario: Key missing indicator
- **WHEN** the OpenAI API key is not configured in settings and the server does not have it set
- **THEN** the model option indicator displays that the key is missing.

### Requirement: Streamed ReAct Agent Routing
The Next.js API route `/api/chat` SHALL intercept chat requests where the model is `local-react-agent` and forward them to the FastAPI `/agent-query` endpoint, streaming the response text back to the UI.

#### Scenario: Sending query to the agent
- **WHEN** the user submits a message with the "Local ReAct Agent (MCP)" model selected
- **THEN** the API router forwards the query to `/agent-query` and streams the response text chunk-by-chunk.
