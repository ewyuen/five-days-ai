## Context

The organization chart database in `org_chart_server.py` contains 21 mock employees. To prevent disconnected hierarchies or incorrect reporting lines (e.g. a manager reporting to an engineer), we formally document and verify the strict three-tier management chain: CEO -> VPs -> Managers -> Engineers/Staff.

## Goals / Non-Goals

**Goals:**
- Formally document the roles and reporting relationships.
- Ensure `org_chart_server.py` strictly complies with this structure.
- Add self-verification tests to ensure no loops or disconnected members exist in the org chart.

**Non-Goals:**
- Dynamic org chart editing (modifying reporting lines at runtime).

## Decisions

### 1. The Structure Layout
We define:
1. **Tier 0: Executive (CEO)**:
   - Sarah Jenkins (Chief Executive Officer) - Reports to: None
2. **Tier 1: Department VPs**:
   - Priya Rao (VP of Hardware) - Reports to: Sarah Jenkins
   - Alex Rivera (VP of Software) - Reports to: Sarah Jenkins
   - Thomas Wright (VP of Operations) - Reports to: Sarah Jenkins
3. **Tier 2: Managers / Leads**:
   - Marcus Liang (Engineering Manager) - Reports to: Priya Rao
   - David Kim (Manufacturing Lead) - Reports to: Priya Rao
   - Emily Chen (Software Manager) - Reports to: Alex Rivera
   - Kevin Novak (QA Manager) - Reports to: Alex Rivera
   - Jessica Taylor (HR Manager) - Reports to: Thomas Wright
   - Oliver Queen (Facilities Manager) - Reports to: Thomas Wright
4. **Tier 3: Individual Contributors (ICs)**:
   - Report directly to Tier 2 Managers.

### 2. Validation / Self-Test Logic
- Add a helper function or script to verify that the management chain contains no loops and resolves to the CEO or None for all employees.
