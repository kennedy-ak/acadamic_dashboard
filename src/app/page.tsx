"use client";
import React, { useState } from "react";
import { CVReviewResponse } from "@/schema/schema";

interface FileUploadProps {
  onUpload: (review: CVReviewResponse) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null); // Clear any previous error when a new file is selected
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

      const data: CVReviewResponse = await response.json();
      onUpload(data); // Pass the review data to the parent component
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload and Review"}
      </button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
};

export default function Home() {
  const [reviewData, setReviewData] = useState<CVReviewResponse | null>(null);

  const handleReviewUpload = (review: CVReviewResponse) => {
    setReviewData(review);
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>CV Reviewer</h1>
      <FileUpload onUpload={handleReviewUpload} />
      {reviewData && (
        <div>
          <h2>CV Review Result</h2>
          <pre>{JSON.stringify(reviewData.review, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
