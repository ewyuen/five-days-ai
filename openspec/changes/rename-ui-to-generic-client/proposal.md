## Why

Since the programmatic multi-agent orchestrator loop was removed, the Next.js frontend directory name `multi-agent-ui` is outdated and misleading. Renaming it to `generic-ai-client` ensures the codebase structure accurately represents its features (multi-model and local RAG chat integration) before final Kaggle submission.

## What Changes

- **Directory Rename**: Rename `multi-agent-ui/` folder to `generic-ai-client/`.
- **Configuration Updates**: Update references in root configurations (such as `.gitignore`) to target the new directory.
- **Spec Updates**: Update references in the main specification files to target `generic-ai-client`.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `multi-agent-orchestrator`: Update the specification from referencing `multi-agent-ui` to `generic-ai-client` and clarify the scoped features.

## Impact

- **Directory Structure**: `multi-agent-ui/` is renamed to `generic-ai-client/`.
- **Configuration**: Root `.gitignore` will ignore `generic-ai-client/.next/` and `generic-ai-client/node_modules/` instead of `multi-agent-ui/` counterparts.
