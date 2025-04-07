// App.tsx
import React, { useState } from 'react';
import ResumeUpload from './components/ResumeUpload';
import { InterviewReport } from './components/InterviewReport';
import type { Resume, Interview } from './types';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'interview' | 'report'>('upload');
  const [interview, setInterview] = useState<Interview | null>(null);

  const handleResumeSubmit = (resume: Resume) => {
    // Transition to the interview step
    setCurrentStep('interview');
  };

  const handleInterviewComplete = (completedInterview: Interview) => {
    setInterview(completedInterview);
    setCurrentStep('report');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Interview System</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentStep === 'upload' && (
          <ResumeUpload onResumeSubmit={handleResumeSubmit} />
        )}
        {currentStep === 'interview' && (
          <VoiceAssistant />
        )}
        {currentStep === 'report' && interview && (
          <InterviewReport interview={interview} />
        )}
      </main>
    </div>
  );
}

export default App;