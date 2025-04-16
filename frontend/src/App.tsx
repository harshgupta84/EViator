// App.tsx
import React, { useState } from "react";
import ResumeUpload from "./components/ResumeUpload";
import { InterviewReport } from "./components/InterviewReport";
import type { Resume, Interview } from "./types";
import VoiceAssistant from "./components/VoiceAssistant";
import Header from "./components/Header";
import { Routes, Route, useNavigate } from "react-router-dom";

function App() {
  const [interview, setInterview] = useState<Interview | null>(null);
  const navigate = useNavigate();

  const handleResumeSubmit = (resume: Resume) => {
    
    navigate("/interview");
  };

  const handleInterviewComplete = (completedInterview: Interview) => {
    setInterview(completedInterview);
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
        <Route path="/interview" element={<VoiceAssistant />} />
        <Route path="/report" element={<InterviewReport />} />
      </Routes>
    </>
  );
}

export default App;
