from fastapi import FastAPI, UploadFile, File
from services.ppt_parser import extract_slides_text
from services.slide_classifier import classify_slide
import os, shutil
from services.gemini_service import generate_memorization

app = FastAPI(title="Slide2Learn Backend")

MEMORY_CACHE = {}

@app.post("/memorize-slide/{slide_no}")
async def memorize_slide(slide_no: int, payload: dict):
    raw_text = payload.get("raw_text")
    if not raw_text:
        return {"error": "raw_text required"}

    if slide_no in MEMORY_CACHE:
        return {"cached": True, "content": MEMORY_CACHE[slide_no]}

    result = generate_memorization(raw_text)
    MEMORY_CACHE[slide_no] = result
    return {"cached": False, "content": result}

def structure_slide(text: str, category: str):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    title = lines[0] if lines else ""
    points = lines[1:] if len(lines) > 1 else []

    # Basic cleanup of bullet-like prefixes
    cleaned = []
    for p in points:
        p = p.lstrip("-•* ").strip()
        if p:
            cleaned.append(p)
    points = cleaned

    # Map category to diagram type
    if category == "process":
        diagram_type = "flowchart"
    elif category == "comparison":
        diagram_type = "split"
    elif category == "hierarchy":
        diagram_type = "tree"
    elif category == "definition":
        diagram_type = "concept"
    elif category == "list":
        diagram_type = "bullets"
    else:
        diagram_type = "unknown"

    return {
        "title": title,
        "points": points,
        "diagram_type": diagram_type
    }


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-ppt")
async def upload_ppt(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    slides = extract_slides_text(file_path)
    for slide in slides:
        category = classify_slide(slide["raw_text"])
        slide["category"] = category
        structured = structure_slide(slide["raw_text"], category)
        slide.update(structured)

    return {
        "filename": file.filename,
        "slide_count": len(slides),
        "slides": slides
    }