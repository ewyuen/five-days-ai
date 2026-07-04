## 1. Setup and Dependencies

- [x] 1.1 Add the `mcp` dependency to `phase-1/pyproject.toml` and execute `uv sync`.

## 2. Implement MCP Org Chart Server

- [x] 2.1 Create `phase-1/org_chart_server.py` with a 20-employee hierarchy representing Cumulonimbus Robotics.
- [x] 2.2 Expose MCP tools (`get_employee` and `get_manager_chain`) in `phase-1/org_chart_server.py` using `FastMCP`.
- [x] 2.3 Verify the MCP server is syntax-correct and can start without errors.

## 3. Implement ReAct Agent with RAG and MCP Tools

- [x] 3.1 Setup `phase-1/step5.py` skeleton with OpenTelemetry logging, similar to `step4.py`.
- [x] 3.2 Implement the standard MCP client in `phase-1/step5.py` using stdio transport to communicate with `org_chart_server.py`.
- [x] 3.3 Implement `search_policies` tool in `phase-1/step5.py` querying the Chroma vector database.
- [x] 3.4 Integrate the tools and run the ReAct execution loop to answer questions.

## 4. Verification and Documentation

- [x] 4.1 Execute `phase-1/step5.py` with multi-step test cases for vacation days and manager approval thresholds.
- [x] 4.2 Update `phase-1/README.md` with instructions for running and verifying Day 4 deliverables.
- [x] 4.3 [Human Verification] Verify final answers and trace output manually.
