"""Step 3: Local RAG Ingestion & Similarity Search Testing

Pipeline:
    ingest_docs/*.md  --[split]-->  chunks  --[embed]-->  vectors  --[store]-->  Chroma
    user question  --[embed]-->  query vector  --[search Chroma]-->  top-k chunks
    top-k chunks + question  --[prompt]-->  LLM  --[answer]-->  output

Run from root with: uv run phase-1/step3.py
"""

from pathlib import Path
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI

load_dotenv()

# Use paths relative to repository root as specified in AGENTS.md
DOCS_DIR = Path("phase-1/ingest_docs")
CHROMA_DIR = Path("phase-1/chroma_db")
EMBEDDING_MODEL = "text-embedding-3-small"
CHAT_MODEL = "gpt-4o-mini"
TOP_K = 3


def build_or_load_vectorstore() -> Chroma:
    embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    if CHROMA_DIR.exists() and any(CHROMA_DIR.iterdir()):
        print(f"[loading existing index from {CHROMA_DIR}]")
        return Chroma(persist_directory=str(CHROMA_DIR), embedding_function=embeddings)

    print(f"[building index from {DOCS_DIR}]")
    if not DOCS_DIR.exists():
        raise FileNotFoundError(f"Source documents folder '{DOCS_DIR}' not found. Please run task 1.2.")

    loader = DirectoryLoader(
        str(DOCS_DIR),
        glob="**/*.md",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
    )
    raw_docs = loader.load()
    print(f"  loaded {len(raw_docs)} documents")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=80)
    chunks = splitter.split_documents(raw_docs)
    print(f"  split into {len(chunks)} chunks")

    store = Chroma.from_documents(
        chunks, embeddings, persist_directory=str(CHROMA_DIR)
    )
    print("  index successfully built and persisted")
    return store


def answer(question: str, store: Chroma, client: OpenAI) -> str:
    hits = store.similarity_search(question, k=TOP_K)

    print(f"\n[retrieved {len(hits)} chunks for: {question!r}]")
    for i, h in enumerate(hits, 1):
        src = Path(h.metadata.get("source", "?")).name
        preview = h.page_content[:80].replace("\n", " ")
        print(f"  {i}. ({src}) {preview}...")

    context = "\n\n---\n\n".join(h.page_content for h in hits)
    system = (
        "Answer the user's question using ONLY the context below. "
        "If the answer is not in the context, say 'I don't know based on the provided documents.' "
        "Quote specific numbers and names verbatim when they appear.\n\n"
        f"CONTEXT:\n{context}"
    )

    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": question},
        ],
    )
    return response.choices[0].message.content


def main() -> None:
    store = build_or_load_vectorstore()
    client = OpenAI()

    questions = [
        "How many vacation days do I get per year?",
        "Can I buy a Nintendo Switch with my home office stipend?",
        "What does Marcus Liang do at the company?",
        "Who is the CEO of Cumulonimbus Robotics?",  # not in docs — should refuse
    ]
    for q in questions:
        ans = answer(q, store, client)
        print(f"\nQ: {q}\nA: {ans}\n{'=' * 60}")


if __name__ == "__main__":
    main()
