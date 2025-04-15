// components/InterviewReport.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";

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

interface FeedbackPoint {
  category: string;
  score: number;
  comment: string;
}

interface AIFeedback {
  evaluationPoints: FeedbackPoint[];
  overallFeedback: string;
  totalScore: number;
}

export function InterviewReport() {
  const [interviewData, setInterviewData] = useState<StoredData | null>(null);
  const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getInterviewFeedback = async (data: StoredData) => {
    try {
      const genAI = new GoogleGenAI({ apiKey: "AIzaSyCDrmK97AyjO07DqBEFw9T9FDwk5J5lyT8" });
      
      const prompt = `
      You are a technical interviewer. Review this complete interview data and provide feedback:
      
      CANDIDATE INFORMATION:
      Name: ${data.resume.fullName}
      Skills: ${data.resume.skills.join(", ")}
      Experience: ${data.resume.experience}
      Education: ${data.resume.education}
      
      TECHNICAL ASSESSMENT:
      Questions Asked: ${data.technicalQuestions
        .map((q, i) => `\nQ${i + 1}: ${q.Question}`)
        .join("")}
      
      CODE SUBMISSION:
      ${data.code}
      
      INTERVIEW CONVERSATION:
      ${data.conversation?.join("\n")}
      
      Based on this complete interview, provide feedback in this exact JSON format:
      
      {
        "evaluationPoints": [
          {
            "category": "Technical Knowledge",
            "score": <1-10>,
            "comment": "<one-line evaluation based on technical responses and code>"
          },
          {
            "category": "Problem Solving",
            "score": <1-10>,
            "comment": "<one-line evaluation of approach and solutions>"
          },
          {
            "category": "Communication",
            "score": <1-10>,
            "comment": "<one-line evaluation of articulation and clarity>"
          },
          {
            "category": "Overall Attitude",
            "score": <1-10>,
            "comment": "<one-line evaluation of professionalism and enthusiasm>"
          }
        ],
        "overallFeedback": "<3-4 sentences summarizing performance, strengths, and improvement areas>",
        "totalScore": <0-100>
      }`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-pro-exp-03-25",
        contents: prompt,
      });

      
      const text = result.text || "";
      return JSON.parse(text);
    } catch (error) {
      console.error("Error generating feedback:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const stored = localStorage.getItem("interview_data");
      if (stored) {
        const data = JSON.parse(stored);
        setInterviewData(data);
        try {
          const feedback = await getInterviewFeedback(data);
          setAIFeedback(feedback);
        } catch (error) {
          console.error("Error getting AI feedback:", error);
        }
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
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* AI Feedback Section */}
        {aiFeedback && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">AI Assessment</h2>
            
            {/* Total Score */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-blue-50 rounded-full">
                <div className="text-5xl font-bold text-blue-600">
                  {aiFeedback.totalScore}
                </div>
                <div className="text-blue-600">Total Score</div>
              </div>
            </div>

            {/* Evaluation Points */}
            <div className="space-y-4 mb-6">
              {aiFeedback.evaluationPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700">
                      {point.category}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{point.comment}</p>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {point.score}/10
                    </div>
                  </div>
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

        {/* Rest of your existing sections... */}
        {/* (Keep your existing Candidate Info, Interview Stats, Technical Questions, 
            Code Submission, Feedback, and Conversation History sections as they are) */}
      </div>
    </div>
  );
}

export default InterviewReport;