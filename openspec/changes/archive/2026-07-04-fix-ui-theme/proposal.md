## Why

The UI color scheme is currently hardcoded to dark colors in all components. Redeclaring the Tailwind zinc color variables using CSS custom properties (variables) that switch values based on the presence of the `.dark` class on the root element allows the theme selection buttons (Light, Dark, System) to function properly.

## What Changes

- **MODIFICATION** `generic-ai-client/src/app/globals.css`: Define CSS variables for Tailwind's zinc color scale and map them inside the `@theme` block. Update the light/dark values based on the `.dark` class.
- **NEW SPEC** `openspec/changes/fix-ui-theme/specs/ui-theme/spec.md`: Capability spec for UI theme support.

## Capabilities

### New Capabilities

- `ui-theme-support`: Toggle color schemes dynamically via CSS variables tied to the `.dark` root class.

### Modified Capabilities

None.

## Impact

- `generic-ai-client/src/app/globals.css`: Reconfigures theme color mapping.
