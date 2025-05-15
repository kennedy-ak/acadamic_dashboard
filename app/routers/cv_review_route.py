from fastapi import File, Form, UploadFile, HTTPException, Depends, APIRouter
from app.schema.schema import CVReview, CVReviewResponse, CVReviewRequest
from app.services.cv_extractor import extract_text_from_pdf, extract_text_from_docx
from app.services.llm_service import review_cv
from typing import Optional
import json
import logging

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)

@router.post("/file", response_model=CVReviewResponse)
async def review_cv_file(
    file: UploadFile = File(...),
):
    """
    Upload a CV file (PDF or DOCX) for review
    """
    logging.info(f"📤 Received file: {file.filename}")

    # Validate file type
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["pdf", "docx"]:
        logging.error(f"⛔ Unsupported file format: {file_extension}")
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF or DOCX file.")

    # Read file content
    file_content = await file.read()
    logging.info(f"✅ File content read successfully.")

    # Extract text based on file type
    cv_text = None  # Initialize cv_text to None
    if file_extension == "pdf":
        cv_text = extract_text_from_pdf(file_content)
        logging.info("📄 Extracted text from PDF.")
    elif file_extension == "docx":
        cv_text = extract_text_from_docx(file_content)
        logging.info("📝 Extracted text from DOCX.")

    # Check if text extraction was successful
    if not cv_text:
        logging.error("❌ Could not extract text from the uploaded file.")
        raise HTTPException(status_code=400, detail="Could not extract text from the uploaded file.")

    # Get CV review
    review: CVReview = review_cv(cv_text)
    logging.info("🎉 CV review completed.")

    return {"review": review}
