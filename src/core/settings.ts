
import { config } from "dotenv";

config(); // Load environment variables from .env

export const settings = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  openai_model: "gpt-4o-mini",
  temperature: 0.1,
  max_tokens: 4000,
};

// Add validation function instead of throwing at module load
export const validateSettings = () => {
  const missing = [];
  if (!settings.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};