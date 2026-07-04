## Why

To allow frontend users to interact with the newly exposed ReAct agent (`POST /agent-query`) from the Next.js chat interface, enabling complex multi-turn queries involving company policy RAG and the MCP reporting hierarchy.

## What Changes

- **MODIFICATION** `generic-ai-client/src/lib/models.ts`: Add `local-react-agent` to the list of supported models.
- **MODIFICATION** `generic-ai-client/src/components/ModelSelector.tsx`: Include the new `local-react-agent` model in the API key configuration check.
- **MODIFICATION** `generic-ai-client/src/app/api/chat/route.ts`: Intercept and route messages for `local-react-agent` to the FastAPI backend's `/agent-query` endpoint, streaming the response.
- **NEW** `openspec/changes/add-react-agent-ui-option/specs/react-agent-ui/spec.md`: Capability spec for the ReAct Agent UI option integration.

## Capabilities

### New Capabilities

- `react-agent-ui`: Next.js model option that routes queries to the FastAPI ReAct agent and displays the streamed response.

### Modified Capabilities

None.

## Impact

- `generic-ai-client/src/lib/models.ts`: Updates the model registry.
- `generic-ai-client/src/components/ModelSelector.tsx`: Updates model configuration validation.
- `generic-ai-client/src/app/api/chat/route.ts`: Updates API routing logic.
