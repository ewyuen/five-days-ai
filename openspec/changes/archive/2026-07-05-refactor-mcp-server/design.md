## Context

Decoupling the hardcoded database of 21 employees makes the MCP server more modular and scalable. Moving it to `phase-1/mcp` helps organize the workspace.

## Goals / Non-Goals

**Goals:**
- Move all 21 employee records to a JSON file.
- Support directory-relative path loading of JSON.
- Retain structural validation logic on startup.

**Non-Goals:**
- Modifying tool schemas, arguments, or response formats.

## Decisions

### 1. Robust File Path Resolution
To ensure the server loads successfully when spawned by parent processes (e.g. from FastAPI or `step5.py`), the file path of `org_chart.json` will be resolved relative to the server script using:
```python
import os
import json

base_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(base_dir, "org_chart.json")
with open(json_path, "r", encoding="utf-8") as f:
    EMPLOYEES = json.load(f)
```

### 2. Spawner Path Realignment
FastAPI startup contexts and python agent scripts will be updated to spawn using `phase-1/mcp/org_chart_server.py`.
