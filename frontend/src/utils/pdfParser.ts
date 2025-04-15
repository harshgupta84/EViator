import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import type { Resume } from '../types';

// Initialize PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

export async function extractResumeData(file: File): Promise<Partial<Resume>> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument(arrayBuffer).promise;
  
  let fullText = '';
  
  // Extract text from all pages
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + ' ';
  }

  // Basic information extraction using regex patterns
  const extractedData: Partial<Resume> = {
    skills: extractSkills(fullText),
    experience: extractExperience(fullText),
    education: extractEducation(fullText),
    email: extractEmail(fullText),
    fullName: extractName(fullText),
  };

  return extractedData;
}

function extractSkills(text: string): string[] {
  // Look for common skill sections and technical terms
  const skillsRegex = /(?:skills|technologies|technical skills|programming languages)(?::|.{0,10})(.*?)(?:\n|$)/i;
  const match = text.match(skillsRegex);
  if (match) {
    return match[1]
      .split(/[,|]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }
  return [];
}

function extractExperience(text: string): string {
  // Look for experience or work history sections
  const experienceRegex = /(?:experience|work history|professional experience)(?::|.{0,10})(.*?)(?:education|skills|$)/is;
  const match = text.match(experienceRegex);
  return match ? match[1].trim() : '';
}

function extractEducation(text: string): string {
  // Look for education section
  const educationRegex = /(?:education|academic background)(?::|.{0,10})(.*?)(?:experience|skills|$)/is;
  const match = text.match(educationRegex);
  return match ? match[1].trim() : '';
}

function extractEmail(text: string): string {
  // Look for email addresses
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i;
  const match = text.match(emailRegex);
  return match ? match[1] : '';
}

function extractName(text: string): string {
  // Look for name at the beginning of the resume
  const firstLine = text.split('\n')[0];
  return firstLine.trim();
}