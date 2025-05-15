# CV Reviewer Application

## Overview

This application is a CV (Curriculum Vitae) reviewer that leverages the Groq LLM (Language Model) to provide detailed feedback and suggestions for improvement. It allows users to upload their CVs in either PDF or DOCX format, extracts the text, and then uses the LLM to analyze the content. The application returns a structured review, including scores for different aspects of the CV and specific improvement suggestions.

## Features

-   **File Upload:** Supports uploading CVs in PDF and DOCX formats.
-   **Text Extraction:** Extracts text from uploaded PDF and DOCX files.
-   **AI-Powered Review:** Utilizes Groq LLM to provide detailed CV reviews, including scores and suggestions.
-   **Structured Output:** Returns a structured review in JSON format, making it easy to parse and use.
-   **API Endpoint:** Provides a REST API endpoint for uploading and reviewing CVs.
-   **Logging:** Includes comprehensive logging for debugging and monitoring.

## Prerequisites

-   Python 3.10 or higher.
-   An active Groq API key.
-   Install Dependencies from the `requirements.txt` file.

## Installation

1.  **Clone the repository:**
  ```bash
  git clone https://github.com/kennedy-ak/acadamic_dashboard.git
  cd acadamic_dashboard
  ```

2.  **Set up your environment variables:**
  Create a `.env` file in the root directory of the project and add your Groq API key:

  ```
  GROQ_API_KEY=YOUR_GROQ_API_KEY
  ```

## Running the Application

1.  **Navigate to the project directory** in your terminal.

2.  **Run the application using Uvicorn:**
  ```bash
  uvicorn app.main:app --reload
  ```
  This command starts the FastAPI application using Uvicorn, and the `--reload` flag enables automatic reloading on code changes during development. The application will be accessible at `http://127.0.0.1:8000` (or the port specified in your environment).

## API Endpoints

-   `POST /review/file`: Uploads a CV file (PDF or DOCX) for review.

-   **Request Body:**
  -   `file`:  (UploadFile) The CV file to be reviewed (PDF or DOCX).

-   **Example Response:**
  ```json
  {
    "review": {
      "overall_structure": {
        "score": 85,
        "reasoning": "The CV has a clear structure..."
      },
      "content_quality": {
        "score": 90,
        "reasoning": "The content is well-written and easy to understand..."
      },
      "skills_presentation": {
        "score": 80,
        "reasoning": "Skills are clearly listed..."
      },
      "experience_highlights": {
        "score": 95,
        "reasoning": "The experience section effectively highlights achievements..."
      },
      "overall_score": {
        "score": 87,
        "reasoning": "Overall, the CV is strong..."
      },
      "improvement_suggestions": [
        "Consider adding a summary statement...",
        "Quantify achievements whenever possible..."
      ]
    }
  }
  ```

-   `GET /`:  Redirects to the `/docs` endpoint (Swagger UI).

## Usage

1.  **Upload a CV File:** Use a tool like `curl`, Postman, or any other HTTP client to send a `POST` request to the `/review/file` endpoint.  Make sure to include the CV file in the request as a `multipart/form-data` attachment.

  Example using `curl`:

  ```bash
  curl -X POST "http://127.0.0.1:8000/review/file" \
        -H "accept: application/json" \
        -H "Content-Type: multipart/form-data" \
        -F "file=@/path/to/your/cv.pdf"
  ```

2.  **Receive the Review:** The API will return a JSON response containing the CV review details.

## Configuration

-   **`.env` file:**  The `.env` file stores the `GROQ_API_KEY`.  Make sure to replace `YOUR_GROQ_API_KEY` with your actual key.
-   `settings.py`: The `settings.py` file defines the configuration settings, including the Groq model and other parameters like `temperature` and `max_tokens`. You can modify these settings to customize the behavior of the LLM.

## Dependencies

-   FastAPI
-   Uvicorn
-   Pydantic
-   python-multipart
-   PyPDF2
-   python-docx
-   langchain-groq

## Future Improvements

-   **Implement OCR for Image-Based PDFs:** Incorporate Optical Character Recognition (OCR) to extract text from scanned or image-based PDF CVs. This will improve the accuracy of text extraction for CVs that are not directly selectable.
-   **Add more detailed error handling:** Improve error messages and handle various edge cases.
-   **Integrate with a database:** Store CV reviews and user data.
-   **Add a web interface (UI):** Create a user-friendly interface for uploading CVs and viewing reviews.
-   **Support for more file formats:** Add support for more file formats (e.g., .txt, .rtf etc.).
-   **Enhance LLM prompt:** Refine the LLM prompt to improve the quality and accuracy of the reviews.
