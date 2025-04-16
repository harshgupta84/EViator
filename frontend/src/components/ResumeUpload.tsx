// ResumeUpload.tsx
import React, { useState } from 'react';
import { ResumeForm } from './resume/ResumeForm';
import { PdfUploader } from './resume/PdfUploader';
import { extractResumeData } from '../utils/resumeParser';
import { generateStartingText, generateTechnicalQuestions } from '../services/aiService';
import { Resume, Question, StoredData } from '../types';
import { defaultQuestions, STORAGE_KEY } from '../data/interviewData';

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
    setError(null);
    
    try {
      const startingText = await generateStartingText(formData.skills);
      const questions = await generateTechnicalQuestions(formData.skills, defaultQuestions);
      updateStorage(startingText, questions);
      onResumeSubmit(formData);
    } catch (err) {
      setError('Failed to generate technical questions. Please try again.');
      console.error('Error generating interview data:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (!file) return;

    setPdfFile(file);
    setIsProcessing(true);
    setError(null);

    try {
      const extractedData = await extractResumeData(file);
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

  const clearStoredData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData({
      fullName: '',
      email: '',
      experience: '',
      education: '',
      skills: [],
    });
    setPdfFile(null);
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

        <PdfUploader 
          onUpload={handlePdfUpload} 
          selectedFile={pdfFile} 
        />

        <ResumeForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
          error={error}
        />
      </div>
    </div>
  );
}