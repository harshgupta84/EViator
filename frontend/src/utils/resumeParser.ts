import pdfToText from 'react-pdftotext';
import { Resume } from '../types';

/**
 * Extract resume data from PDF file
 */
export const extractResumeData = async (file: File): Promise<Partial<Resume>> => {
  const text = await pdfToText(file);
  
  return {
    fullName: extractName(text),
    email: extractEmail(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    skills: extractSkills(text),
  };
};

/**
 * Extract skills from resume text
 */
export function extractSkills(text: string): string[] {
  // Look for skills section with better pattern matching
  const skillsRegex = /(?:skills|technologies|technical skills|programming languages|expertise)(?::|.{0,10})(.*?)(?:\n\n|\n\s*\n|$)/is;
  const match = text.match(skillsRegex);
  if (match) {
    // Clean up the skills text
    const skillsText = match[1]
      .replace(/[•\-*]/g, ',') // Replace bullet points with commas
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return skillsText
      .split(/[,|]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0 && !skill.match(/^\d+$/)); // Filter out numbers
  }
  return [];
}

/**
 * Extract experience from resume text
 */
export function extractExperience(text: string): string {
  // Look for experience section with better boundaries
  const experienceRegex = /(?:experience|work history|professional experience|employment history)(?::|.{0,10})(.*?)(?:\n\n|\n\s*\n|education|skills|$)/is;
  const match = text.match(experienceRegex);
  if (match) {
    // Clean up the experience text
    return match[1]
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
      .substring(0, 500); // Limit to 500 characters
  }
  return '';
}

/**
 * Extract education from resume text
 */
export function extractEducation(text: string): string {
  // Look for education section with better boundaries
  const educationRegex = /(?:education|academic background|academic qualifications)(?::|.{0,10})(.*?)(?:\n\n|\n\s*\n|experience|skills|$)/is;
  const match = text.match(educationRegex);
  if (match) {
    // Clean up the education text
    return match[1]
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
      .substring(0, 300); // Limit to 300 characters
  }
  return '';
}

/**
 * Extract email from resume text
 */
export function extractEmail(text: string): string {
  // More precise email regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
}

/**
 * Extract name from resume text
 */
export function extractName(text: string): string {
  // Look for name at the beginning of the document
  const firstLines = text.split('\n').slice(0, 3); // Check first 3 lines
  for (const line of firstLines) {
    const cleanLine = line.trim();
    // Skip lines that look like headers or contact info
    if (cleanLine && 
        !cleanLine.match(/^(resume|cv|curriculum vitae|contact|phone|email|linkedin|github)/i) &&
        !cleanLine.match(/^\d/) && // Skip lines starting with numbers
        !cleanLine.match(/^[A-Z\s]+$/) && // Skip all-caps lines
        cleanLine.length > 2 && cleanLine.length < 50) { // Reasonable name length
      
      // Split the line into words and take only first two words
      const words = cleanLine.split(/\s+/).filter(word => word.length > 0);
      if (words.length >= 2) {
        // Take only first and last name
        return `${words[0]} ${words[1]}`;
      }
    }
  }
  return '';
} 