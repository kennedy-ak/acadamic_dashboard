

"use client";
import React, { useState } from "react";

interface CVExtraction {
  first_name: string;
  last_name: string;
  research_fields: string[];
  about: string;
  experience: Experience[];
  academic_background: AcademicBackground[];
  publications: Publication[];
  awards: Award[];
}

interface Experience {
  institution: string;
  role: string;
  start_date: string;
  end_date: string;
}

interface AcademicBackground {
  institution: string;
  program: string;
  academic_degree: string;
  start_date: string;
  end_date: string;
}

interface Publication {
  project_name: string;
  link: string;
}

interface Award {
  award_name: string;
  year: string;
}

interface CVExtractionResponse {
  extraction: CVExtraction;
}

interface FileUploadProps {
  onUpload: (extraction: CVExtractionResponse) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/review/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file.");
      }

      const data: CVExtractionResponse = await response.json();
      onUpload(data);
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".pdf,.docx" />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Extracting..." : "Upload and Extract"}
      </button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
};

export default function Home() {
  const [extractionData, setExtractionData] = useState<CVExtractionResponse | null>(null);

  const handleExtractionUpload = (extraction: CVExtractionResponse) => {
    setExtractionData(extraction);
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>CV Information Extractor</h1>
      <FileUpload onUpload={handleExtractionUpload} />
      {extractionData && (
        <div>
          <h2>Extracted Information (JSON)</h2>
          <pre>{JSON.stringify(extractionData.extraction, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}