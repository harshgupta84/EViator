// components/InterviewReport.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Clock, Calendar, Award, Code, MessageSquare, User, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { GoogleGenAI } from "@google/genai";
import { STORAGE_KEY } from "../utils/env";
import { getAIResponse } from "../services/aiService";
import { getInterviewFeedbackPrompt } from "../data/promptData";
import { generateSampleData, generateSampleAIFeedback } from "../data/sampleInterviewData";
import { Resume, Question, StoredData, FeedbackPoint, AIFeedback } from "../types/interviewTypes";

export function InterviewReport() {
  const [interviewData, setInterviewData] = useState<StoredData | null>(null);
  const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getInterviewFeedback = async (data: StoredData) => {
    try {
      // For demo purposes, just return sample feedback instead of making API call
      return generateSampleAIFeedback();
      
      /* Actual API implementation (commented for demo)
      const prompt = getInterviewFeedbackPrompt(
        data.resume.fullName,
        data.resume.skills,
        data.resume.experience,
        data.resume.education,
        data.technicalQuestions,
        data.code || '',
        data.conversation || []
      );

      const text = await getAIResponse(prompt);
      return JSON.parse(text);
      */
    } catch (error) {
      console.error('Error generating feedback:', error);
      return generateSampleAIFeedback();
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        const data = JSON.parse(stored);
        setInterviewData(data);
        try {
          const feedback = await getInterviewFeedback(data);
          setAIFeedback(feedback);
        } catch (error) {
          console.error("Error getting AI feedback:", error);
        }
      } else {
        // Use sample data when no real data exists
        setInterviewData(generateSampleData());
        setAIFeedback(generateSampleAIFeedback());
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
    
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Interview Report
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {interviewData.isCompleted ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completed
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <XCircle className="w-4 h-4 mr-1" />
                  Incomplete
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Interview Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <div className="text-sm text-gray-600">Candidate</div>
                <div className="font-medium">{interviewData.resume.fullName}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <div className="text-sm text-gray-600">Interview Date</div>
                <div className="font-medium">{formatDate(interviewData.timestamp)}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <div className="text-sm text-gray-600">Duration</div>
                <div className="font-medium">{duration} minutes</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Feedback Section */}
        {aiFeedback && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Award className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">AI Assessment</h2>
            </div>
            
            {/* Total Score */}
            <div className="text-center mb-6">
              <div className="inline-block p-6 bg-blue-50 rounded-full">
                <div className="text-5xl font-bold text-blue-600">
                  {aiFeedback.totalScore}
                </div>
                <div className="text-blue-600 font-medium">Total Score</div>
              </div>
            </div>

            {/* Evaluation Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {aiFeedback.evaluationPoints.map((point, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">
                      {point.category}
                    </h3>
                    <div className="text-2xl font-bold text-blue-600">
                      {point.score}<span className="text-sm font-normal text-gray-500">/10</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{point.comment}</p>
                </div>
              ))}
            </div>

            {/* Overall Feedback */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">
                Overall Assessment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {aiFeedback.overallFeedback}
              </p>
            </div>
          </div>
        )}

        {/* Candidate Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <User className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Candidate Profile</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Personal Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Name: </span>
                  <span className="text-gray-700">{interviewData.resume.fullName}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email: </span>
                  <span className="text-gray-700">{interviewData.resume.email}</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-700 mt-4 mb-2">Education</h3>
              <p className="text-gray-700">{interviewData.resume.education}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Experience</h3>
              <p className="text-gray-700">{interviewData.resume.experience}</p>
              
              <h3 className="font-semibold text-gray-700 mt-4 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {interviewData.resume.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Questions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Technical Assessment</h2>
          </div>
          
          <div className="space-y-6">
            {interviewData.technicalQuestions.map((q, index) => (
              <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                <h3 className="font-semibold text-gray-800">
                  Question {index + 1}: {q.Question}
                </h3>
                
                {q.TestCase && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-600">Test Case:</span>
                    <p className="mt-1 p-2 bg-gray-50 rounded text-gray-700 text-sm font-mono">
                      {q.TestCase}
                    </p>
                  </div>
                )}
                
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-600">Evaluation:</span>
                  <p className="mt-1 text-gray-700">
                    {q.Output}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Submission */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Code className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Code Submission</h2>
          </div>
          
          <div className="overflow-auto">
            <pre className="p-4 bg-gray-800 text-gray-200 rounded-lg text-sm font-mono">
              <code>{interviewData.code}</code>
            </pre>
          </div>
        </div>

        {/* Feedback Points */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Award className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Key Observations</h2>
          </div>
          
          <ul className="space-y-2">
            {interviewData.feedback.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Conversation History */}
        {interviewData.conversation && interviewData.conversation.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Interview Conversation</h2>
            </div>
            
            <div className="space-y-4">
              {interviewData.conversation.map((message, index) => {
                const isInterviewer = message.startsWith("Interviewer:");
                
                return (
                  <div 
                    key={index}
                    className={`flex ${isInterviewer ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        isInterviewer 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {message}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewReport;