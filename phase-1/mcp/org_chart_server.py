"""Model Context Protocol (MCP) Server for Cumulonimbus Robotics Organization Chart.

Provides tools to look up employee details and trace reporting chains.
"""

import os
import json
from typing import Dict, List, Optional
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("Cumulonimbus-Org-Chart")

# Load employee database from JSON file relative to the script directory
base_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(base_dir, "org_chart.json")

with open(json_path, "r", encoding="utf-8") as f:
    EMPLOYEES: Dict[str, Dict[str, str]] = json.load(f)


def find_employee_by_name(name: str) -> Optional[Dict[str, str]]:
    """Helper to perform case-insensitive name matching."""
    name_lower = name.lower()
    for key, data in EMPLOYEES.items():
        # Match exact key or parts of name (e.g. "John" matches "John Doe")
        if name_lower == key.lower() or name_lower in key.lower():
            return data
    return None


@mcp.tool()
def get_employee(name: str) -> str:
    """Retrieve detailed profile of an employee by name, including their role, department, employment type, and manager.

    Args:
        name: Name of the employee (first name or full name).
    """
    emp = find_employee_by_name(name)
    if not emp:
        return f"Error: Employee '{name}' not found."
    return (
        f"Employee Profile:\n"
        f"- Name: {emp['name']}\n"
        f"- Role: {emp['role']}\n"
        f"- Employment Type: {emp['type']}\n"
        f"- Department: {emp['department']}\n"
        f"- Manager: {emp['manager'] if emp['manager'] else 'None (CEO)'}"
    )


@mcp.tool()
def get_manager_chain(name: str) -> str:
    """Get the list of managers in the direct reporting chain for an employee.

    Args:
        name: Name of the employee.
    """
    emp = find_employee_by_name(name)
    if not emp:
        return f"Error: Employee '{name}' not found."

    chain: List[str] = []
    current = emp
    while current["manager"]:
        mgr_name = current["manager"]
        mgr_emp = EMPLOYEES.get(mgr_name)
        if not mgr_emp:
            chain.append(f"{mgr_name} (External/Unknown)")
            break
        chain.append(f"{mgr_emp['name']} ({mgr_emp['role']})")
        current = mgr_emp

    if not chain:
        return f"{emp['name']} is at the top of the organization and has no manager."

    chain_str = "\n".join(f"{i+1}. {mgr}" for i, mgr in enumerate(chain))
    return f"Reporting Line / Manager Chain for {emp['name']}:\n{chain_str}"


@mcp.tool()
def get_subordinates(name: str) -> str:
    """Get the immediate subordinates (direct reports) for an employee.

    Args:
        name: Name of the employee.
    """
    emp = find_employee_by_name(name)
    if not emp:
        return f"Error: Employee '{name}' not found."

    subordinates: List[str] = []
    for emp_name, data in EMPLOYEES.items():
        if data["manager"] == emp["name"]:
            subordinates.append(f"- {data['name']} ({data['role']})")

    if not subordinates:
        return f"{emp['name']} has no immediate subordinates."

    subordinates_str = "\n".join(subordinates)
    return f"Immediate subordinates / direct reports of {emp['name']}:\n{subordinates_str}"


def validate_hierarchy() -> None:
    """Validate the org chart database against hierarchy rules:
    1. Exactly one CEO (manager = "").
    2. VPs report directly to the CEO.
    3. Managers/Leads report to VPs.
    4. All other employees report to Managers.
    """
    ceo_count = 0
    ceo_name = ""
    for name, data in EMPLOYEES.items():
        if data["role"] == "Chief Executive Officer":
            ceo_count += 1
            ceo_name = data["name"]
            assert data["manager"] == "", f"CEO '{name}' must have no manager."

    assert ceo_count == 1, f"Must have exactly one CEO. Found {ceo_count}."

    for name, data in EMPLOYEES.items():
        role = data["role"]
        manager_name = data["manager"]

        if role == "Chief Executive Officer":
            continue

        # Check VPs report to CEO
        if role.startswith("VP of"):
            assert manager_name == ceo_name, f"VP '{name}' must report to CEO '{ceo_name}'."
            continue

        # Find manager details
        assert manager_name in EMPLOYEES, f"Employee '{name}' has unknown manager '{manager_name}'."
        mgr_data = EMPLOYEES[manager_name]
        mgr_role = mgr_data["role"]

        # Check Managers/Leads report to VPs
        if role in ["Engineering Manager", "Software Manager", "QA Manager", "HR Manager", "Facilities Manager", "Manufacturing Lead"]:
            assert mgr_role.startswith("VP of"), f"Manager '{name}' (role: {role}) must report to a VP. Reports to '{manager_name}' (role: {mgr_role})."
            continue

        # Check ICs report to Managers
        assert mgr_role in [
            "Engineering Manager",
            "Software Manager",
            "QA Manager",
            "HR Manager",
            "Facilities Manager",
            "Manufacturing Lead"
        ], f"IC '{name}' must report to a Manager. Reports to '{manager_name}' (role: {mgr_role})."

    print("Org chart hierarchy validated successfully.")


if __name__ == "__main__":
    # Validate the organizational structure before starting the server
    validate_hierarchy()
    # Start the FastMCP stdio server
    mcp.run()
