// components/InterviewReport.tsx
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Resume {
  fullName: string;
  email: string;
  experience: string;
  education: string;
  skills: string[];
}

interface Question {
  Question: string;
  TestCase: string;
  Output: string;
}

interface StoredData {
  resume: Resume;
  technicalQuestions: Question[];
  feedback: string[];
  code: string;
  timestamp: number;
  isCompleted?: boolean;
  conversation?: string[];
  duration?: number;
}

export function InterviewReport() {
  const [interviewData, setInterviewData] = useState<StoredData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('interview_data');
    if (stored) {
      setInterviewData(JSON.parse(stored));
    }
  }, []);

  if (!interviewData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No interview data found.</p>
      </div>
    );
  }

  const duration = interviewData.duration 
    ? Math.round(interviewData.duration / 60000) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Technical Interview Report</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Candidate Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Candidate Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{interviewData.resume.fullName}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{interviewData.resume.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Experience</p>
              <p className="font-medium">{interviewData.resume.experience}</p>
            </div>
            <div>
              <p className="text-gray-600">Skills</p>
              <p className="font-medium">{interviewData.resume.skills.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Interview Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600">Questions</div>
            <div className="text-2xl font-bold text-blue-600">
              {interviewData.technicalQuestions.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600">Duration</div>
            <div className="text-2xl font-bold text-green-600">
              {duration}min
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-2xl font-bold text-purple-600">
              {interviewData.isCompleted ? 'Completed' : 'In Progress'}
            </div>
          </div>
        </div>

        {/* Technical Questions and Answers */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Technical Questions</h2>
          {interviewData.technicalQuestions.map((q, index) => (
            <div key={index} className="mb-6 last:mb-0">
              <h3 className="font-medium text-lg mb-2">Question {index + 1}</h3>
              <p className="text-gray-700 mb-2">{q.Question}</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Test Case:</h4>
                <pre className="bg-gray-100 p-2 rounded">{q.TestCase}</pre>
                <h4 className="font-medium mt-4 mb-2">Expected Output:</h4>
                <pre className="bg-gray-100 p-2 rounded">{q.Output}</pre>
              </div>
            </div>
          ))}
        </div>

        {/* Code Submission */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Code Submission</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{interviewData.code}</code>
          </pre>
        </div>

        {/* Feedback */}
        {interviewData.feedback && interviewData.feedback.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Feedback</h2>
            <ul className="space-y-2">
              {interviewData.feedback.map((feedback, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-2">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{feedback}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conversation History */}
        {interviewData.conversation && interviewData.conversation.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Interview Conversation</h2>
            <div className="space-y-2">
              {interviewData.conversation.map((message, index) => (
                <div key={index} className="p-2 rounded bg-gray-50">
                  <p className="text-gray-700">{message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewReport;