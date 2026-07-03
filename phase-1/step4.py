"""Step 5: ReAct Agent Loop with Safe Math Tool & OpenTelemetry Tracing

Features:
    1. ReAct Loop coordinating thoughts, actions, and observations.
    2. Safe calculator tool validating arithmetic strings before evaluation.
    3. OpenTelemetry tracing mapping agent steps, LLM completions, and tool executions.

Run from root with: uv run phase-1/step5.py
"""

import json
import time
from dotenv import load_dotenv
from openai import OpenAI

# OpenTelemetry imports
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor

load_dotenv()
client = OpenAI()
MODEL = "gpt-4o-mini"

# ------------------------------------------------------------------------
# 1. OpenTelemetry Setup
# ------------------------------------------------------------------------
provider = TracerProvider()
# Exporter to dump spans as JSON directly to the console for verification
processor = SimpleSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("react-agent")

# ------------------------------------------------------------------------
# 2. Tool Definitions & Implementations
# ------------------------------------------------------------------------
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": (
                "Evaluate a mathematical expression. Use this for any "
                "arithmetic, percentages, or numeric computation. Do NOT "
                "use it for non-math questions."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": (
                            "A Python arithmetic expression, e.g. "
                            "'1800 * 0.17' or '22 - 3 - 4'. Use only "
                            "digits, parentheses, and + - * / ** %."
                        ),
                    }
                },
                "required": ["expression"],
            },
        },
    }
]


def calculate(expression: str) -> str:
    """Safely evaluate a mathematical expression."""
    allowed = set("0123456789.+-*/() %")
    if not all(c in allowed for c in expression):
        return f"error: expression contains disallowed characters: {expression!r}"
    try:
        # Evaluate math expression safely in a clean global context
        result = eval(expression, {"__builtins__": {}}, {})  # noqa: S307
        return str(result)
    except Exception as e:
        return f"error: {e}"


TOOL_IMPLS = {"calculate": calculate}


# ------------------------------------------------------------------------
# 3. Agent Execution Loop
# ------------------------------------------------------------------------
def ask(question: str) -> str:
    # 1. Parent span for the entire query lifecycle
    with tracer.start_as_current_span("agent_query") as query_span:
        query_span.set_attribute("query", question)
        
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant. You have access to a calculator tool. "
                    "Use it for any mathematical or arithmetic calculations. "
                    "Answer directly for everything else."
                ),
            },
            {"role": "user", "content": question},
        ]

        step = 0
        while True:
            step += 1
            # 2. Child span for this specific loop iteration (Reasoning Step)
            with tracer.start_as_current_span(f"agent_step_{step}") as step_span:
                step_span.set_attribute("step_number", step)
                
                # 3. Sub-span for the LLM request
                with tracer.start_as_current_span("llm_call") as llm_span:
                    response = client.chat.completions.create(
                        model=MODEL,
                        messages=messages,
                        tools=TOOLS,
                    )
                    msg = response.choices[0].message
                    llm_span.set_attribute("model", MODEL)
                    llm_span.set_attribute("has_tool_calls", bool(msg.tool_calls))
                    if msg.content:
                        llm_span.set_attribute("response_preview", msg.content[:100])

                # Case A: No tool calls -> model returns final answer
                if not msg.tool_calls:
                    print(f"  [Step {step}] final text response generated")
                    query_span.set_attribute("final_answer", msg.content or "")
                    return msg.content

                # Case B: Model requests tool execution
                messages.append(msg)
                for call in msg.tool_calls:
                    name = call.function.name
                    args_str = call.function.arguments
                    args = json.loads(args_str)
                    
                    print(f"  [Step {step}] model called tool '{name}' with arguments: {args}")
                    
                    # 4. Sub-span for tool execution
                    with tracer.start_as_current_span("tool_execution") as tool_span:
                        tool_span.set_attribute("tool.name", name)
                        tool_span.set_attribute("tool.arguments", args_str)
                        
                        if name in TOOL_IMPLS:
                            result = TOOL_IMPLS[name](**args)
                        else:
                            result = f"error: tool '{name}' not found"
                            
                        tool_span.set_attribute("tool.result", result)
                        print(f"           -> tool result: {result}")
                        
                        messages.append({
                            "role": "tool",
                            "tool_call_id": call.id,
                            "content": result,
                        })


def main() -> None:
    questions = [
        "What is 17% of $1800?",  # Requires math tool call
        "What is the capital of Japan?",  # Direct answer (no tool)
        "I have 22 vacation days. I use 3 in March and 4 in July. How many are left?",  # Requires math tool call
    ]
    for q in questions:
        print(f"\n============================================================")
        print(f"Q: {q}")
        print(f"============================================================")
        answer = ask(q)
        print(f"\nA: {answer}")
        time.sleep(1)


if __name__ == "__main__":
    main()
