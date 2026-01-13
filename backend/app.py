from fastapi import FastAPI, UploadFile, File
from services.ppt_parser import extract_slides_text
import os, shutil

app = FastAPI(title="Slide2Learn Backend")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-ppt")
async def upload_ppt(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    slides = extract_slides_text(file_path)

    return {
        "filename": file.filename,
        "slide_count": len(slides),
        "slides": slides
    }