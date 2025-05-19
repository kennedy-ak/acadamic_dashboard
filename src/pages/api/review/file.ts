import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import * as fs from "fs";
import { extractText } from "@/services/cv_extractor";
import { reviewCV } from "@/services/llm_service";
import { CVReviewResponse } from "@/schema/schema";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CVReviewResponse | { error: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const form = formidable({});

    const [fields, files] = await form.parse(req);

    const file = files.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = (file as any)[0].filepath; // Access the file path from the parsed files
    const fileContent = fs.readFileSync(filePath); // Read the file content as a Buffer

    const filename = (file as any)[0].originalFilename || "document";
    const fileExtension = filename.split(".").pop()?.toLowerCase();

    if (!fileExtension || !["pdf", "docx"].includes(fileExtension)) {
      return res
        .status(400)
        .json({ error: "Invalid file type. Please upload a PDF or DOCX." });
    }

    const extractedText = await extractText(fileContent, filename);

    if (!extractedText) {
      return res
        .status(400)
        .json({ error: "Could not extract text from the uploaded file." });
    }

    const review = await reviewCV(extractedText);

    res.status(200).json({ review });
  } catch (error: any) {
    console.error("Error processing the file:", error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
}
