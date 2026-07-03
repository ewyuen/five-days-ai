"""Day 2: system prompt + multi-turn conversation + error handling.

Run with: uv run day2.py
Type 'exit' or Ctrl+C to quit.
"""

import time
from dotenv import load_dotenv
from openai import OpenAI, APIError, APIConnectionError, RateLimitError

load_dotenv()
client = OpenAI()

SYSTEM_PROMPT = (
    "You are a terse senior engineer mentoring a junior developer learning AI engineering. "
    "Answer in 2-3 sentences. Be concrete. If the question is vague, ask one sharpening question instead."
)

MODEL = "gpt-4o-mini"
MAX_RETRIES = 3


def chat(messages: list[dict]) -> str:
    """Send the full message history; return the assistant's reply text.

    Retries on transient network / rate-limit errors with exponential backoff.
    Re-raises after MAX_RETRIES so the caller can decide what to do.
    """
    for attempt in range(MAX_RETRIES):
        try:
            response = client.chat.completions.create(model=MODEL, messages=messages)
            return response.choices[0].message.content
        except (APIConnectionError, RateLimitError) as e:
            wait = 2 ** attempt
            print(f"[transient error: {type(e).__name__}; retrying in {wait}s]")
            time.sleep(wait)
    raise RuntimeError(f"Failed after {MAX_RETRIES} retries")


def main() -> None:
    history: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]
    print(f"Chatting with {MODEL}. Type 'exit' to quit.\n")
    while True:
        try:
            user_input = input("you> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nbye.")
            return
        if not user_input:
            continue
        if user_input.lower() in {"exit", "quit"}:
            print("bye.")
            return

        history.append({"role": "user", "content": user_input})
        try:
            reply = chat(history)
        except APIError as e:
            print(f"[api error: {e}]")
            history.pop()  # don't keep the user msg if the call failed
            continue
        except RuntimeError as e:
            print(f"[giving up: {e}]")
            history.pop()
            continue

        history.append({"role": "assistant", "content": reply})
        print(f"bot> {reply}\n")


if __name__ == "__main__":
    main()
