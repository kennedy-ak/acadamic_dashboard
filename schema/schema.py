from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class CVReviewRequest(BaseModel):
    """Request model for CV review when submitting text directly"""
    cv_text: str
    email: EmailStr
    job_role: Optional[str] = None

class CVReviewResponse(BaseModel):
    """Response model for CV review"""
    review: str
    formatted_review: str  # HTML formatted review