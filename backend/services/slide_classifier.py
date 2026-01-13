def classify_slide(text: str):
    lower = text.lower()

    if any(word in lower for word in ["step", "steps", "process", "workflow", "lifecycle", "phases"]):
        return "process"
    if "vs" in lower or "versus" in lower or "compare" in lower:
        return "comparison"
    if any(word in lower for word in ["types", "kinds", "categories"]):
        return "hierarchy"
    if lower.startswith("what is") or "definition" in lower:
        return "definition"
    if "\n" in text:
        return "list"

    return "unknown"