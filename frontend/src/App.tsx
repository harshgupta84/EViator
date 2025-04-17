// App.tsx
import React, { useState } from "react";
import ResumeUpload from "./components/ResumeUpload";
import { InterviewReport } from "./components/InterviewReport";
import type { Resume, Interview } from "./types";
import VoiceAssistant from "./components/VoiceAssistant";
import Header from "./components/Header";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

function App() {
  const [interview, setInterview] = useState<Interview | null>(null);
  // Always authenticated for now
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleResumeSubmit = (resume: Resume) => {
    navigate("/interview");
  };

  const handleInterviewComplete = (completedInterview: Interview) => {
    setInterview(completedInterview);
    navigate("/report");
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Keep authenticated even on logout for now
    navigate('/');
  };

  // Protected route component
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    return children;
  };

  return (
    <>
      <Header onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/signup" element={<Navigate to="/" />} />
        <Route
          path="/"
          element={<ResumeUpload onResumeSubmit={handleResumeSubmit} />}
        />
        <Route path="/interview" element={<VoiceAssistant />} />
        <Route path="/report" element={<InterviewReport />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
