## ADDED Requirements

### Requirement: CEO Position
The organization chart database MUST include exactly one CEO (Chief Executive Officer) position who is at the root of the organization and has no reporting manager.

#### Scenario: Retrieving CEO manager
- **WHEN** the client requests the manager of the CEO (e.g., Sarah Jenkins)
- **THEN** the system returns that the CEO has no reporting manager.

### Requirement: VP Positions and Reporting
The organization chart database MUST include VP (Vice President) positions representing major departments, and every VP MUST report directly to the CEO.

#### Scenario: Retrieving VP manager
- **WHEN** the client requests the manager of a VP (e.g., Priya Rao or Alex Rivera)
- **THEN** the system returns the CEO (Sarah Jenkins) as their manager.

### Requirement: Manager Positions and Reporting
The organization chart database MUST include Manager/Lead positions within departments, and every Manager/Lead MUST report directly to their department's VP.

#### Scenario: Retrieving manager's manager
- **WHEN** the client requests the manager of a Manager (e.g., Marcus Liang or Emily Chen)
- **THEN** the system returns the corresponding VP (Priya Rao or Alex Rivera) as their manager.

### Requirement: Employee/Engineer Reporting
Every individual contributor (Engineer, Technician, SDET, Recruiter) MUST report directly to a Manager.

#### Scenario: Tracing employee reporting chain
- **WHEN** the client traces the reporting chain of an Engineer (e.g., John Doe)
- **THEN** the system returns their Manager (Marcus Liang), their VP (Priya Rao), and the CEO (Sarah Jenkins) in order.
