import React, { useEffect, useState, useRef } from 'react';
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
  isProctoringActive?: boolean;
  violationCount?: number;
  terminationReason?: string;
}

function VoiceAssistant() {
  const [storedData, setStoredData] = useState<StoredData | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [isProctoringActive, setIsProctoringActive] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const violationCountRef = useRef(0); // Use ref to track violations
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

      // Restore proctoring state if it exists
      if (parsedData.isProctoringActive) {
        setIsProctoringActive(parsedData.isProctoringActive);
      }

      // Restore violation count if it exists
      if (parsedData.violationCount) {
        setViolationCount(parsedData.violationCount);
        violationCountRef.current = parsedData.violationCount;
      }
    }
  }, []);

  // Consolidated proctoring system
  // ==============================
  // Create a separate proctoring management system that organizes all proctoring functions
  const initializeProctoring = () => {
    // Reset violation counter
    violationCountRef.current = 0;
    setViolationCount(0);

    // 1. Setup fullscreen monitoring
    setupFullscreenMonitoring();

    // 2. Setup tab switching detection
    setupTabSwitchDetection();

    // 3. Setup window resize/minimize detection
    setupResizeDetection();

    // 4. Setup clipboard monitoring (previously unused)
    setupClipboardMonitoring();

    // 5. Setup multiple screens detection (previously unused)
    setupMultiScreenDetection();

    // 6. Setup page unload protection
    setupPageUnloadProtection();

    // Store proctoring state
    updateLocalStorage({
      isProctoringActive: true,
      violationCount: 0
    });

    // Log proctoring activation
    console.log("Proctoring system activated with comprehensive monitoring");
  };

  // Individual proctoring components
  const setupFullscreenMonitoring = () => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullScreen(isCurrentlyFullscreen);

      if (isProctoringActive && !document.fullscreenElement) {
        handleProctoringViolation("Exited full screen mode");
        // Don't auto-retry - ask user for permission
        setTimeout(() => {
          // Only show the dialog if still in proctoring mode
          if (isProctoringActive) {
            tryEnableFullScreen();
          }
        }, 500);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    // Initial fullscreen request with user confirmation
    tryEnableFullScreen();

    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  };

  const setupTabSwitchDetection = () => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleProctoringViolation("Tab switching detected");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  const setupResizeDetection = () => {
    const handleResize = () => {
      if (isProctoringActive && !document.fullscreenElement &&
        window.outerHeight < window.screen.height * 0.9) {
        handleProctoringViolation("Window minimizing detected");
      }

      // Also check for multiple screens when window is resized
      detectAdditionalScreens();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  const setupClipboardMonitoring = () => {
    const handleCopy = () => handleProctoringViolation("Copy action detected");
    const handlePaste = () => handleProctoringViolation("Paste action detected");

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  };

  const setupMultiScreenDetection = () => {
    // Initial check for multiple screens
    detectAdditionalScreens();

    // Set interval to periodically check for additional screens
    const intervalId = setInterval(detectAdditionalScreens, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  };

  const setupPageUnloadProtection = () => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProctoringActive) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  };

  // Main proctoring useEffect
  useEffect(() => {
    if (isProctoringActive) {
      // Initialize all proctoring systems and get their cleanup functions
      const cleanupFunctions = [
        setupFullscreenMonitoring(),
        setupTabSwitchDetection(),
        setupResizeDetection(),
        setupClipboardMonitoring(),
        setupMultiScreenDetection(),
        setupPageUnloadProtection()
      ];

      // Return a combined cleanup function
      return () => {
        cleanupFunctions.forEach(cleanupFn => cleanupFn && cleanupFn());

        // Exit full screen on unmount if we're still in it
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error(err));
        }
      };
    }
  }, [isProctoringActive]);

  // Enhanced fullscreen request with user confirmation
  const tryEnableFullScreen = async () => {
    // If already in fullscreen, no need to do anything
    if (document.fullscreenElement) {
      console.log("already in fullscreen")
      return;
    }

    // Show the modal instead of using confirm()
    setShowFullscreenModal(true);
  };

  // Add these handler functions
  const handleFullscreenAccept = async () => {
    try {
      const docElement = document.documentElement;

      // This will work because it's directly triggered by a user click
      if (docElement.requestFullscreen) {
        await docElement.requestFullscreen();
        setIsFullScreen(true);
        console.log("isFullScreen", isFullScreen)
      }
    } catch (err) {
      console.error("Error enabling full-screen mode:", err);
    } finally {
      setShowFullscreenModal(false);
    }
  };

  const handleFullscreenDecline = () => {
    handleEndInterview();
  };

  // Enhanced multiple screens detection
  const detectAdditionalScreens = () => {
    // Check if screen width significantly exceeds window width (indicating multiple monitors)
    if (window.screen && window.screen.availWidth > window.innerWidth * 1.5) {
      handleProctoringViolation("Multiple monitors detected");
      return true;
    }

    // Check for suspicious screen dimensions
    if (window.screen.width !== window.outerWidth ||
      window.screen.height !== window.outerHeight) {
      // Additional check to reduce false positives
      const sizeDifference = Math.abs(
        (window.screen.width * window.screen.height) -
        (window.outerWidth * window.outerHeight)
      );

      // If the difference is significant (more than 20% of screen area)
      if (sizeDifference > (window.screen.width * window.screen.height * 0.2)) {
        handleProctoringViolation("Suspicious screen configuration detected");
        return true;
      }
    }

    return false;
  };

  // Force end interview without confirmation (for violation limit)
  // const handleForceEndInterview = async () => {
  //   if (!isInterviewStarted) return;

  //   // Stop the voice assistant
  //   vapi.stop();

  //   try {
  //     const interviewSummary = {
  //       duration: Date.now() - (storedData?.timestamp || Date.now()),
  //       questionsCompleted: currentQuestionIndex + 1,
  //       totalQuestions: questions.length,
  //       code: currentCode,
  //       feedback: feedback,
  //       conversation: conversation,
  //       terminationReason: "Proctoring violations exceeded limit"
  //     };

  //     updateLocalStorage({
  //       ...interviewSummary,
  //       isCompleted: true,
  //       isProctoringActive: false,
  //       violationCount: violationCountRef.current
  //     });

  //     setIsInterviewStarted(false);
  //     setIsInterviewEnded(true);
  //     setIsProctoringActive(false);

  //     // Exit full screen mode
  //     if (document.fullscreenElement) {
  //       document.exitFullscreen().catch(err => console.error(err));
  //     }

  //     alert(
  //       `Interview terminated due to excessive proctoring violations.

  //       Your session has been ended and your progress has been saved.
  //       `
  //     );

  //   } catch (error) {
  //     console.error("Error ending interview:", error);
  //   }
  // };

  // Handle proctoring violations
  const handleProctoringViolation = (violationType: string) => {
    console.log("violationType", violationType)
    // Use ref to prevent race conditions with multiple rapid violations
    violationCountRef.current += 1;
    // Also update state for UI rendering
    setViolationCount(violationCountRef.current);

    // Store the violation in localStorage to persist it
    updateLocalStorage({
      violationCount: violationCountRef.current,
      isProctoringActive: true
    });

    const violationsLeft = 3 - violationCountRef.current;

    console.log("violationCountRef.current in hproct", violationCountRef.current)
    if (violationCountRef.current <= 3) {
      console.log(`Proctoring violation detected: ${violationType}. Warning ${violationCountRef.current}/3. Violations left: ${violationsLeft}`);
    } else if (violationCountRef.current > 3) {
      console.log(`Final proctoring violation detected: ${violationType}. Maximum violations (3/3) reached. The interview will now end.`);
      handleEndInterview();
    }
  };

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
      // Reset violation counters
      setViolationCount(0);
      violationCountRef.current = 0;

      // Start proctoring using the consolidated system
      setIsProctoringActive(true);
      initializeProctoring();

      // No alert for proctoring start, just console log
      console.log("Proctoring has started. User cannot switch tabs, minimize window, or exit full-screen mode.");

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
      setIsProctoringActive(false);
    }
  };

  const handleEndInterview = async () => {
    setShowFullscreenModal(false);
    if (!isInterviewStarted) return;
    vapi.stop();

    // Only show confirmation dialog if not triggered by violation or user canceled fullscreen
    if (violationCountRef.current < 3) {
      const confirmEnd = window.confirm(
        "Are you sure you want to end the interview? This action cannot be undone."
      );
      if (!confirmEnd) return;
    }

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
        isCompleted: true,
        isProctoringActive: false,
        violationCount: violationCountRef.current
      });
      
      setIsInterviewStarted(false);
      setIsInterviewEnded(true);
      setIsProctoringActive(false);
      console.log("meeting ended");

      // Reset violation count
      // setViolationCount(0);
      // violationCountRef.current = 0;

      // Exit full screen mode
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error(err));
      }

      console.log("violationCountRef.current in hei", violationCountRef.current)
      // Only show completion alert if not ended due to violations
      if (violationCountRef.current < 3) {
        alert(
          `Interview completed successfully!
          
          Summary:
          - Duration: ${Math.round(interviewSummary.duration / 60000)} minutes
          - Questions Completed: ${interviewSummary.questionsCompleted}/${interviewSummary.totalQuestions}
          
          Your responses have been saved.
        `);
      }
      else {
        alert(
          `Interview terminated due to excessive proctoring violations.
          
          Your session has been ended and your progress has been saved.
          `
        );
      }
      // Reset violation count
      setViolationCount(0);
      violationCountRef.current = 0;
    } catch (error) {
      console.error("Error ending interview:", error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      alert('You have reached the end of the questions.');
    }
  };

  // const handleCodeChange = (value: string | undefined) => {
  //   const newCode = value || '';
  //   setCurrentCode(newCode);
  //   updateLocalStorage({ code: newCode });
  // };

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
          {isProctoringActive && (
            <div className="text-red-600 font-semibold px-4 flex items-center space-x-2">
              <span>Proctoring Active</span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
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
        {isProctoringActive && (
          <div className="text-red-600 flex items-center space-x-2">
            <span>Proctoring Active</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>
        )}
        {violationCount > 0 && (
          <div className="text-yellow-600 flex items-center space-x-2">
            <span>Violations: {violationCount}/3</span>
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
      {showFullscreenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fullscreen Required</h3>
            <p className="mb-6 text-gray-600">
              This interview requires full-screen mode for proctoring purposes.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleFullscreenDecline}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                End Interview
              </button>
              <button
                onClick={handleFullscreenAccept}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Enter Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceAssistant;