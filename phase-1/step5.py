"""Step 5: ReAct Agent Loop with RAG and MCP Org Chart Integration

This script implements a multi-turn ReAct reasoning loop where the agent:
1. Accesses a local vector database (Chroma) via a policy search tool.
2. Spawns and communicates with the MCP server (org_chart_server.py) over stdio.
3. Coordinates answers to cross-domain questions (e.g. employee reporting structures + policy limits).
4. Logs steps and tool executions via OpenTelemetry Console Spans.

Run from root with: uv run phase-1/step5.py
"""

import asyncio
import json
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
from openai import AsyncOpenAI
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

# OpenTelemetry imports
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor

# MCP client imports
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

load_dotenv()

# ------------------------------------------------------------------------
# 1. OpenTelemetry Setup
# ------------------------------------------------------------------------
provider = TracerProvider()
processor = SimpleSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("react-rag-mcp-agent")

# Paths and model settings
CHROMA_DIR = Path("phase-1/chroma_db")
EMBEDDING_MODEL = "text-embedding-3-small"
CHAT_MODEL = "gpt-4o-mini"


# ------------------------------------------------------------------------
# 2. Vector Store Setup
# ------------------------------------------------------------------------
def load_vectorstore() -> Chroma:
    embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    if not CHROMA_DIR.exists() or not any(CHROMA_DIR.iterdir()):
        raise FileNotFoundError(
            f"Chroma directory '{CHROMA_DIR}' not found or empty. Please run 'uv run phase-1/step3.py' first."
        )
    print(f"[Loading persistent RAG index from {CHROMA_DIR}]")
    return Chroma(persist_directory=str(CHROMA_DIR), embedding_function=embeddings)


# ------------------------------------------------------------------------
# 3. Agent execution logic
# ------------------------------------------------------------------------
async def ask(
    question: str,
    store: Chroma,
    client: AsyncOpenAI,
    mcp_session: ClientSession,
    openai_tools: list,
) -> str:
    # Parent span for the entire query lifecycle
    with tracer.start_as_current_span("agent_query") as query_span:
        query_span.set_attribute("query", question)

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant for Cumulonimbus Robotics. "
                    "You have access to tools to query company policies ('search_policies') "
                    "and organization chart details (via MCP tools). "
                    "Answer the user's question by combining policy rules and reporting structures. "
                    "Show your thought process and explain your step-by-step reasoning. "
                    "When referencing policies, quote specific numbers and manager names verbatim."
                ),
            },
            {"role": "user", "content": question},
        ]

        step = 0
        while True:
            step += 1
            # Child span for this reasoning step
            with tracer.start_as_current_span(f"agent_step_{step}") as step_span:
                step_span.set_attribute("step_number", step)

                # Sub-span for LLM call
                with tracer.start_as_current_span("llm_call") as llm_span:
                    response = await client.chat.completions.create(
                        model=CHAT_MODEL,
                        messages=messages,
                        tools=openai_tools,
                    )
                    msg = response.choices[0].message
                    llm_span.set_attribute("model", CHAT_MODEL)
                    llm_span.set_attribute("has_tool_calls", bool(msg.tool_calls))
                    if msg.content:
                        llm_span.set_attribute("response_preview", msg.content[:100])

                # Case A: No tool calls -> model returns final answer
                if not msg.tool_calls:
                    print(f"  [Step {step}] final text response generated")
                    query_span.set_attribute("final_answer", msg.content or "")
                    return msg.content

                # Case B: Model requests tool executions
                messages.append(msg)
                for call in msg.tool_calls:
                    name = call.function.name
                    args_str = call.function.arguments
                    args = json.loads(args_str)

                    print(f"  [Step {step}] model called tool '{name}' with arguments: {args}")

                    # Sub-span for tool execution
                    with tracer.start_as_current_span("tool_execution") as tool_span:
                        tool_span.set_attribute("tool.name", name)
                        tool_span.set_attribute("tool.arguments", args_str)

                        if name == "search_policies":
                            query_text = args.get("query")
                            hits = store.similarity_search(query_text, k=3)
                            result = "\n\n---\n\n".join(h.page_content for h in hits)
                        else:
                            try:
                                mcp_result = await mcp_session.call_tool(name, arguments=args)
                                texts = [c.text for c in mcp_result.content if hasattr(c, "text")]
                                result = "\n".join(texts)
                            except Exception as e:
                                result = f"error invoking MCP tool '{name}': {e}"

                        tool_span.set_attribute("tool.result", result)
                        print(f"           -> tool result: {result}")

                        messages.append({
                            "role": "tool",
                            "tool_call_id": call.id,
                            "content": result,
                        })


def build_openai_tools(mcp_tools: list) -> list:
    """Format local RAG tool and MCP server tools into OpenAI tool schemas."""
    openai_tools = [
        {
            "type": "function",
            "function": {
                "name": "search_policies",
                "description": (
                    "Search Cumulonimbus Robotics policy documents "
                    "(vacation, reimbursement, etc.) for rules and guidelines."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query (e.g. 'reimbursement limits' or 'vacation accrue rate').",
                        }
                    },
                    "required": ["query"],
                },
            },
        }
    ]

    for tool in mcp_tools:
        openai_tools.append({
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.inputSchema,
            },
        })
    return openai_tools


# ------------------------------------------------------------------------
# 4. Main run orchestrator
# ------------------------------------------------------------------------
async def main() -> None:
    # Spawner parameters for MCP server
    server_params = StdioServerParameters(
        command=sys.executable,
        args=["phase-1/mcp/org_chart_server.py"],
        env=None,
    )

    print("[Spawning MCP Server subprocess...]")
    async with stdio_client(server_params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            # MCP handshake
            await session.initialize()
            print("  MCP Server connected.")

            # List tools dynamically from MCP server
            mcp_tools_resp = await session.list_tools()
            mcp_tools = mcp_tools_resp.tools
            print(f"  Available MCP tools: {[t.name for t in mcp_tools]}")

            # Construct tools schema for OpenAI
            openai_tools = build_openai_tools(mcp_tools)


            # Load vector store and initialize client
            store = load_vectorstore()
            client = AsyncOpenAI()

            questions = [
                "John Doe has how many days of vacation per year?",
                "Who can approve John Doe to purchase a computer which costs $1500?",
            ]

            for q in questions:
                print(f"\n============================================================")
                print(f"Q: {q}")
                print(f"============================================================")
                answer = await ask(q, store, client, session, openai_tools)
                print(f"\nA: {answer}")
                time.sleep(1)


if __name__ == "__main__":
    asyncio.run(main())
