import React, { useState, useEffect, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import Editor from '@monaco-editor/react';
import Webcam from 'react-webcam';
import { Mic, MicOff, Play, Square, Video, VideoOff } from 'lucide-react';
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
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const webcamRef = useRef<Webcam>(null);
  
  const { status: audioStatus, startRecording: startAudioRecording, stopRecording: stopAudioRecording, mediaBlobUrl: audioBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: (audioUrl) => {
      const videoUrl = isVideoEnabled ? webcamRef.current?.getScreenshot() : undefined;
      onComplete({
        ...interview,
        audioUrl: audioUrl,
        videoUrl: videoUrl,
        status: 'completed'
      });
    }
  });

  const currentQuestion = interview.questions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuestionIndex === 0) {
      startAudioRecording();
    }
  }, []);

  const handleNext = () => {
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

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Interview with {interview.candidateName}
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleVideo}
            className="p-2 rounded-full hover:bg-gray-100"
            title={isVideoEnabled ? 'Disable video' : 'Enable video'}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 text-green-600" />
            ) : (
              <VideoOff className="w-6 h-6 text-gray-400" />
            )}
          </button>
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

      {isVideoEnabled && (
        <div className="mb-6">
          <Webcam
            ref={webcamRef}
            audio={false}
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}

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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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