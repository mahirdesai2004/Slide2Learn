# mcp/context_builder.py

def build_context(raw_text: str, category: str | None = None):
    """
    Normalizes slide data for MCP usage
    """
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]

    return {
        "raw_text": raw_text,
        "lines": lines,
        "title": lines[0] if lines else "",
        "points": lines[1:] if len(lines) > 1 else [],
        "category": category or "unknown"
    }