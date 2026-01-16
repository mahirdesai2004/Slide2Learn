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
        "Convert the slide into content optimized for memorization.\n"
        "**highlight** only the single most critical term per point using bold text (e.g. **keyword**). Keep it minimal.\n\n"
        f"Slide Title:\n{ctx.get('title', '')}\n\n"
        f"Slide Content:\n{ctx.get('raw_text', '')}\n\n"
        "Required Output Structure:\n"
        "1. Simple explanation\n"
        "2. One mnemonic\n"
        "3. One real-world example\n"
    )

def quiz_prompt(ctx: dict) -> str:
    return (
        f"{BASE_RULES}\n\n"
        "Task:\n"
        "Generate 5 exam-oriented questions (MCQ & Short Answer).\n\n"
        f"Slide Content:\n{ctx.get('raw_text', '')}\n\n"
        "STRICT FORMATTING RULES:\n"
        "- Use **Bold** for Question numbering (e.g. **1. Question...**)\n"
        "- Use Lists for Options (e.g. - A) ...)\n"
        "- Put ALL Answers at the very bottom under a 'ANSWERS:' header\n"
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
        "Identify the core concepts for a mind map.\n\n"
        "Rules:\n"
        "- List exactly 10 key concepts\n"
        "- Use short, concise phrases (max 4 words)\n"
        "- No special characters or markdown\n"
        "- No emojis\n"
        "- Format as a simple list (one per line)\n\n"
        f"Slide Content:\n{ctx.get('raw_text', '')}\n"
    )

def game_prompt(ctx: dict) -> str:
    return f"""
{BASE_RULES}

You are a Dungeon Master for a text-based RPG.

Task:
Create a "Choose Your Own Adventure" scenario based on this slide.

Structure:
1. **The Scenario**: Set a high-stakes scene (Sci-Fi, Fantasy, or Corporate Espionage) where the user acts as a character applying the Slide's concept.
2. **The Crisis**: Something goes wrong that requires the specific knowledge from the slide to fix.
3. **The Choice**: Present 3 distinct Actions (A, B, C) the user can take. Only ONE is the "Optimal Application" of the concept. The others are flawed or risky.

**Outcomes (Hidden)**:
Put the results of each choice in the `ANSWERS:` section.
- For the Good Choice: Describe the victory and *why* it worked.
- For Bad Choices: Describe the humorous or catastrophic failure and *what concept was missed*.

Slide Title:
{ctx.get('title', '')}

Slide Content:
{ctx.get('raw_text', '')}

STRICT FORMAT:
[Scenario Description]
...
**What do you do?**
- **Option A**: [Action]
- **Option B**: [Action]
- **Option C**: [Action]

ANSWERS:
**Outcome A:** [Result]
**Outcome B:** [Result]
**Outcome C:** [Result]
"""

# Added 'game' to the map
PROMPT_MAP = {
    "memorize": memorize_prompt,
    "quiz": quiz_prompt,
    "revise": revise_prompt,
    "visualize": visualize_prompt,
    "game": game_prompt
}