from fastapi import FastAPI, UploadFile, File
from services.ppt_parser import extract_slides_text
from services.slide_classifier import classify_slide
import os, shutil

from mcp.router import run_mcp
from memory.session_memory import get_session_summary

app = FastAPI(title="Slide2Learn Backend")

# ---------------- SESSION ANALYTICS ----------------

@app.get("/session/{session_id}/summary")
async def session_summary(session_id: str):
    return get_session_summary(session_id)

# ---------------- MCP ENDPOINT ----------------

@app.post("/mcp/{mode}/{slide_no}")
async def mcp_endpoint(mode: str, slide_no: int, payload: dict):
    raw_text = payload.get("raw_text")
    category = payload.get("category", "unknown")
    session_id = payload.get("session_id", "default")

    if not raw_text:
        return {"error": "raw_text required"}

    result = run_mcp(
        mode=mode,
        raw_text=raw_text,
        category=category,
        session_id=session_id
    )

    return {
        "slide_no": slide_no,
        **result
    }

# ---------------- PPT UPLOAD ----------------

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def structure_slide(text: str, category: str):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    title = lines[0] if lines else ""
    points = lines[1:] if len(lines) > 1 else []

    points = [p.lstrip("-•* ").strip() for p in points if p.strip()]

    diagram_map = {
        "process": "flowchart",
        "comparison": "split",
        "hierarchy": "tree",
        "definition": "concept",
        "list": "bullets"
    }

    return {
        "title": title,
        "points": points,
        "diagram_type": diagram_map.get(category, "unknown")
    }

@app.post("/upload-ppt")
async def upload_ppt(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    slides = extract_slides_text(file_path)

    for slide in slides:
        category = classify_slide(slide["raw_text"])
        slide["category"] = category
        slide.update(structure_slide(slide["raw_text"], category))

    return {
        "filename": file.filename,
        "slide_count": len(slides),
        "slides": slides
    }