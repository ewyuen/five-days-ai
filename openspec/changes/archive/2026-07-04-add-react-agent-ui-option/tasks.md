## 1. UI Option Setup

- [x] 1.1 Add the `local-react-agent` model to `generic-ai-client/src/lib/models.ts`.
- [x] 1.2 Update `isKeyConfigured` in `generic-ai-client/src/components/ModelSelector.tsx` to check OpenAI key status for the ReAct model.

## 2. API Forwarding

- [x] 2.1 Update `generic-ai-client/src/app/api/chat/route.ts` to forward `local-react-agent` requests to `/agent-query` and stream response.

## 3. Verification

- [x] 3.1 Test selecting the "Local ReAct Agent (MCP)" model in the browser and querying a multi-turn approval question.
- [x] 3.2 [Human Verification] Verify the response displays correctly in the browser chat bubbles.
