from fastapi import FastAPI, UploadFile, File
from services.ppt_parser import extract_slides_text
from services.slide_classifier import classify_slide
import os, shutil

from mcp.router import run_mcp
from memory.session_memory import get_session_summary


app = FastAPI(title="Slide2Learn Backend")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",              # Vite (if used)
        "https://slide2learn.onrender.com",   # backend itself (safe)
        "https://<frontend-domain>.onrender.com"  # frontend deploy URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- SESSION ANALYTICS ----------------

@app.get("/session/{session_id}/summary")
async def session_summary(session_id: str):
    return get_session_summary(session_id)

# ---------------- MCP ENDPOINT ----------------

from services.gemini_service import generate_comprehensive_review

@app.post("/mcp/{mode}/all")
async def mcp_all_endpoint(mode: str, payload: dict):
    all_text = payload.get("all_text")
    session_id = payload.get("session_id", "default")
    regenerate = payload.get("regenerate", False)

    if not all_text:
        return {"error": "all_text required"}

    # Use 'general' category for full deck
    result = run_mcp(
        mode=mode,
        raw_text=all_text[:30000], # Safety limit for tokens
        category="general",
        session_id=session_id,
        regenerate=regenerate
    )

    return {
        "scope": "all",
        **result
    }

@app.post("/mcp/{mode}/{slide_no}")
async def mcp_endpoint(mode: str, slide_no: int, payload: dict):
    raw_text = payload.get("raw_text")
    category = payload.get("category", "unknown")
    session_id = payload.get("session_id", "default")
    regenerate = payload.get("regenerate", False)  # Extract regenerate flag

    if not raw_text:
        return {"error": "raw_text required"}

    result = run_mcp(
        mode=mode,
        raw_text=raw_text,
        category=category,
        session_id=session_id,
        regenerate=regenerate
    )

    return {
        "slide_no": slide_no,
        **result
    }



@app.post("/mcp/review_all")
async def review_all_endpoint(payload: dict):
    all_text = payload.get("all_text", "")
    if not all_text:
        return {"error": "No text provided"}
    
    output = generate_comprehensive_review(all_text)
    return {"output": output}

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