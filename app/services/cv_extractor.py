import PyPDF2
import docx
import io
from fastapi import HTTPException

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text from PDF file content
    """
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")

def extract_text_from_docx(file_content: bytes) -> str:
    """
    Extract text from DOCX file content
    """
    try:
        doc = docx.Document(io.BytesIO(file_content))
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from DOCX: {str(e)}")
