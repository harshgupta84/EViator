import React, { useEffect, useState } from 'react';
import Vapi from '@vapi-ai/web';
import Editor from '@monaco-editor/react';
import Webcam from 'react-webcam';
import ReactMarkdown from 'react-markdown';
import MultiLangIDE from './MultiLangIDE';
import InterviwerCrad from './InterviwerCard';

interface Resume {
  fullName: string;
  email: string;
  experience: string;
  education: string;
  skills: string[];
}

interface StoredData {
  resume: Resume;
  startingText: string;
  technicalQuestions: string;
  feedback: string[];
  code: string;
  timestamp: number;
}



function VoiceAssistant() {
  const [storedData, setStoredData] = useState<StoredData | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>('// Write your code here');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [showWebcam, setShowWebcam] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isVapiSpeaking, setIsVapiSpeaking] = useState(false);

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
      setQuestions(parsedData.technicalQuestions.split('\n\n')); // Assuming questions are separated by double newlines
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
  
    const vapi = new Vapi("89d9dcde-d231-405e-888b-634fb4c6ed91");
    
    try {
      // Format questions for better AI consumption
      const formattedQuestions = questions.map((q, index) => `Q${index + 1}: ${q}`).join('\n');
      
      vapi.start("826b814e-4b2c-4707-ab5f-c8c73a3bde28", {
        variableValues:{
          candidateName: storedData.resume.fullName,
          candidateEmail: storedData.resume.email,
          candidateExperience: storedData.resume.experience,
          candidateEducation: storedData.resume.education,
          candidateSkills: storedData.resume.skills.join(', '),
          candidateCode: storedData.code,
          technicalQuestions: formattedQuestions,
        },
        firstMessage: generateInitialMessage(storedData),
        endCallPhrases: ["thank you", "end up the interview", "stop"],
        endCallMessage: "Thank you for your time! I will now process your responses and provide feedback.",
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 1800, // 30 minutes
        backgroundSound: "off",
        
        messagePlan: {
          idleTimeoutSeconds: 10,
          silenceTimeoutMessage: "Are you still there? Should we continue with the interview?"
        },
        stopSpeakingPlan: {
          numWords: 3,
          voiceSeconds: 0.2,
          backoffSeconds: 1,
          acknowledgementPhrases: [
            "i understand", "i see", "i got it", "okay", "got it", "understood"
          ],
          interruptionPhrases: [
            "stop", "wait", "hold on", "let me think"
          ]
        },
      });
  
      setIsInterviewStarted(true);
  
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start interview. Please try again.");
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

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className=" shadow-sm p-2 flex items-center">
        {!isInterviewStarted ? (
          <button
            onClick={startInterview}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Interview
          </button>
        ) : (
          <div className="text-green-600 font-semibold px-4 flex items-center space-x-2">
            <span>Interview in Progress</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        )}
      </div>
  
      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Side - Questions and IDE */}
        <div className="flex-1 flex flex-col">
          {/* Question Display */}
          <div className="bg-white shadow-sm">
            <div className="flex justify-between items-center p-2">
              <h3 className="font-semibold">Current Question:</h3>
              <button
                onClick={handleNextQuestion}
                className="bg-blue-500 text-white py-1.5 px-4 rounded text-sm hover:bg-blue-600"
              >
                Next Question
              </button>
            </div>
            <div className="p-3">
              <ReactMarkdown>
                {questions[currentQuestionIndex] || "No questions available."}
              </ReactMarkdown>
            </div>
          </div>
  
          {/* IDE */}
          <div className="flex-1">
            <MultiLangIDE />
          </div>
        </div>
  
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
                      name="Vapi Assistant" 
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
                  <div className="font-medium">Vapi Assistant</div>
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
    </div>
  );
}

export default VoiceAssistant;