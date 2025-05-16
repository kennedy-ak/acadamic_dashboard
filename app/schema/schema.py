from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

# class CVReviewRequest(BaseModel):
#     """Request model for CV review when submitting text directly"""
#     cv_text: str
#     email: EmailStr

class ScoredCategory(BaseModel):
    score: int = Field(description="Score for the category (out of 100)")
    reasoning: str = Field(description="Reasoning behind the score")

class CVReview(BaseModel):
    overall_structure: ScoredCategory = Field(description="Overall structure and formatting")
    content_quality: ScoredCategory = Field(description="Content quality and clarity")
    skills_presentation: ScoredCategory = Field(description="Skills presentation")
    experience_highlights: ScoredCategory = Field(description="Experience highlights")
    overall_score: ScoredCategory = Field(description="Overall CV score as a percentage")
    improvement_suggestions: List[str] = Field(description="Specific improvement suggestions")

class CVReviewResponse(BaseModel):
    """Response model for CV review"""
    review: CVReview = Field(description="CV review details")
