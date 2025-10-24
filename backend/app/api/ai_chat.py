from __future__ import annotations
from typing import Optional, Dict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..gemini.gemini_client import _call_gemini_api

router = APIRouter()


class ChatRequest(BaseModel):
    text: str


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    """Simple AI Doctor chat endpoint. Uses Gemini if configured, otherwise returns a supportive fallback.
    """
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    prompt = (
        "You are a supportive, concise virtual clinician. Respond empathetically and clearly to the user's message.\n"
        "Offer 2–3 practical next steps and safety red flags when appropriate.\n"
        f"User: {text}\n"
        "Assistant:"
    )

    ai = _call_gemini_api(prompt)
    if not ai:
        # Fallback mock reply
        ai = (
            "I hear you—thanks for sharing. Based on your message, consider rest, hydration, and noting your key symptoms. "
            "If symptoms persist beyond 48–72 hours, or you notice warning signs (severe pain, trouble breathing, confusion), seek in-person care."
        )
    return ChatResponse(reply=ai)
