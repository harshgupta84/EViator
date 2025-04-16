// App.tsx
import React, { useState, useEffect } from "react";
import ResumeUpload from "./components/ResumeUpload";
import { InterviewReport } from "./components/InterviewReport";
import { InterviewSession } from "./components/InterviewSession";
import type { Resume, Interview } from "./types";
import VoiceAssistant from "./components/VoiceAssistant";
import Header from "./components/Header";
import { Routes, Route, useNavigate } from "react-router-dom";
import { sampleResume, defaultQuestions, sampleCodeSubmission, STORAGE_KEY } from './data/interviewData';

function App() {
  const [interview, setInterview] = useState<Interview | null>(null);
  const navigate = useNavigate();

  // Generate demo data for testing the report
  useEffect(() => {
    // Create sample interview data for testing
    const createSampleData = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        resume: sampleResume,
        technicalQuestions: defaultQuestions.map((q, i) => ({
          Question: q.Question,
          TestCase: q.TestCase,
          Output: q.Output
        })),
        feedback: [
          "Strong technical knowledge in frontend technologies",
          "Communicated clearly and effectively throughout the interview",
          "Good problem-solving approach, explaining thought process before implementation",
          "Could improve knowledge of system design concepts"
        ],
        code: sampleCodeSubmission,
        timestamp: Date.now() - 86400000, // Yesterday
        isCompleted: true,
        duration: 45 * 60 * 1000 // 45 minutes in milliseconds
      }));
    };
    
    // Create sample data immediately to ensure report can be displayed
    createSampleData();
  }, []);

  const handleResumeSubmit = (resume: Resume) => {
    // Create a new interview with the resume data
    const newInterview: Interview = {
      candidateName: resume.fullName,
      status: 'in-progress',
      questions: defaultQuestions.map((q, i) => ({
        id: `q${i+1}`,
        question: q.Question,
        type: i % 2 === 0 ? 'verbal' : 'coding',
        expectedDuration: 120 + (i * 60)
      })),
      codeSubmissions: [],
      resume: resume,
      feedback: [],
      totalDuration: 0
    };
    
    setInterview(newInterview);
    
    // For now, just create a sample interview report directly
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      resume: resume,
      technicalQuestions: defaultQuestions,
      feedback: [
        "Good knowledge of frontend fundamentals",
        "Clear communication skills",
        "Demonstrated problem-solving approach",
        "Areas to improve: Advanced system design concepts"
      ],
      code: sampleCodeSubmission,
      timestamp: Date.now(),
      isCompleted: true,
      duration: 30 * 60 * 1000 // 30 minutes
    }));
    
    // Go directly to report for now
    navigate("/report");
  };

  const handleInterviewComplete = (completedInterview: Interview) => {
    setInterview(completedInterview);
    // This would normally process the interview data and save it
    navigate("/report");
  };

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={<ResumeUpload onResumeSubmit={handleResumeSubmit} />}
        />
        <Route 
          path="/interview" 
          element={
            interview ? 
            <InterviewSession 
              interview={interview} 
              onComplete={handleInterviewComplete} 
            /> : 
            <ResumeUpload onResumeSubmit={handleResumeSubmit} />
          } 
        />
        <Route path="/report" element={<InterviewReport />} />
      </Routes>
    </>
  );
}

export default App;
