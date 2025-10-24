from __future__ import annotations
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure app package is importable when running from backend/
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from app.api.ai_chat import ChatResponse  # type: ignore
from app.gemini.gemini_client import _call_gemini_api  # type: ignore

load_dotenv()

PROMPT_TEMPLATE = (
    "You are a supportive, concise virtual clinician. Respond empathetically and clearly to the user's message.\n"
    "Offer 2–3 practical next steps and safety red flags when appropriate.\n"
    "User: {text}\n"
    "Assistant:"
)

def run_cli() -> int:
    print("Gemini CLI (type 'exit' to quit)\n", flush=True)
    while True:
        try:
            user = input('You > ').strip()
        except (EOFError, KeyboardInterrupt):
            print()  # newline
            return 0
        if not user:
            continue
        if user.lower() in {"exit", "quit"}:
            return 0
        prompt = PROMPT_TEMPLATE.format(text=user)
        reply = _call_gemini_api(prompt)
        if not reply:
            reply = (
                "I hear you—thanks for sharing. Consider rest, hydration, and noting your key symptoms. "
                "If symptoms persist beyond 48–72 hours, or you notice warning signs (severe pain, trouble breathing, confusion), seek in-person care."
            )
        print(f"AI  > {reply}\n", flush=True)

if __name__ == '__main__':
    raise SystemExit(run_cli())
