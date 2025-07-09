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
  title: string;
  authors: string[];
  venue: string;
  abstract: string;
  doi: string;
  link: string;
  type: string;
  year: string;
}

export interface Award {
  award_name: string;
  year: string;
}

const llm = new ChatGroq({
  model: settings.groq_model,
  apiKey: settings.GROQ_API_KEY,
  temperature: 0.1,
  maxTokens: settings.max_tokens,
});

// Enhanced JSON cleaning function
function cleanJsonString(jsonString: string): string {
  // Remove markdown code blocks
  jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Find JSON boundaries
  const jsonStart = jsonString.indexOf('{');
  const jsonEnd = jsonString.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1) {
    jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
  }
  
  return jsonString.trim();
}

// Function to attempt JSON repair
function repairJson(jsonString: string): string {
  try {
    // First attempt: try to parse as-is
    JSON.parse(jsonString);
    return jsonString;
  } catch (error) {
    console.log("Initial JSON parse failed, attempting repairs...");
    
    // Common repairs
    let repaired = jsonString;
    
    // Fix common escaping issues
    repaired = repaired.replace(/([^\\])"/g, '$1\\"'); // Escape unescaped quotes
    repaired = repaired.replace(/^"/, '\\"'); // Fix quotes at start
    repaired = repaired.replace(/\n/g, '\\n'); // Escape newlines
    repaired = repaired.replace(/\r/g, '\\r'); // Escape carriage returns
    repaired = repaired.replace(/\t/g, '\\t'); // Escape tabs
    
    // Fix trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix missing commas between array elements
    repaired = repaired.replace(/}(\s*){/g, '},$1{');
    repaired = repaired.replace(/](\s*)\[/g, '],$1[');
    
    try {
      JSON.parse(repaired);
      return repaired;
    } catch (secondError) {
      console.log("JSON repair failed, will try fallback approach");
      throw secondError;
    }
  }
}



// Enhanced CV Information Extraction Function
export async function extractCVInfo(cvText: string): Promise<CVExtraction> {
  try {
    const systemMessage = `
You are a professional CV information extractor. Extract information and return ONLY valid JSON.

CRITICAL JSON RULES:
1. Escape ALL quotes in strings: use \\" for quotes within strings
2. Replace all newlines with \\n
3. NO unescaped quotes, newlines, or special characters
4. Use simple, clean descriptions without complex formatting
5. Return ONLY the JSON object, no additional text

Schema to follow:
{
  "first_name": "string",
  "last_name": "string", 
  "research_fields": ["string"],
  "about": "string",
  "experience": [
    {
      "institution": "string",
      "role": "string", 
      "start_date": "string",
      "end_date": "string",
      "description": "string"
    }
  ],
  "academic_background": [
    {
      "institution": "string",
      "program": "string",
      "academic_degree": "string", 
      "start_date": "string",
      "end_date": "string"
    }
  ],
  "publications": [
    {
      "title": "string",
      "authors": ["string"],
      "venue": "string",
      "abstract": "string",
      "doi": "string", 
      "link": "string",
      "type": "string",
      "year": "string"
    }
  ],
  "awards": [
    {
      "award_name": "string",
      "year": "string"
    }
  ]
}

Instructions:
- Extract first and last names
- Research fields: technical skills, expertise areas, specializations
- About: summary/objective section
- Experience: all work positions with clean descriptions
- Academic background: all degrees and education
- Publications: papers, articles, conferences with full details
- Awards: honors, scholarships, recognitions
- Use "Present" for current positions
- Use empty string "" for missing values
- Use empty array [] for missing arrays
- Keep descriptions simple and clean
- Date format: "MM/YYYY" or "YYYY"
`;

    const prompt = new PromptTemplate({
      inputVariables: ["cv_text", "system_message"],
      template: "{system_message}\n\nCV Content:\n{cv_text}\n\nJSON Response:",
    });

    const chain = prompt.pipe(llm);

    const response = await chain.invoke({
      cv_text: cvText,
      system_message: systemMessage,
    });

    let jsonString = '';
    if (typeof response === 'string') {
      jsonString = response;
    } else if (response && typeof response === 'object' && 'content' in response) {
      jsonString = response.content;
    } else {
      throw new Error('Unexpected response format from LLM');
    }

    const cleanedJson = cleanJsonString(jsonString);
    const repairedJson = repairJson(cleanedJson);
    const result = JSON.parse(repairedJson);
    
    // Validate the result has the expected structure
    if (!result.first_name && !result.last_name) {
      throw new Error('Invalid extraction result - no name found');
    }
    
    return result;

  } catch (error: any) {
    console.error("Error during CV information extraction:", error);
    throw new Error(`Error during CV extraction: ${error.message}`);
  }
}