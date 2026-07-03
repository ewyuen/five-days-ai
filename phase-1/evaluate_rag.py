"""RAG Retrieval Evaluation Script

Evaluates retrieval precision and correctness of the Chroma vector store.
Tests queries targeting vacation policy, equipment reimbursement, and oncall schedules.

Run from repository root: uv run phase-1/evaluate_rag.py
"""

from pathlib import Path
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

load_dotenv()

CHROMA_DIR = Path("phase-1/chroma_db")
EMBEDDING_MODEL = "text-embedding-3-small"
TOP_K = 3

# Define evaluation test cases: (Question, Expected Document Filename)
TEST_CASES = [
    ("How many vacation days do I accrue each month?", "vacation_policy.md"),
    ("What is the maximum yearly reimbursement for equipment?", "equipment_reimbursement.md"),
    ("Who should I contact if secondary support does not respond?", "oncall_schedule.md"),
    ("How do I request a new laptop?", "equipment_reimbursement.md"),
    ("Can I carry over unused vacation days to the next year?", "vacation_policy.md"),
    ("What is the rotation cycle for primary support on-call duty?", "oncall_schedule.md"),
]

def run_evaluation():
    if not CHROMA_DIR.exists():
        print(f"Error: Chroma directory '{CHROMA_DIR}' not found. Please run ingestion first via:")
        print("  uv run phase-1/step3.py")
        return

    print("Initializing vector store for evaluation...")
    embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    db = Chroma(persist_directory=str(CHROMA_DIR), embedding_function=embeddings)

    print(f"\nEvaluating RAG Retrieval (Top K = {TOP_K})...")
    print("-" * 80)
    print(f"{'Question':<50} | {'Expected Source':<25} | {'Status':<6}")
    print("-" * 80)

    success_count = 0
    total_cases = len(TEST_CASES)

    for question, expected_doc in TEST_CASES:
        # Perform similarity search
        results = db.similarity_search(question, k=TOP_K)
        
        # Check if expected document is in retrieved chunks' sources
        retrieved_sources = []
        for doc in results:
            source_path = doc.metadata.get("source", "")
            # Extract just the filename
            filename = Path(source_path).name
            retrieved_sources.append(filename)

        is_success = expected_doc in retrieved_sources
        status_text = "PASS" if is_success else "FAIL"

        if is_success:
            success_count += 1

        print(f"{question[:50]:<50} | {expected_doc:<25} | {status_text:<6}")
        if not is_success:
            print(f"  ↳ Retrieved: {retrieved_sources}")

    print("-" * 80)
    precision = (success_count / total_cases) * 100
    print(f"Evaluation Complete: {success_count}/{total_cases} Passed ({precision:.1f}% Retrieval Precision)")
    print("-" * 80)

if __name__ == "__main__":
    run_evaluation()
