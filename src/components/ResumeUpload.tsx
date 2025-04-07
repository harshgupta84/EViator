// InterviewSystem.tsx
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Resume {
  fullName: string;
  email: string;
  experience: string;
  education: string;
  skills: string[];
}

interface StoredData {
  resume: Resume;
  startingText: string;
  technicalQuestions: string;
  timestamp: number;
}

const STORAGE_KEY = 'interview_data';

const getStartingText = async (skills: string[]) => {
  try {
    // const genAI = new GoogleGenAI({ apiKey: "AIzaSyC0tdEPQrEy5Is0iG9DnO1BVpAWIg-5dx0" });

    // const prompt = `Generate a starting text for an interview based on the candidate's skills: ${skills.join(', ')}.`;

    // const result = await genAI.models.generateContent({
    //   model: "gemini-2.5-pro-exp-03-25",
    //   contents: prompt,
    // });

    // return result.text || '';
    return `Starting text for the interview based on the candidate's skills: ${skills.join(', ')}.`;
  } catch (error) {
    console.error('Error generating starting text:', error);
    throw error;
  }
};

const getDSAQuestions = async (skills: string[]) => {
  try {
    // const genAI = new GoogleGenAI({ apiKey: "AIzaSyBIAl7cet4NRyO8s1lyvwrxsoVxHHwMaoI" });

    // const prompt = `Based on the candidate's skills: ${skills.join(', ')}, generate three DSA (Data Structures and Algorithms) questions. Each question should include a test case. Do not provide solutions or additional details. Format the response as follows:

    // DSA QUESTIONS:
    // 1. Easy:
    //    Problem: [problem statement]
    //    Test Case: [example input/output]

    // 2. Medium:
    //    Problem: [problem statement]
    //    Test Case: [example input/output]

    // 3. Hard:
    //    Problem: [problem statement]
    //    Test Case: [example input/output]`;

    // const result = await genAI.models.generateContent({
    //   model: "gemini-2.5-pro-exp-03-25",
    //   contents: prompt,
    // });

    // return result.text || '';
    return 'Write the BFS algo for a graph'
  } catch (error) {
    console.error('Error generating DSA questions:', error);
    throw error;
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

  const updateStorage = (startingText: string, questions: string) => {
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