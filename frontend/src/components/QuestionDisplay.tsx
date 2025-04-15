import React from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';


interface Question {
  Question: string;
  TestCase: string;
  Output: string;
}

interface QuestionDisplayProps {
  question: Question | null;
  currentIndex: number;
  totalQuestions: number;
  onNextQuestion: () => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  currentIndex,
  totalQuestions,
  onNextQuestion,
}) => {
  const isLastQuestion = currentIndex >= totalQuestions - 1;
  const getInterviewFeedback = async (skills: string[]) => {
    try {
      const genAI = new GoogleGenAI({ apiKey: "AIzaSyC0tdEPQrEy5Is0iG9DnO1BVpAWIg-5dx0" });
  
      const prompt = `Generate a starting text for an interview based on the candidate's skills: ${skills.join(', ')}.`;
  
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-pro-exp-03-25",
        contents: prompt,
      });
  
      return result.text || '';
      
    } catch (error) {
      console.error('Error generating starting text:', error);
      throw error;
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-white">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 text-white rounded-full h-7 w-7 flex items-center justify-center text-sm font-medium">
              {currentIndex + 1}
            </div>
            <h3 className="font-bold text-gray-800">
              Question {totalQuestions > 0 ? `${currentIndex + 1} of ${totalQuestions}` : 'N/A'}
            </h3>
          </div>
          <button
            onClick={onNextQuestion}
            className={`bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm ${
              isLastQuestion ? 'opacity-50 cursor-not-allowed' : 'hover:shadow'
            }`}
            disabled={isLastQuestion}
          >
            <span>Next Question</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-5">
        {question ? (
          <div className="space-y-5">
            {/* Problem Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h4 className="text-blue-600 font-medium mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Problem
              </h4>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown>{question.Question}</ReactMarkdown>
              </div>
            </div>

            {/* Test Case Section */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="text-blue-600 font-medium mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                Test Case
              </h4>
              <div className="prose prose-sm max-w-none text-gray-700 font-mono bg-white p-3 rounded border border-blue-100 text-sm overflow-auto">
                <ReactMarkdown>{question.TestCase}</ReactMarkdown>
              </div>
            </div>

            {/* Expected Output Section */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h4 className="text-green-600 font-medium mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Expected Output
              </h4>
              <div className="prose prose-sm max-w-none text-gray-700 font-mono bg-white p-3 rounded border border-green-100 text-sm overflow-auto">
                <ReactMarkdown>{question.Output}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <p className="mt-4 font-medium">No question available</p>
            <p className="text-sm">Please check back later or refresh the page</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-5 pb-5 pt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{Math.round((currentIndex + 1) / totalQuestions * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;