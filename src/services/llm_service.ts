

import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { settings } from "../core/settings";
import { JsonOutputParser } from "@langchain/core/output_parsers";

// Define the enhanced CV extraction interface
export interface CVExtraction {
  first_name: string;
  last_name: string;
  research_fields: string[];
  about: string;
  experience: Experience[];
  academic_background: AcademicBackground[];
  publications: Publication[];
  awards: Award[];
}

export interface Experience {
  institution: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface AcademicBackground {
  institution: string;
  program: string;
  academic_degree: string;
  start_date: string;
  end_date: string;
}

export interface Publication {
  project_name: string;
  link: string;
}

export interface Award {
  award_name: string;
  year: string;
}

const llm = new ChatGroq({
  model: settings.groq_model,
  apiKey: settings.GROQ_API_KEY,
  temperature: 0.1, // Lower temperature for more precise extraction
  maxTokens: settings.max_tokens,
});

// Enhanced CV Information Extraction Function
export async function extractCVInfo(cvText: string): Promise<CVExtraction> {
  try {
    const systemMessage = `
        You are a professional CV information extractor. 
        Extract the following information from the CV text and return it in JSON format:

        1. First name and last name of the person
        2. Research fields/areas of expertise/skills (as an array of strings)
        3. About section/summary/objective/personal statement (brief description of the person)
        4. Work experience with institution/company name, role/position, start date, and end date
        5. Academic background with institution name, program/field of study, academic degree, start date, and end date
        6. Publications with project/paper name and link (if available)
        7. Awards with award name and year received

        IMPORTANT INSTRUCTIONS:
        - For dates, use format: "MM/YYYY" or "Month YYYY". If only year is provided, use "YYYY".
        - If end date is current/present/ongoing, use "Present".
        - If information is not available or cannot be determined, use empty string for strings or empty array for arrays.
        - Extract ALL entries found in each section (experience, education, publications, awards).
        - Research fields can include technical skills, areas of study, specializations, or expertise areas.
        - For academic background, include all educational qualifications (Bachelor's, Master's, PhD, certificates, etc.).
        - For publications, extract paper titles, book titles, project names, research publications, etc.
        - For awards, include scholarships, honors, recognitions, certifications, etc.
        - If no link is provided for publications, use empty string for the link field.

        Your response must be valid JSON conforming exactly to this schema:
        ${JSON.stringify({
          first_name: "",
          last_name: "",
          research_fields: [""],
          about: "",
          experience: [
            {
              institution: "",
              role: "",
              start_date: "",
              end_date: "",
              description: ""
            }
          ],
          academic_background: [
            {
              institution: "",
              program: "",
              academic_degree: "",
              start_date: "",
              end_date: ""
            }
          ],
          publications: [
            {
              project_name: "",
              link: ""
            }
          ],
          awards: [
            {
              award_name: "",
              year: ""
            }
          ]
        } as CVExtraction)}
    `;

    const parser = new JsonOutputParser<CVExtraction>();

    const prompt = new PromptTemplate({
      inputVariables: ["cv_text", "system_message"],
      template:
        "{system_message}\n\nCV Content to extract from:\n{cv_text}\n\nExtracted Information:",
    });

    const chain = prompt.pipe(llm).pipe(parser);

    const result = await chain.invoke({
      cv_text: cvText,
      system_message: systemMessage,
    });

    return result;
  } catch (error: any) {
    console.error("Error during CV information extraction:", error);
    throw new Error(`Error during CV extraction: ${error.message}`);
  }
}
