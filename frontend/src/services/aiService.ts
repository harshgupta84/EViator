import { GoogleGenAI } from '@google/genai';
import { Question } from '../types';

// Get API key from environment variable or use a placeholder
const API_KEY = "AIzaSyCDrmK97AyjO07DqBEFw9T9FDwk5J5lyT8";

/**
 * Generate a starting text for the interview based on candidate skills
 */
export const generateStartingText = async (skills: string[]): Promise<string> => {
  try {
    // For development, return a mock response
    // In production, uncomment the API call
    return `Starting text for the interview based on the candidate's skills: ${skills.join(', ')}.`;
    
    /* Actual API implementation
    const genAI = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Generate a starting text for an interview based on the candidate's skills: ${skills.join(', ')}.`;
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-pro-exp-03-25",
      contents: prompt,
    });
    return result.text || '';
    */
  } catch (error) {
    console.error('Error generating starting text:', error);
    throw error;
  }
};

/**
 * Generate technical questions based on candidate skills
 */
export const generateTechnicalQuestions = async (skills: string[], defaultQuestions: Question[]): Promise<Question[]> => {
  try {
    const genAI = new GoogleGenAI({ apiKey: API_KEY });
   
    const prompt = `As a technical interviewer, generate 4 programming questions based on the candidate's skills: ${skills.join(', ')}. 

    Format each question exactly as follows:

    {
      "questions": [
        {
          "Question": "<clear problem statement>",
          "TestCase": "<specific input format and example>",
          "Output": "<expected output for the test case>"
        }
      ]
    }

    Requirements for questions:
    1. First question should be Easy (array/string manipulation)
    2. Second question should be Medium (data structures: trees/linked lists/stacks)
    3. Third question should be Medium-Hard (algorithms: dynamic programming/graphs)
    4. Fourth question should be System Design or Advanced Concept based on candidate's skills

    Guidelines:
    - Questions should be clear and concise
    - Test cases should be specific with exact input format
    - Expected output should match the test case
    - Questions should progressively increase in difficulty
    - Include relevant skills from: ${skills.join(', ')}
    - Each question should test different aspects of programming

    Return only valid JSON with 4 questions following this exact structure.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-pro-exp-03-25",
      contents: prompt,
    });

    const text = result.text || '';
    
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(text);
      
      // Check if questions array exists and return it
      if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
        return parsedResponse.questions;
      }

      // If parsing succeeds but format is wrong, return default questions
      return defaultQuestions;
    } catch (parseError) {
      console.error('Error parsing questions:', parseError);
      return defaultQuestions;
    }
  } catch (error) {
    console.error('Error generating technical questions:', error);
    // Return default questions if API call fails
    return defaultQuestions;
  }
}; 