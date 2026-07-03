## MODIFIED Requirements

### Requirement: Model selector and client keys
The Next.js application (generic-ai-client) SHALL provide a model selector dropdown (supporting OpenAI, Anthropic, and Google Gemini models) and a Settings UI to manage API keys, storing credentials securely in browser local storage.

#### Scenario: Selecting a model provider
- **WHEN** the user selects a model from the selector dropdown
- **THEN** the system updates the chat context and utilizes the corresponding model and credentials for streaming chat completions.
