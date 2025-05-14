from fastapi import File, Form, UploadFile, HTTPException, Depends, APIRouter
from schema.schema import CVReviewResponse, CVReviewRequest
from routers.cv_extractor import extract_text_from_pdf, extract_text_from_docx
from routers.service import review_cv
from typing import Optional

router = APIRouter()

@router.post("/file", response_model=CVReviewResponse)
async def review_cv_file(
    file: UploadFile = File(...),
  
    
):
    """
    Upload a CV file (PDF or DOCX) for review
    """
    # Validate file type
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF or DOCX file.")
    
    # Read file content
    file_content = await file.read()
    
    # Extract text based on file type
    if file_extension == "pdf":
        cv_text = extract_text_from_pdf(file_content)
    elif file_extension == "docx":
        cv_text = extract_text_from_docx(file_content)
    
    # Check if text extraction was successful
    if not cv_text:
        raise HTTPException(status_code=400, detail="Could not extract text from the uploaded file.")
    
    # Get CV review
    review, formatted_review = review_cv(cv_text)
    
    return {"review": review, "formatted_review": formatted_review}
