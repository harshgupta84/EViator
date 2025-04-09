// components/InterviewReport.tsx
import ReactMarkdown from 'react-markdown';
import { FileText, Video, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CodeSubmission {
  language: string;
  code: string;
  questionIndex: number;
  timestamp: number;
}

interface Interview {
  candidateName: string;
  status: 'completed' | 'in-progress';
  questions: string[];
  codeSubmissions: CodeSubmission[];
  audioUrl?: string;
  videoUrl?: string;
  resume: {
    fullName: string;
    email: string;
    experience: string;
    education: string;
    skills: string[];
  };
  feedback: string[];
  totalDuration: number;
}

interface Props {
  interview: Interview;
}

export function InterviewReport({ interview }: Props) {
  const navigate = useNavigate();

  const generateReport = () => {
    return `
# Interview Report: ${interview.resume.fullName}

## Overview
- Status: ${interview.status}
- Questions Answered: ${interview.questions.length}
- Code Submissions: ${interview.codeSubmissions.length}
- Duration: ${Math.round(interview.totalDuration / 60000)} minutes

## Technical Assessment
${interview.questions.map((question, index) => `
### Question ${index + 1}
${question}

${interview.codeSubmissions[index] ? `Code Submission:
\`\`\`${interview.codeSubmissions[index].language}
${interview.codeSubmissions[index].code}
\`\`\`
` : 'No code submitted'}
`).join('\n')}

## Feedback
${interview.feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## Recordings
${interview.audioUrl ? '- Audio recording available for review' : '- No audio recording available'}
${interview.videoUrl ? '- Video recording available for review' : '- No video recording available'}
    `;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Interview Report</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Candidate Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Candidate Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{interview.resume.fullName}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{interview.resume.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Experience</p>
              <p className="font-medium">{interview.resume.experience}</p>
            </div>
            <div>
              <p className="text-gray-600">Skills</p>
              <p className="font-medium">{interview.resume.skills.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Interview Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600">Questions</div>
            <div className="text-2xl font-bold text-blue-600">
              {interview.questions.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600">Duration</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(interview.totalDuration / 60000)}min
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600">Code Submissions</div>
            <div className="text-2xl font-bold text-purple-600">
              {interview.codeSubmissions.length}
            </div>
          </div>
        </div>

        {/* Main Report Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 prose max-w-none">
          <ReactMarkdown>{generateReport()}</ReactMarkdown>

          {/* Recordings Section */}
          <div className="mt-6 space-y-4 not-prose">
            {interview.audioUrl && (
              <div>
                <h3 className="text-lg font-medium mb-2">Audio Recording</h3>
                <audio controls src={interview.audioUrl} className="w-full" />
              </div>
            )}

            {interview.videoUrl && (
              <div>
                <h3 className="text-lg font-medium mb-2">Video Recording</h3>
                <div className="relative">
                  <img
                    src={interview.videoUrl}
                    alt="Interview video screenshot"
                    className="w-full rounded-lg shadow"
                  />
                  <Video className="absolute top-4 right-4 w-8 h-8 text-white opacity-75" />
                </div>
              </div>
            )}
          </div>

          {/* Feedback Section */}
          {interview.feedback.length > 0 && (
            <div className="mt-6 not-prose">
              <h3 className="text-lg font-medium mb-2">Feedback Points</h3>
              <ul className="space-y-2">
                {interview.feedback.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-2">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}