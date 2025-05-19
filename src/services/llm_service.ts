import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { settings } from "../core/settings";
import { CVReview } from "../core/types";
import { JsonOutputParser } from "@langchain/core/output_parsers";

const llm = new ChatGroq({
  model: settings.groq_model,
  apiKey: settings.GROQ_API_KEY,
  temperature: settings.temperature,
  maxTokens: settings.max_tokens,
});

export async function reviewCV(cvText: string): Promise<CVReview> {
  try {
    const systemMessage = `
        You are a professional CV reviewer and career coach.
        Provide a detailed analysis of the CV with percentage scores. Focus on:
        1. Overall structure and formatting (score this out of 100%),
        2. Content quality and clarity (score this out of 100%),
        3. Skills presentation (score this out of 100%),
        4. Experience highlights (score this out of 100%),
        5. Specific improvement suggestions,

        Also provide an overall CV score as a percentage based on the average of all sections.

        Your response should be in JSON format and should conform to the following Pydantic schema:
        ${JSON.stringify({
          overall_structure: { score: 0, reasoning: "" },
          content_quality: { score: 0, reasoning: "" },
          skills_presentation: { score: 0, reasoning: "" },
          experience_highlights: { score: 0, reasoning: "" },
          overall_score: { score: 0, reasoning: "" },
          improvement_suggestions: [""],
        } as CVReview)}
    `;

    const parser = new JsonOutputParser<CVReview>();

    const prompt = new PromptTemplate({
      inputVariables: ["cv_text", "system_message"],
      template:
        "{system_message}\n\nUploaded CV content: {cv_text}\nAssistant:",
    });

    const chain = prompt.pipe(llm).pipe(parser);

    const result = await chain.invoke({
      cv_text: cvText,
      system_message: systemMessage,
    });

    return result;
  } catch (error: any) {
    console.error("Error during CV review:", error);
    throw new Error(`Error during CV review: ${error.message}`);
  }
}
