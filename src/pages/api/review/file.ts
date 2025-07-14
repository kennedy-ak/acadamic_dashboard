// // import type { NextApiRequest, NextApiResponse } from "next";
// // import formidable from "formidable";
// // import * as fs from "fs";
// // import { extractText } from "@/services/cv_extractor";
// // import { reviewCV } from "@/services/llm_service";
// // import { CVReviewResponse } from "@/schema/schema";

// // export const config = {
// //   api: {
// //     bodyParser: false,
// //   },
// // };

// // export default async function handler(
// //   req: NextApiRequest,
// //   res: NextApiResponse<CVReviewResponse | { error: string }>,
// // ) {
// //   if (req.method !== "POST") {
// //     return res.status(405).json({ error: "Method Not Allowed" });
// //   }

// //   try {
// //     const form = formidable({});

// //     const [fields, files] = await form.parse(req);

// //     const file = files.file;

// //     if (!file) {
// //       return res.status(400).json({ error: "No file uploaded" });
// //     }

// //     const filePath = (file as any)[0].filepath; // Access the file path from the parsed files
// //     const fileContent = fs.readFileSync(filePath); // Read the file content as a Buffer

// //     const filename = (file as any)[0].originalFilename || "document";
// //     const fileExtension = filename.split(".").pop()?.toLowerCase();

// //     if (!fileExtension || !["pdf", "docx"].includes(fileExtension)) {
// //       return res
// //         .status(400)
// //         .json({ error: "Invalid file type. Please upload a PDF or DOCX." });
// //     }

// //     const extractedText = await extractText(fileContent, filename);

// //     if (!extractedText) {
// //       return res
// //         .status(400)
// //         .json({ error: "Could not extract text from the uploaded file." });
// //     }

// //     const review = await reviewCV(extractedText);

// //     res.status(200).json({ review });
// //   } catch (error: any) {
// //     console.error("Error processing the file:", error);
// //     res.status(500).json({ error: `Internal Server Error: ${error.message}` });
// //   }
// // }
// import type { NextApiRequest, NextApiResponse } from "next";
// import formidable from "formidable";
// import * as fs from "fs";
// import { extractText } from "@/services/cv_extractor";
// import { reviewCV } from "@/services/llm_service";
// import { CVReviewResponse } from "@/schema/schema";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<CVReviewResponse | { error: string }>,
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method Not Allowed" });
//   }

//   // ADD THIS DEBUG SECTION
//   console.log("=== API Route Environment Debug ===");
//   console.log("NODE_ENV:", process.env.NODE_ENV);
//   console.log("GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
//   console.log("GROQ_API_KEY length:", process.env.GROQ_API_KEY?.length);
//   console.log("GROQ_API_KEY preview:", process.env.GROQ_API_KEY?.substring(0, 15) + "...");
//   console.log("All env keys containing GROQ:", Object.keys(process.env).filter(key => key.includes('GROQ')));
//   console.log("===================================");
//   console.log("FULL API KEY:", process.env.GROQ_API_KEY);
//   try {
//     const form = formidable({});
//     const [fields, files] = await form.parse(req);
//     const file = files.file;

//     if (!file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const filePath = (file as any)[0].filepath;
//     const fileContent = fs.readFileSync(filePath);
//     const filename = (file as any)[0].originalFilename || "document";
//     const fileExtension = filename.split(".").pop()?.toLowerCase();

//     if (!fileExtension || !["pdf", "docx"].includes(fileExtension)) {
//       return res
//         .status(400)
//         .json({ error: "Invalid file type. Please upload a PDF or DOCX." });
//     }

//     console.log("About to extract text...");
//     const extractedText = await extractText(fileContent, filename);

//     if (!extractedText) {
//       return res
//         .status(400)
//         .json({ error: "Could not extract text from the uploaded file." });
//     }

//     console.log("About to review CV with API key:", process.env.GROQ_API_KEY?.substring(0, 15) + "...");
//     const review = await reviewCV(extractedText);

//     res.status(200).json({ review });
//   } catch (error: any) {
//     console.error("Error processing the file:", error);
//     res.status(500).json({ error: `Internal Server Error: ${error.message}` });
//   }
// }



import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import * as fs from "fs";
import { extractText } from "@/services/cv_extractor";
import { extractCVInfo, CVExtraction } from "@/services/llm_service";
import { validateSettings } from "@/core/settings";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface CVExtractionResponse {
  extraction: CVExtraction;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CVExtractionResponse | { error: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("=== CV Extraction API Debug ===");
  console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
  console.log("===============================");

  try {
    // Validate environment variables
    validateSettings();
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = files.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = (file as any)[0].filepath;
    const fileContent = fs.readFileSync(filePath);
    const filename = (file as any)[0].originalFilename || "document";
    const fileExtension = filename.split(".").pop()?.toLowerCase();

    if (!fileExtension || !["pdf", "docx"].includes(fileExtension)) {
      return res
        .status(400)
        .json({ error: "Invalid file type. Please upload a PDF or DOCX." });
    }

    console.log("Extracting text from:", filename);
    const extractedText = await extractText(fileContent, filename);

    if (!extractedText) {
      return res
        .status(400)
        .json({ error: "Could not extract text from the uploaded file." });
    }

    console.log("Extracting CV information...");
    const extraction = await extractCVInfo(extractedText);

    console.log("Extraction successful");
    res.status(200).json({ extraction });
  } catch (error: any) {
    console.error("Error processing CV extraction:", error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
}