// InterviewSystem.tsx
import React, { useState } from 'react';
import pdfToText from 'react-pdftotext';
import { defaultQuestions } from '../data/interviewData';
import { STORAGE_KEY } from '../utils/env';
import { getAIResponse } from '../services/aiService';

interface Resume {
  fullName: string;
  email: string;
  experience: string;
  education: string;
  skills: string[];
}
interface Question{
  Question: string;
  TestCase: string;
  Output: string;
}
interface StoredData {
  resume: Resume;
  startingText: string;
  technicalQuestions: Question[];
  timestamp: number;
}

const getStartingText = async (skills: string[]) => {
  try {
    const prompt = `Generate a starting text for an interview based on the candidate's skills: ${skills.join(', ')}.`;
    return await getAIResponse(prompt);
  } catch (error) {
    console.error('Error generating starting text:', error);
    return `Starting text for the interview based on the candidate's skills: ${skills.join(', ')}.`;
  }
};

const getDSAQuestions = async (skills: string[]) => {
  try {
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

    const text = await getAIResponse(prompt);
    
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
    console.error('Error generating DSA questions:', error);
    // Return default questions if API call fails
    return defaultQuestions;
  }
};

interface ResumeUploadProps {
  onResumeSubmit: (resume: Resume) => void;
}

export default function ResumeUpload({ onResumeSubmit }: ResumeUploadProps) {
  const [formData, setFormData] = useState<Resume>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedData: StoredData = JSON.parse(stored);
      return parsedData.resume;
    }
    return {
      fullName: '',
      email: '',
      experience: '',
      education: '',
      skills: [],
    };
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const updateStorage = (startingText: string, questions: Question[]) => {
    const storedData: StoredData = {
      resume: formData,
      startingText,
      technicalQuestions: questions,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const startingText = await getStartingText(formData.skills);
      const questions = await getDSAQuestions(formData.skills);
      updateStorage(startingText, questions);
      onResumeSubmit(formData);
    } catch (err) {
      setError('Failed to generate technical questions.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearStoredData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData({
      fullName: '',
      email: '',
      experience: '',
      education: '',
      skills: [],
    });
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    setIsProcessing(true);
    setError(null);

    try {
      const text = await pdfToText(file);
      
      // Extract information from the text
      const extractedData: Partial<Resume> = {
        skills: extractSkills(text),
        experience: extractExperience(text),
        education: extractEducation(text),
        email: extractEmail(text),
        fullName: extractName(text),
      };

      setFormData(prev => ({
        ...prev,
        ...extractedData
      }));
    } catch (err) {
      setError('Failed to extract text from PDF. Please try again or fill the form manually.');
      console.error('PDF parsing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper functions for text extraction
  function extractSkills(text: string): string[] {
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

  function extractExperience(text: string): string {
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

  function extractEducation(text: string): string {
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

  function extractEmail(text: string): string {
    // More precise email regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : '';
  }

  function extractName(text: string): string {
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

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Technical Interview Form</h2>

        <button
          onClick={clearStoredData}
          className="mb-4 px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
        >
          Clear Stored Data
        </button>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Resume (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {pdfFile && (
            <p className="mt-2 text-sm text-gray-500">
              Selected file: {pdfFile.name}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Experience</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Education</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Programming Skills (comma-separated)
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.skills.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                skills: e.target.value.split(',').map(s => s.trim()) 
              })}
              placeholder="e.g., Python, Java, JavaScript, C++"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              List programming languages you're comfortable with
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Generating Questions...' : 'Submit and Generate Questions'}
          </button>
        </form>
      </div>
    </div>
  );
}