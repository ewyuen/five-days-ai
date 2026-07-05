## 1. Code Refactoring

- [x] 1.1 Create the `phase-1/mcp` directory and move `org_chart_server.py` there.
- [x] 1.2 Extract the hardcoded `EMPLOYEES` dictionary into `phase-1/mcp/org_chart.json`.
- [x] 1.3 Refactor `phase-1/mcp/org_chart_server.py` to load data from `org_chart.json`.
- [x] 1.4 Update references to `org_chart_server.py` inside `phase-1/app.py` and `phase-1/step5.py`.

## 2. Verification

- [x] 2.1 Verify executing the refactored MCP server script directly runs successfully and passes validation.
- [x] 2.2 Verify running `step5.py` spawns the server and queries organizational details correctly.
- [x] 2.3 [Human Verification] Verify the frontend interface successfully queries organizational details using the ReAct agent model.
