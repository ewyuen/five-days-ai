## 1. Code Refactoring

- [x] 1.1 Refactor `phase-1/step5.py` to make `ask`, `load_vectorstore`, and model constants cleanly importable by external scripts.

## 2. FastAPI Integration

- [x] 2.1 Integrate the `org_chart_server.py` MCP lifecycle inside `phase-1/app.py` lifespan using `AsyncExitStack`.
- [x] 2.2 Create the `POST /agent-query` endpoint in `phase-1/app.py` executing the ReAct agent and returning the response.

## 3. Testing and Verification

- [x] 3.1 Verify the `/agent-query` endpoint with `curl` for complex vacation and approval questions.
- [x] 3.2 [Human Verification] Verify child MCP processes terminate cleanly when the FastAPI server stops.
