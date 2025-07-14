import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const pdf = require('pdf-parse');

export async function extractText(
  fileContent: Buffer,
  filename: string = "document",
): Promise<string> {
  try {
    const fileExtension = filename.split(".").pop()?.toLowerCase();
    
    if (fileExtension === "pdf") {
      // Extract text from PDF
      const data = await pdf(fileContent);
      return data.text || "";
    } else if (fileExtension === "docx") {
      // For DOCX files, we'll need a different approach
      // For now, return empty string and log the issue
      console.log("DOCX extraction not implemented yet");
      return "";
    } else {
      console.log("Unsupported file type:", fileExtension);
      return "";
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    return "";
  }
}
