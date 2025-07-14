import { ChatOpenAI } from "@langchain/openai";
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

const llm = new ChatOpenAI({
  model: settings.openai_model,
  apiKey: settings.OPENAI_API_KEY,
  temperature: settings.temperature,
  maxTokens: settings.max_tokens,
});

// Enhanced JSON cleaning function
function cleanJsonString(jsonString: string): string {
  // Remove markdown code blocks and any surrounding text
  jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Remove any text before the first { and after the last }
  const jsonStart = jsonString.indexOf('{');
  const jsonEnd = jsonString.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1) {
    jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
  }
  
  // Remove any trailing text after the JSON
  const lines = jsonString.split('\n');
  const cleanedLines = [];
  let jsonStarted = false;
  let braceCount = 0;
  
  for (const line of lines) {
    if (line.trim().startsWith('{')) {
      jsonStarted = true;
    }
    
    if (jsonStarted) {
      cleanedLines.push(line);
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      if (braceCount === 0 && line.includes('}')) {
        break;
      }
    }
  }
  
  return cleanedLines.join('\n').trim();
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
    
    // Remove any non-JSON content at the beginning or end
    repaired = repaired.trim();
    if (!repaired.startsWith('{')) {
      const firstBrace = repaired.indexOf('{');
      if (firstBrace !== -1) {
        repaired = repaired.substring(firstBrace);
      }
    }
    
    // Fix truncated JSON by ensuring proper closing
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/]/g) || []).length;
    
    // Add missing closing brackets for arrays
    if (openBrackets > closeBrackets) {
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        repaired += ']';
      }
    }
    
    // Add missing closing braces for objects
    if (openBraces > closeBraces) {
      for (let i = 0; i < openBraces - closeBraces; i++) {
        repaired += '}';
      }
    }
    
    // Fix truncated strings - find unclosed quotes
    const quotes = repaired.match(/"/g) || [];
    if (quotes.length % 2 !== 0) {
      // Odd number of quotes means there's an unclosed string
      repaired += '"';
    }
    
    // Fix trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix missing commas between objects/arrays
    repaired = repaired.replace(/}(\s*){/g, '},$1{');
    repaired = repaired.replace(/](\s*)\[/g, '],$1[');
    
    // Fix unescaped quotes in values
    repaired = repaired.replace(/:\s*"([^"\\]*)([^"]*?)([^"\\]*?)"/g, (match, p1, p2, p3) => {
      if (p2.includes('"')) {
        return `: "${p1}${p2.replace(/"/g, '\\"')}${p3}"`;
      }
      return match;
    });
    
    // Fix missing quotes around property names
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    try {
      JSON.parse(repaired);
      return repaired;
    } catch (secondError) {
      console.log("JSON repair failed, trying aggressive cleanup...");
      
      // More aggressive cleanup - try to fix the structure
      repaired = repaired
        .replace(/[\n\r\t]/g, ' ') // Remove all newlines and tabs
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/,\s*}/g, '}') // Remove trailing commas before }
        .replace(/,\s*]/g, ']') // Remove trailing commas before ]
        .replace(/,\s*$/, ''); // Remove trailing comma at end
      
      // Try to fix common truncation patterns
      if (repaired.endsWith(',')) {
        repaired = repaired.slice(0, -1);
      }
      
      // If string ends with incomplete array element, close it properly
      if (repaired.match(/,\s*"[^"]*$/)) {
        repaired = repaired.replace(/,\s*"[^"]*$/, '');
      }
      
      try {
        JSON.parse(repaired);
        return repaired;
      } catch (thirdError) {
        console.log("All JSON repair attempts failed");
        throw thirdError;
      }
    }
  }
}

// Fallback function to create a basic CV structure
function createFallbackCV(): CVExtraction {
  return {
    first_name: "",
    last_name: "",
    research_fields: [],
    about: "",
    experience: [],
    academic_background: [],
    publications: [],
    awards: []
  };
}



// Enhanced CV Information Extraction Function
export async function extractCVInfo(cvText: string): Promise<CVExtraction> {
  try {
    const systemMessage = `
You are a professional CV information extractor. Extract information and return ONLY valid, complete JSON.

CRITICAL JSON RULES:
1. Return ONLY valid JSON - no markdown, no explanations, no extra text
2. Ensure JSON is COMPLETE - all arrays and objects must be properly closed
3. Keep strings SHORT to avoid truncation - maximum 100 characters per string
4. Escape ALL quotes in strings: use \\" for quotes within strings
5. Replace all newlines with \\n
6. NO unescaped quotes, newlines, or special characters
7. If unsure about a field, use empty string "" or empty array []
8. MUST end with a complete, valid JSON structure

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
- Date format for academic_background and experience: MUST be "DD/MM/YYYY" format
- If only year provided, default to "01/01/YYYY" for academic_background and experience dates
- If month/year provided (e.g., "September 2020"), convert to "01/09/2020" format
- For incomplete dates, always default day to "01" to ensure DD/MM/YYYY format
- For publications and awards, use "YYYY" format for year field
- Examples: "2020" → "01/01/2020", "Sept 2020" → "01/09/2020", "09/2020" → "01/09/2020"
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
      if (Array.isArray(response.content)) {
        jsonString = response.content
          .map(item => (typeof item === 'object' && 'text' in item) ? item.text : '')
          .join('');
      } else if (typeof response.content === 'string') {
        jsonString = response.content;
      } else {
        throw new Error('Unexpected response.content format from LLM');
      }
    } else {
      throw new Error('Unexpected response format from LLM');
    }

    const cleanedJson = cleanJsonString(jsonString);
    
    console.log("Cleaned JSON string:", cleanedJson.substring(0, 200) + "...");
    
    try {
      const repairedJson = repairJson(cleanedJson);
      const result = JSON.parse(repairedJson);
      
      // Validate the result has the expected structure
      if (typeof result !== 'object' || result === null) {
        throw new Error('Invalid JSON structure - not an object');
      }
      
      // Ensure all required fields exist with default values
      const validatedResult: CVExtraction = {
        first_name: result.first_name || "",
        last_name: result.last_name || "",
        research_fields: Array.isArray(result.research_fields) ? result.research_fields : [],
        about: result.about || "",
        experience: Array.isArray(result.experience) ? result.experience : [],
        academic_background: Array.isArray(result.academic_background) ? result.academic_background : [],
        publications: Array.isArray(result.publications) ? result.publications : [],
        awards: Array.isArray(result.awards) ? result.awards : []
      };
      
      return validatedResult;
      
    } catch (parseError: any) {
      console.error("JSON parsing failed completely:", parseError.message);
      console.log("Attempting to create fallback CV with manual parsing...");
      
      // Try to extract basic information manually from the raw text
      const fallbackCV = createFallbackCV();
      
      // Try to extract name from the raw CV text as fallback
      const nameMatch = cvText.match(/(?:name|Name)[:\s]*([A-Z][a-z]+)\s+([A-Z][a-z]+)/i);
      if (nameMatch) {
        fallbackCV.first_name = nameMatch[1];
        fallbackCV.last_name = nameMatch[2];
      }
      
      console.log("Using fallback CV structure");
      return fallbackCV;
    }

  } catch (error: any) {
    console.error("Error during CV information extraction:", error);
    
    // Return fallback structure instead of throwing
    console.log("Returning fallback CV due to extraction error");
    return createFallbackCV();
  }
}
