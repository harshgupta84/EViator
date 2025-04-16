// components/InterviewReport.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Clock, Calendar, Award, Code, MessageSquare, User, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { GoogleGenAI } from "@google/genai";
import { STORAGE_KEY, GEMINI_API_KEY } from "../utils/env";

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

// Generate sample data when no real data exists
const generateSampleData = (): StoredData => {
  return {
    resume: {
      fullName: "John Doe",
      email: "john.doe@example.com",
      experience: "5 years experience as a Full Stack Developer at Tech Innovations Inc. Led development of multiple web applications using React, Node.js, and AWS.",
      education: "Bachelor of Science in Computer Science, University of Technology, 2018",
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "AWS", "MongoDB", "GraphQL", "Docker"]
    },
    technicalQuestions: [
      {
        Question: "Explain how React's virtual DOM works and its advantages.",
        TestCase: "",
        Output: "The candidate explained that React's virtual DOM is an in-memory representation of the actual DOM. When state changes occur, React creates a new virtual DOM tree, compares it with the previous one (diffing), and updates only the necessary parts of the actual DOM. This approach minimizes direct DOM manipulation, resulting in better performance for complex UIs. The candidate demonstrated good understanding of React's core concepts."
      },
      {
        Question: "Write a function to find the first non-repeating character in a string.",
        TestCase: "Input: 'programming'",
        Output: "The candidate provided a solution using a Map to track character counts, then found the first character with a count of 1. Their solution had O(n) time complexity. Code was well-structured with good variable naming and comments."
      },
      {
        Question: "Explain the difference between HTTP and WebSockets.",
        TestCase: "",
        Output: "The candidate explained that HTTP is a request-response protocol where the client initiates all communication and the connection closes after each response. WebSockets provide persistent, bi-directional communication channels, allowing both client and server to send messages anytime. They discussed appropriate use cases for each, showing good understanding of web communication protocols."
      }
    ],
    feedback: [
      "Strong technical knowledge in frontend technologies",
      "Communicated clearly and effectively throughout the interview",
      "Good problem-solving approach, explaining thought process before implementation",
      "Could improve knowledge of system design concepts"
    ],
    code: `function findFirstNonRepeatingChar(str) {
  if (!str || str.length === 0) {
    return null;
  }
  
  const charMap = new Map();
  
  // Count occurrences of each character
  for (const char of str) {
    charMap.set(char, (charMap.get(char) || 0) + 1);
  }
  
  // Find first character with count of 1
  for (const char of str) {
    if (charMap.get(char) === 1) {
      return char;
    }
  }
  
  // No non-repeating character found
  return null;
}

// Test with example
console.log(findFirstNonRepeatingChar('programming')); // Output: 'p'`,
    timestamp: Date.now() - 86400000, // Yesterday
    isCompleted: true,
    conversation: [
      "Interviewer: Hello John, welcome to the technical interview. How are you today?",
      "Candidate: Hi, I'm doing well, thank you. I'm excited for this opportunity.",
      "Interviewer: Great! Let's start with some basic questions about your experience with React.",
      "Candidate: Sounds good, I've been working with React for about 4 years now.",
      "Interviewer: Can you explain how React's virtual DOM works and its advantages?",
      "Candidate: Sure! React's virtual DOM is an in-memory representation of the actual DOM...",
      "Interviewer: Excellent explanation. Now let's move on to a coding problem...",
    ],
    duration: 45 * 60 * 1000 // 45 minutes in milliseconds
  };
};

// Sample AI feedback when no real feedback exists
const generateSampleAIFeedback = (): AIFeedback => {
  return {
    evaluationPoints: [
      {
        category: "Technical Knowledge",
        score: 8,
        comment: "Demonstrated solid understanding of React, JavaScript, and web protocols with clear explanations."
      },
      {
        category: "Problem Solving",
        score: 7,
        comment: "Approached problems methodically with good optimization considerations."
      },
      {
        category: "Communication",
        score: 9,
        comment: "Articulated concepts clearly with excellent technical vocabulary and coherent explanations."
      },
      {
        category: "Overall Attitude",
        score: 8,
        comment: "Showed enthusiasm, professionalism, and genuine interest in technical discussions."
      }
    ],
    overallFeedback: "John demonstrated strong technical aptitude, particularly in frontend technologies. His communication skills are excellent, explaining complex concepts with clarity. Could benefit from more exposure to system design concepts. Overall, a strong candidate who would likely be a valuable addition to a development team.",
    totalScore: 80
  };
};

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
      const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
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