from mcp.context_builder import build_context
from mcp.tools import PROMPT_MAP
from services.gemini_service import generate_memorization
from memory.session_memory import record_attempt

def auto_detect_mode(ctx: dict) -> str:
    text = ctx.get("raw_text", "").lower()
    lines = ctx.get("lines", [])

    if len(lines) <= 3:
        return "memorize"
    if "step" in text or "process" in text:
        return "visualize"
    if len(lines) >= 6:
        return "revise"
    if "define" in text or "what is" in text:
        return "quiz"
    return "game"

def run_mcp(mode: str, raw_text: str, category: str | None, session_id: str):
    ctx = build_context(raw_text, category)

    if mode == "auto":
        mode = auto_detect_mode(ctx)

    if mode not in PROMPT_MAP:
        raise ValueError(f"Unsupported MCP mode: {mode}")

    prompt = PROMPT_MAP[mode](ctx)
    output = generate_memorization(prompt)

    if mode in ["game", "quiz"]:
        record_attempt(
            session_id=session_id,
            slide_title=ctx["title"],
            correct=3,
            total=5
        )

    return {
        "mode": mode,
        "output": output
    }