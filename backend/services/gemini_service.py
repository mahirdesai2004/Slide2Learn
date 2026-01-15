import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Lazy initialization will happen inside functions
def get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or "your_gemini_api_key" in api_key:
        print("⚠️  WARNING: GEMINI_API_KEY not found or invalid in .env")
        return None
    return genai.Client(api_key=api_key)

# Choose a current Gemini model
MODEL_NAME = "gemini-2.5-flash"

def generate_memorization(slide_text: str, depth: str = "standard") -> str:
    """
    Generate memory-friendly content.
    depth: 'standard' or 'deep' (for regeneration with more detail/new questions)
    """
    client = get_client()
    
    if not client:
        return "⚠️ AI Generation Unavailable: Please configure GEMINI_API_KEY in backend/.env"

    if depth == "deep":
        prompt = f"""
Analyze the following slide and generate RICH, ELABORATE study content.
This is a 'Regenerate' request, so avoid generic summaries.

1) **Deep Dive Explanation**: A detailed, comprehensive explanation (4-6 lines) covering nuances and "why it matters".
2) **Advanced Mnemonic**: A creative memory aid.
3) **Real-World Application**: A concrete, detailed example.
4) **Challenge Quiz**: 3 NEW, challenging multiple-choice questions. 
   STRICT FORMAT (Markdown compatible):
   Question: [Question Text]
   A) [Option A]
   B) [Option B]
   C) [Option C]
   Correct Answer: [Full Text of Correct Option]

Slide Content:
{slide_text}
"""
    else:
        prompt = f"""
Convert the following slide into study-friendly content optimized for memorization.

1) **Core Concept**: A simple explanation (2–3 lines).
2) **Mnemonic**: A memory trick or acronym.
3) **Example**: One easy real-world example.
4) **Quiz**: 2 simple review questions.
   STRICT FORMAT (Markdown compatible):
   Question: [Question Text]
   A) [Option A]
   B) [Option B]
   C) [Option C]
   Correct Answer: [Full Text of Correct Option]

Slide:
{slide_text}
"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Error generating content: {e}")
        return f"Error using Gemini API: {str(e)}"

def generate_comprehensive_review(all_slides_text: str) -> str:
    """
    Generate a comprehensive quiz and review for the entire presentation.
    """
    client = get_client()
    
    if not client:
        return "⚠️ AI Generation Unavailable"

    prompt = f"""
Create a comprehensive final review for this entire presentation.
The output should be structured as:

1) **Executive Summary**: A paragraph summarizing the entire deck.
2) **Top 5 Key Takeaways**: Bullet points.
3) **Final Exam**: 5 challenging multiple-choice questions with answers.

Presentation Content:
{all_slides_text[:20000]}  # Limit char count to avoid token limits
"""
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Error generating review: {e}")
        return f"Error using Gemini API: {str(e)}"