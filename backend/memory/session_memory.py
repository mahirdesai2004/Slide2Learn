# memory/session_memory.py

from collections import defaultdict

# session_id -> stats
SESSION_MEMORY = defaultdict(lambda: {
    "attempts": 0,
    "correct": 0,
    "wrong": 0,
    "weak_topics": set()
})

def record_attempt(
    session_id: str,
    slide_title: str,
    correct: int,
    total: int
):
    data = SESSION_MEMORY[session_id]
    data["attempts"] += total
    data["correct"] += correct
    data["wrong"] += (total - correct)

    if correct < total:
        data["weak_topics"].add(slide_title)

def get_session_summary(session_id: str):
    data = SESSION_MEMORY.get(session_id)

    if not data:
        return {"message": "No data for this session"}

    accuracy = (
        (data["correct"] / data["attempts"]) * 100
        if data["attempts"] > 0 else 0
    )

    return {
        "attempts": data["attempts"],
        "correct": data["correct"],
        "wrong": data["wrong"],
        "accuracy_percent": round(accuracy, 2),
        "weak_topics": list(data["weak_topics"])
    }