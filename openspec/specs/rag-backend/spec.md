# rag-backend Specification

## Purpose
TBD - created by archiving change five-day-rag-orchestration. Update Purpose after archive.
## Requirements
### Requirement: Document ingestion and vector indexing
The system SHALL support ingesting markdown policy documents from a local `docs/` directory, splitting the text into recursive chunks, and generating embeddings to store in a local Chroma vector database.

#### Scenario: Running ingestion pipeline
- **WHEN** the user runs the RAG indexing pipeline
- **THEN** the system splits the documents, calls the embedding API, and persists the vectors to the local database directory.

### Requirement: FastAPI query endpoint
The system SHALL expose a FastAPI endpoint at `POST /query` that performs similarity search over the vector database and generates a grounded response using only the retrieved contexts.

#### Scenario: Successful grounded query
- **WHEN** a client POSTs a query to `/query` with a question
- **THEN** the system retrieves matching chunks, invokes the LLM, and returns the grounded answer alongside the list of source documents and text previews.

### Requirement: Authentication API key validation
The system SHALL validate that an OpenAI or Google API key is available (via request payload, request headers, or environment variables) before performing embeddings or chat completions.

#### Scenario: Query request missing credentials
- **WHEN** a client POSTs a query to `/query` and no API key is provided in the request payload, headers, or environment
- **THEN** the system returns a 400 Bad Request error indicating that credentials are required.

