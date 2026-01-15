import re

def parse_game_answers(text: str) -> dict:
    """
    Extract answers from LLM output
    """
    answers = {
        "fill": [],
        "tf": [],
        "rapid": None
    }

    if "ANSWERS:" not in text:
        return answers

    section = text.split("ANSWERS:")[-1]

    # Fill in the blanks
    fill_matches = re.findall(r"FILL:\s*1=(.*)\s*2=(.*)\s*3=(.*)", section)
    if fill_matches:
        answers["fill"] = [a.strip() for a in fill_matches[0]]

    # True / False
    tf_matches = re.findall(r"TF:\s*1=(.*)\s*2=(.*)", section)
    if tf_matches:
        answers["tf"] = [a.strip() for a in tf_matches[0]]

    # Rapid
    rapid_match = re.search(r"RAPID=(.*)", section)
    if rapid_match:
        answers["rapid"] = rapid_match.group(1).strip()

    return answers

def score_game(correct: dict, user: dict) -> tuple[int, int]:
    score = 0
    total = 6  # 3 fill + 2 tf + 1 rapid

    for i in range(3):
        if user["fill"][i].lower() == correct["fill"][i].lower():
            score += 1

    for i in range(2):
        if user["tf"][i].lower() == correct["tf"][i].lower():
            score += 1

    if user["rapid"].lower() == correct["rapid"].lower():
        score += 1

    return score, total