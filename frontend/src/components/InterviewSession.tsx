import React, { useState, useEffect, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import Editor from '@monaco-editor/react';
import Webcam from 'react-webcam';
import { Mic, MicOff, Play, Square, AlertCircle, Camera } from 'lucide-react';
import type { Interview, InterviewQuestion, ProgrammingLanguage } from '../types';

interface Props {
  interview: Interview;
  onComplete: (interview: Interview) => void;
}

const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
  { id: 'typescript', name: 'TypeScript', extension: '.ts', language: 'typescript' },
  { id: 'javascript', name: 'JavaScript', extension: '.js', language: 'javascript' },
  { id: 'python', name: 'Python', extension: '.py', language: 'python' },
  { id: 'java', name: 'Java', extension: '.java', language: 'java' },
  { id: 'cpp', name: 'C++', extension: '.cpp', language: 'cpp' },
  { id: 'csharp', name: 'C#', extension: '.cs', language: 'csharp' },
];

export function InterviewSession({ interview, onComplete }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>(PROGRAMMING_LANGUAGES[0]);
  const webcamRef = useRef<Webcam>(null);
  const [cameraError, setCameraError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  const { status: audioStatus, startRecording: startAudioRecording, stopRecording: stopAudioRecording, mediaBlobUrl: audioBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: (audioUrl) => {
      if (!cameraError && cameraActive) {
        const screenshot = webcamRef.current?.getScreenshot();
        const videoUrl = screenshot || undefined;
        onComplete({
          ...interview,
          audioUrl: audioUrl,
          videoUrl: videoUrl,
          status: 'completed'
        });
      } else {
        alert('Camera must be active to complete the interview. Please enable your camera.');
      }
    }
  });

  const currentQuestion = interview.questions[currentQuestionIndex];

  useEffect(() => {
    // Check if camera is accessible when component mounts
    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Clean up the stream after checking
        stream.getTracks().forEach(track => track.stop());
        setCameraError(false);
      } catch (err) {
        console.error('Camera access denied or not available:', err);
        setCameraError(true);
      }
    };
    
    checkCameraAccess();
    
    if (currentQuestionIndex === 0) {
      startAudioRecording();
    }
  }, []);

  const handleCameraError = () => {
    setCameraError(true);
    setCameraActive(false);
  };
  
  const handleUserMedia = () => {
    setCameraError(false);
    setCameraActive(true);
  };

  const handleNext = () => {
    // Block progression if camera isn't available or active
    if (cameraError || !cameraActive) {
      alert('Camera must be active to proceed. Please enable your camera.');
      return;
    }
    
    if (currentQuestion.type === 'coding') {
      interview.codeSubmissions.push({
        questionId: currentQuestion.id,
        code,
        language: selectedLanguage.language,
        timestamp: Date.now()
      });
    }

    if (currentQuestionIndex === interview.questions.length - 1) {
      stopAudioRecording();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCode('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Interview with {interview.candidateName}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Camera className={`w-5 h-5 ${cameraActive ? 'text-green-600' : 'text-red-600 animate-pulse'}`} />
            <span className={`text-sm ${cameraActive ? 'text-green-600' : 'text-red-600'}`}>
              {cameraActive ? 'Camera On' : 'Camera Required'}
            </span>
          </div>
          {audioStatus === 'recording' ? (
            <Mic className="w-6 h-6 text-red-600 animate-pulse" />
          ) : (
            <MicOff className="w-6 h-6 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {interview.questions.length}
          </span>
        </div>
      </div>

      <div className="mb-6">
        {cameraError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Camera Required</h3>
              <p className="text-red-700">
                This interview requires camera access. Please enable your camera and refresh the page to continue.
              </p>
            </div>
          </div>
        ) : !cameraActive ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Camera Inactive</h3>
              <p className="text-yellow-700">
                Your camera appears to be inactive. The camera must remain on throughout the entire interview. 
                Please reactivate your camera to continue.
              </p>
            </div>
          </div>
        ) : null}
        
        <Webcam
          ref={webcamRef}
          audio={false}
          className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          onUserMediaError={handleCameraError}
          onUserMedia={handleUserMedia}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {currentQuestion.question}
        </h3>

        {currentQuestion.type === 'coding' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming Language
              </label>
              <select
                value={selectedLanguage.id}
                onChange={(e) => setSelectedLanguage(
                  PROGRAMMING_LANGUAGES.find(lang => lang.id === e.target.value) || PROGRAMMING_LANGUAGES[0]
                )}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {PROGRAMMING_LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-[400px] border rounded-lg overflow-hidden">
              <Editor
                height="100%"
                language={selectedLanguage.language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleNext}
          disabled={cameraError || !cameraActive}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            cameraError || !cameraActive
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {currentQuestionIndex === interview.questions.length - 1 ? (
            <>
              <Square className="w-4 h-4" />
              Complete Interview
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Next Question
            </>
          )}
        </button>
      </div>
    </div>
  );
}