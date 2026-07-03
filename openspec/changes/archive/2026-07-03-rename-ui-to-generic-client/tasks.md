## 1. Rename Directory & Root Configuration

- [x] 1.1 Rename directory `multi-agent-ui/` to `generic-ai-client/` using git command to preserve history.
- [x] 1.2 Update root `.gitignore` to replace references of `multi-agent-ui` with `generic-ai-client`.

## 2. Reference Refactoring

- [x] 2.1 Search and replace all references to `multi-agent-ui` in project documentation (`Kaggle_Capstone_Writeup.md`, `phase-1/README.md`, `.agents/AGENTS.md`).
- [x] 2.2 Rename any workspace settings or internal project parameters referencing the old client name.

## 3. Build & Verify

- [x] 3.1 Install node modules and run clean build inside the renamed `generic-ai-client/` directory.
- [ ] 3.2 [Human Verification] Start the dev server under `generic-ai-client/` and verify the UI connects successfully to port 8000 and works.
