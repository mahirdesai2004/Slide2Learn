import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=API_KEY)

# Choose a current Gemini model
MODEL_NAME = "gemini-2.5-flash"

def generate_memorization(slide_text: str) -> str:
    """
    Generate memory-friendly learning content for one slide.
    """

    prompt = f"""
Convert the following slide into study-friendly content optimized for memorization.

1) A simple explanation (2–3 lines)
2) A mnemonic or memory trick
3) One easy example
4) Two quiz questions with answers

Slide:
{slide_text}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    return response.text