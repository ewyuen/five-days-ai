# ui-theme Specification

## Purpose
TBD - created by archiving change fix-ui-theme. Update Purpose after archive.
## Requirements
### Requirement: Light Mode Theme
The UI SHALL switch to a light color palette when the `.dark` class is absent from the root `html` element.

#### Scenario: Switching to Light Mode
- **WHEN** the user selects "Light" theme in the Sidebar
- **THEN** the root background becomes white/light gray, and text becomes dark gray/black.

### Requirement: Dark Mode Theme
The UI SHALL switch to a dark color palette when the `.dark` class is present on the root `html` element.

#### Scenario: Switching to Dark Mode
- **WHEN** the user selects "Dark" theme in the Sidebar
- **THEN** the root background becomes zinc-950, and text becomes zinc-100.

### Requirement: Smooth Transition
Color shifts SHALL have smooth transition animations when toggling between themes.

#### Scenario: Transition styling
- **WHEN** the theme changes
- **THEN** background-color and text-color transition smoothly over 0.2 seconds.

