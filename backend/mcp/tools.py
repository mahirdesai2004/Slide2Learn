# mcp/tools.py

# Changed from a tuple (with commas) to a single concatenated string
BASE_RULES = (
    "You are an intelligent learning assistant.\n"
    "Rules:\n"
    "- Be clear and structured\n"
    "- Student-friendly language\n"
    "- Do NOT use markdown symbols like ** or ###\n"
    "- No emojis\n"
    "- Avoid unnecessary filler\n"
)

def memorize_prompt(ctx: dict) -> str:
    return (
        f"{BASE_RULES}\n\n"
        "Task:\n"
        "Convert the slide into content optimized for memorization.\n\n"
        f"Slide Title:\n{ctx.get('title', '')}\n\n"
        f"Slide Content:\n{ctx.get('raw_text', '')}\n\n"
        "Required Output Structure:\n"
        "1. Simple explanation\n"
        "2. One mnemonic\n"
        "3. One real-world example\n"
        "4. Two quiz questions with answers\n"
    )

def quiz_prompt(ctx: dict) -> str:
    return (
        f"{BASE_RULES}\n\n"
        "Task:\n"
        "Generate exam-oriented questions.\n\n"
        f"Slide Content:\n{ctx.get('raw_text', '')}\n\n"
        "Rules:\n"
        "- 5 questions\n"
        "- Mix MCQ + short answers\n"
        "- Medium difficulty\n"
        "- Answers at end\n"
    )

def revise_prompt(ctx: dict) -> str:
    return (
        f"{BASE_RULES}\n\n"
        "Task:\n"
        "Create a revision cheat-sheet.\n\n"
        "Rules:\n"
        "- Bullet points only\n"
        "- Keywords only\n\n"
        f"Slide Content:\n{ctx.get('raw_text', '')}\n"
    )

def visualize_prompt(ctx: dict) -> str:
    return (
        f"{BASE_RULES}\n\n"
        "Task:\n"
        "Describe a diagram structure.\n\n"
        "Return VALID JSON ONLY:\n"
        "{\n"
        '  "diagram_type": "flowchart | bullets | split | tree | concept",\n'
        '  "nodes": [],\n'
        '  "edges": []\n'
        "}\n\n"
        f"Slide Content:\n{ctx.get('raw_text', '')}\n"
    )

def game_prompt(ctx: dict) -> str:
    return f"""
{BASE_RULES}

You are a learning game designer.

Task:
Turn the slide into a memory-based learning game.

Rules:
- No markdown
- No emojis
- Keep language simple
- Make it interactive

Game Structure:
1. Quick challenge description
2. 3 fill-in-the-blank questions
3. 2 true/false questions
4. 1 rapid-fire question (answer in one word)

IMPORTANT:
At the end, output answers EXACTLY in this format:

ANSWERS:
FILL:
1=
2=
3=
TF:
1=
2=
RAPID=

Slide Title:
{ctx.get('title', '')}

Slide Content:
{ctx.get('raw_text', '')}
"""

# Added 'game' to the map
PROMPT_MAP = {
    "memorize": memorize_prompt,
    "quiz": quiz_prompt,
    "revise": revise_prompt,
    "visualize": visualize_prompt,
    "game": game_prompt
}