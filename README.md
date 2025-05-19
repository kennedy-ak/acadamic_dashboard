# Academic-Proj-CV-AI: Documentation Guide

## Project Summary

This project is a Next.js application designed to review CVs (Curriculum Vitae) by extracting text from uploaded files (PDF or DOCX), and then leveraging Large Language Models (LLMs) to provide detailed feedback and scoring. It offers insights into the CV's structure, content quality, skills presentation, and experience highlights, along with improvement suggestions.

## Setup and Installation

### Prerequisites

Before you begin, ensure you have the following installed:

-   Node.js (version 18 or later)
-   npm, yarn, pnpm, or bun (package managers)

### Dependencies to install
- @langchain/core
- @langchain/groq
- @types/formidable
- dotenv
- formidable
- langchain
- llamaindex
Eg.
```bash
npm install @langchain/core @langchain/groq @types/formidable dotenv formidable langchain llamaindex
```

### Steps

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd academic-proj-cv-ai
    ```

2.  **Install dependencies:**

    Using npm:

    ```bash
    npm install
    ```

    or using yarn:

    ```bash
    yarn install
    ```

    or using pnpm:

    ```bash
    pnpm install
    ```

    or using bun:

    ```bash
    bun install
    ```

3.  **Environment Variables:**

    Create a `.env` file in the project's root directory. Add your API keys:

    ```
    GROQ_API_KEY=<your_groq_api_key>
    LLAMA_CLOUD_API_KEY=<your_llama_cloud_api_key>
    ```

    **Note:** Ensure you obtain valid API keys from Groq and LlamaCloud and store them securely. Do not commit the `.env` file to your repository.

## Running the Application

To start the development server, use one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage Guide

1.  **Upload a CV:**

    *   On the homepage, find the file upload component.
    *   Click on the input field to select a CV file (PDF or DOCX) from your local machine.

2.  **Review the Analysis:**

    *   After uploading, the application processes the file.
    *   The text is extracted and sent to the LLM for review.
    *   The analysis result, including scores, reasoning, and improvement suggestions, will be displayed.

## Core Features Overview

The project's core logic is distributed across several key files:

**`src/app/page.tsx`**

*   This is the main component for the homepage.
*   It includes a `FileUpload` component that handles file uploads and calls the review API.
*   It manages the state for the review data and displays the results.

**`src/pages/api/review/file.ts`**

*   This is the API endpoint that handles the file upload and CV review process.
*   It uses `formidable` to parse the uploaded file.
*   It calls `extractText` from `cv_extractor.ts` to extract text from the file.
*   It calls `reviewCV` from `llm_service.ts` to review the extracted text using an LLM.
*   It returns the review results as a JSON response.

**`src/services/cv_extractor.ts`**

*   This module is responsible for extracting text content from the uploaded CV file.
*   It uses the `LlamaParseReader` from the `llamaindex` library.
*   It takes the file content (as a Buffer) and the filename as input.
*   It returns the extracted text as a string.

**`src/services/llm_service.ts`**

*   This module interfaces with the LLM to review the extracted CV text.
*   It uses `ChatGroq` from the `@langchain/groq` library to communicate with the Groq API.
*   It constructs a detailed prompt that instructs the LLM to analyze the CV based on several criteria such as overall structure, content quality, skills presentation, and experience highlights.
*   The prompt asks the LLM to provide scores and reasoning for each category, along with specific improvement suggestions.
*   It parses the LLM's response using `JsonOutputParser` to ensure it conforms to a predefined JSON schema (`CVReview`).
*   It returns the review results as a `CVReview` object.

**`src/core/settings.ts`**

*   This module manages the application's settings and configuration.
*   It loads environment variables from the `.env` file using the `dotenv` package.
*   It defines the `settings` object, which contains configuration parameters such as API keys, the LLM model to use, temperature, and maximum tokens.

**`src/core/types.ts`**

*   This module defines the TypeScript types and interfaces used throughout the application.
*   It defines the `CVReview` interface, which represents the structure of the CV review data, including scores, reasoning, and improvement suggestions.
*   It defines the `ScoredCategory` interface, which represents a scored category with a score and reasoning.

**`src/schema/schema.ts`**

*   This module defines the schema for the CV review response.
*   It imports the `CVReview` type from `src/core/types.ts`.
*   It defines the `CVReviewResponse` interface, which represents the structure of the API response.
