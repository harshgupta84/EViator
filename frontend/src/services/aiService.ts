import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../utils/env";

/**
 * Send a prompt to the AI and get a response
 * @param prompt The prompt to send to the AI
 * @returns The generated text response
 */
export const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-pro-exp-03-25",
      contents: prompt,
    });

    return result.text || '';
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}; 