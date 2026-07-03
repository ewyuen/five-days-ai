## ADDED Requirements

### Requirement: Model selector and client keys
The Next.js application SHALL provide a model selector dropdown (supporting OpenAI, Anthropic, and Google Gemini models) and a Settings UI to manage API keys, storing credentials securely in browser local storage.

#### Scenario: Selecting a model provider
- **WHEN** the user selects a model from the selector dropdown
- **THEN** the system updates the chat context and utilizes the corresponding model and credentials for streaming chat completions.


### Requirement: Local RAG query routing
The Next.js chat API router SHALL intercept messages intended for the `local-rag` model and forward them to the FastAPI server at `/query`, displaying the results with a rendered list of sources.

#### Scenario: Querying local corpus
- **WHEN** the user selects the Local RAG model and asks a policy question
- **THEN** the application queries the FastAPI server and displays the answer with a formatted "Sources" block showing document names and previews.
