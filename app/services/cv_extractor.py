# import PyPDF2
# import docx
# import io
# from fastapi import HTTPException

# def extract_text_from_pdf(file_content: bytes) -> str:
#     """
#     Extract text from PDF file content
#     """
#     try:
#         pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
#         text = ""
#         for page in pdf_reader.pages:
#             text += page.extract_text()
#         return text
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")

# def extract_text_from_docx(file_content: bytes) -> str:
#     """
#     Extract text from DOCX file content
#     """
#     try:
#         doc = docx.Document(io.BytesIO(file_content))
#         text = ""
#         for para in doc.paragraphs:
#             text += para.text + "\n"
#         return text
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Error extracting text from DOCX: {str(e)}")

from llama_cloud_services import LlamaParse
from app.core.settings import settings
import io
import os

def extract_text(file_content: bytes, filename: str = "document") -> str:
    """
    Extract text from file content with llama parse
    """

    parser = LlamaParse(
        api_key=settings.LLAMA_CLOUD_API_KEY,  # can also be set in your env as LLAMA_CLOUD_API_KEY
        num_workers=4,       # if multiple files passed, split in `num_workers` API calls
        verbose=True,
        language="en",       # optionally define a language, default=en
    )

    result = parser.parse(file_content, extra_info={"file_name": filename})

    markdown_documents = result.get_markdown_documents(split_by_page=True)

    return markdown_documents[0].text
