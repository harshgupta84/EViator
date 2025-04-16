// Environment variables
export const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || 'interview_data';
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Ensure environment variables are defined
if (!GEMINI_API_KEY) {
  console.warn('API key is not defined in environment variables');
} 