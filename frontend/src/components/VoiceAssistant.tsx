import React, { useEffect, useState } from 'react';
import Vapi from '@vapi-ai/web';
import Webcam from 'react-webcam';
import MultiLangIDE from './MultiLangIDE';
import InterviwerCrad from './InterviwerCard';
import { useNavigate } from 'react-router-dom';
import QuestionDisplay from './QuestionDisplay';

const vapi = new Vapi("89d9dcde-d231-405e-888b-634fb4c6ed91");

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
  startingText: string;
  technicalQuestions: Question[];
  feedback: string[];
  code: string;
  timestamp: number;
  isCompleted?: boolean;
  conversation?: string[];
}

function VoiceAssistant() {
  const [storedData, setStoredData] = useState<StoredData | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>('// Write your code here');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [showWebcam, setShowWebcam] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isVapiSpeaking, setIsVapiSpeaking] = useState(false);
  const [conversation,setConversation] = useState<string[]>([]);
  const navigate = useNavigate();
  const supportedLanguages = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'C++', value: 'cpp' },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('interview_data');
    if (stored) {
      const parsedData: StoredData = JSON.parse(stored);
      setStoredData(parsedData);
      setQuestions(parsedData.technicalQuestions);
      setFeedback(parsedData.feedback || []);
      setCurrentCode(parsedData.code || '// Write your code here');
    }
  }, []);

  const updateLocalStorage = (updatedData: Partial<StoredData>) => {
    const newData = { ...storedData, ...updatedData, timestamp: Date.now() };
    setStoredData(newData as StoredData);
    localStorage.setItem('interview_data', JSON.stringify(newData));
  };

  const generateInitialMessage = (data: StoredData | null) => {
    if (!data) return "Hi there! I'm your AI interviewer. It seems I don't have your data. Could you please introduce yourself?";
    
    return `Hi ${data.resume.fullName}! I'm your AI technical interviewer. 
    I can see you have experience in ${data.resume.skills.join(', ')}. 
    I'll be conducting a technical interview based on your background and the following assessment:  
    Let's begin - could you briefly tell me about yourself?`;
  };

  const startInterview = async () => {
    if (!storedData) {
      alert("Please submit your resume and generate technical questions first!");
      return;
    }
  
    try {
      const formattedQuestions = questions.map((q, index) => `Q${index + 1}: ${q.Question}`).join('\n');
      
      vapi.start("826b814e-4b2c-4707-ab5f-c8c73a3bde28", {
        variableValues:{
          candidateName: storedData.resume.fullName,
          candidateEmail: storedData.resume.email,
          candidateExperience: storedData.resume.experience,
          candidateEducation: storedData.resume.education,
          candidateSkills: storedData.resume.skills.join(', '),
          candidateCode: currentCode,
          technicalQuestions: formattedQuestions,
        },
        firstMessage: generateInitialMessage(storedData),
        endCallMessage: "Thank you for your time! I will now process your responses and provide feedback.",
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 1800,
        backgroundSound: "off",
        
        messagePlan: {
          idleTimeoutSeconds: 10,
          silenceTimeoutMessage: "Are you still there? Should we continue with the interview?"
        },
      });
  
      setIsInterviewStarted(true);
  
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start interview. Please try again.");
    }
  };

  const handleEndInterview = async () => {
    if (!isInterviewStarted) return;
    vapi.stop();
    const confirmEnd = window.confirm(
      "Are you sure you want to end the interview? This action cannot be undone."
    );
    
    if (!confirmEnd) return;
    
    try {
      const interviewSummary = {
        duration: Date.now() - (storedData?.timestamp || Date.now()),
        questionsCompleted: currentQuestionIndex + 1,
        totalQuestions: questions.length,
        code: currentCode,
        feedback: feedback,
        conversation: conversation,

      };
      
      updateLocalStorage({
        ...interviewSummary,
        isCompleted: true
      });
      
      setIsInterviewStarted(false);
      setIsInterviewEnded(true);
      
      alert(`
        Interview completed successfully!
        
        Summary:
        - Duration: ${Math.round(interviewSummary.duration / 60000)} minutes
        - Questions Completed: ${interviewSummary.questionsCompleted}/${interviewSummary.totalQuestions}
        
        Your responses have been saved.
      `);
      
    } catch (error) {
      console.error("Error ending interview:", error);
      alert("Failed to end interview. Please try again.");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      alert('You have reached the end of the questions.');
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCurrentCode(newCode);
    updateLocalStorage({ code: newCode });
  };

  const handleViewReport = () => {
    navigate('/report');
  };
  vapi.on('message', (message: string) => {
    setConversation((prev) => [...prev, message]);
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="shadow-sm p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isInterviewStarted && (
            <div className="text-green-600 font-semibold px-4 flex items-center space-x-2">
              <span>Interview in Progress</span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
          )}
        </div>
        
        {isInterviewStarted && (
          <button
            onClick={handleEndInterview}
            className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            <span>End Interview</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
  {!isInterviewStarted ? (
    // Start Interview Welcome Screen
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Your Technical Interview
        </h2>
        <p className="text-gray-600 mb-8">
          {storedData ? (
            `Hello ${storedData.resume.fullName}, we'll be focusing on your experience with ${storedData.resume.skills.join(', ')}. Click start when you're ready.`
          ) : (
            "Please submit your resume and generate technical questions to begin the interview."
          )}
        </p>
        <button
          onClick={startInterview}
          disabled={!storedData}
          className={`
            px-8 py-4 rounded-lg text-white text-lg font-semibold
            transition-all duration-300 flex items-center justify-center mx-auto space-x-3
            ${storedData 
              ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg' 
              : 'bg-gray-400 cursor-not-allowed'
            }
          `}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span>Start Interview</span>
        </button>
        {!storedData && (
          <p className="text-red-500 mt-4">
            Please complete your profile setup first
          </p>
        )}
      </div>
    </div>
  ) : (
    // Original Questions and IDE content
    <div className="flex-1 flex flex-col">
      <QuestionDisplay
        question={questions[currentQuestionIndex] || null}
        currentIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onNextQuestion={handleNextQuestion}
      />
      <div className="flex-1">
        <MultiLangIDE />
      </div>
    </div>
  )}

        {/* Right Side - Profile Cards */}
        <div className="w-72 bg-gray-50 border-l">
          {/* User Camera Card */}
          <div className="p-2">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex flex-col">
                {showWebcam ? (
                  <div className="aspect-video rounded-lg overflow-hidden mb-2">
                    <Webcam
                      audio={false}
                      className="w-full h-full object-cover"
                      mirrored={true}
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg mb-2 flex items-center justify-center bg-gray-100">
                    <InterviwerCrad
                      name={storedData?.resume.fullName || "User"} 
                      isActive={showWebcam}
                    />
                  </div>
                )}
                <div className="text-center">
                  <div className="font-medium">{storedData?.resume.fullName || "User"}</div>
                  <div className="text-sm text-gray-500">Candidate</div>
                  <label className="flex items-center mt-2 justify-center">
                    <input
                      type="checkbox"
                      checked={showWebcam}
                      onChange={(e) => setShowWebcam(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Camera</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Vapi Assistant Card */}
          <div className="p-2">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex flex-col">
                <div className="aspect-video rounded-lg mb-2 flex items-center justify-center bg-gray-100">
                  <div className="relative">
                    <InterviwerCrad
                      name="AI Interviwer" 
                      isActive={isInterviewStarted}
                    />
                    {isInterviewStarted && (
                      <span className="absolute bottom-0 right-0 h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">AI Interviwer</div>
                  <div className="text-sm text-gray-500">Interviewer</div>
                  <div className="text-sm text-green-500 mt-2">
                    {isInterviewStarted ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white shadow-sm p-2 flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <div className="w-32 bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        {isInterviewStarted && (
          <div className="text-green-600 flex items-center space-x-2">
            <span>Interview Active</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
        )}
      </div>
      {(isInterviewEnded || storedData?.isCompleted) && (
        <button
          onClick={handleViewReport}
          className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <span>View Report</span>
        </button>
      )}
    </div>
  );
}

export default VoiceAssistant;