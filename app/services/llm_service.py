from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
import os
import re
from app.core.settings import settings
from fastapi import HTTPException
from app.schema.schema import CVReview
from langchain_core.output_parsers import JsonOutputParser


llm = ChatGroq(model=settings.groq_model,
    api_key=settings.GROQ_API_KEY,
    temperature=settings.temperature,
    max_tokens=settings.max_tokens,
)

def review_cv(cv_text: str) -> CVReview:
    """
    Review CV content using Groq AI and return both raw and formatted review
    """
    try:
        # Create system and user message based on inputs
        system_message = (
            "You are a professional CV reviewer and career coach. "
            "Provide a detailed analysis of the CV with percentage scores. Focus on: "
            "1. Overall structure and formatting (score this out of 100%), "
            "2. Content quality and clarity (score this out of 100%), "
            "3. Skills presentation (score this out of 100%), "
            "4. Experience highlights (score this out of 100%), "
            "5. Specific improvement suggestions, "

            "Also provide an overall CV score as a percentage based on the average of all sections. "

            "Your response should be in JSON format and should conform to the following Pydantic schema:\n"
            f"{CVReview.schema_json()}"
        )

        parser = JsonOutputParser(pydantic_object=CVReview)

        prompt = PromptTemplate(
            input_variables= ["cv_text", "system_message"],
            template="{system_message}\n\nUploaded CV content: {cv_text}\nAssistant:",
        )

        chain = prompt | llm | parser

        result = chain.invoke({"cv_text": cv_text, "system_message": system_message})

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during CV review: {str(e)}")
