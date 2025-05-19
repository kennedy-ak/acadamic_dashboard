import { config } from "dotenv";

config(); // Load environment variables from .env

export const settings = {
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  LLAMA_CLOUD_API_KEY: process.env.LLAMA_CLOUD_API_KEY || "",
  groq_model: "llama-3.3-70b-versatile", // Or your preferred model
  temperature: 0.7,
  max_tokens: 1500,
};
