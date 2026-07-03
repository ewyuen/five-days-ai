## Context

The Next.js client folder is currently named `multi-agent-ui`. Since the multi-agent orchestrator has been removed, this name is no longer appropriate. We need to rename the folder to `generic-ai-client` and update all path and configuration references in the project.

## Goals / Non-Goals

**Goals:**
- Rename `multi-agent-ui/` directory to `generic-ai-client/`.
- Search and replace all references to `multi-agent-ui` across project configuration files, tests, and documentation.
- Verify the Next.js project still builds and runs correctly under the new directory.

**Non-Goals:**
- Modifying UI layouts, styles, or page logic (only paths/folder names are updated).

## Decisions

### 1. Unified Directory Rename
- **Decision**: Perform a directory rename on the filesystem and update git tracking.
- **Alternatives considered**: Creating a new folder and copying files. This loses git history for the client, whereas a rename preserves history.

## Risks / Trade-offs

- **Broken path references** → *Mitigation*: Run a comprehensive search for `multi-agent-ui` and verify all occurrences are replaced.
- **Broken Next.js dependencies or caching** → *Mitigation*: Delete the local `.next` build folder and re-run `npm run build` after the rename.
