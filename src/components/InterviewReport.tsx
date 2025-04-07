import ReactMarkdown from 'react-markdown';
import { FileText, Video } from 'lucide-react';
import type { Interview } from '../types';

interface Props {
  interview: Interview;
}

export function InterviewReport({ interview }: Props) {
  const generateReport = () => {
    return `
# Interview Report: ${interview.candidateName}

## Overview
- Status: ${interview.status}
- Questions Answered: ${interview.questions.length}
- Code Submissions: ${interview.codeSubmissions.length}

## Code Submissions

${interview.codeSubmissions.map((submission, index) => `
### Question ${index + 1}
\`\`\`${submission.language}
${submission.code}
\`\`\`
`).join('\n')}

## Recordings
${interview.audioUrl ? '- Audio recording available for review' : '- No audio recording available'}
${interview.videoUrl ? '- Video recording available for review' : '- No video recording available'}
    `;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Interview Report</h2>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 prose max-w-none">
        <ReactMarkdown>{generateReport()}</ReactMarkdown>

        <div className="mt-6 space-y-4">
          {interview.audioUrl && (
            <div>
              <h3 className="text-lg font-medium mb-2">Audio Recording</h3>
              <audio controls src={interview.audioUrl} className="w-full" />
            </div>
          )}

          {interview.videoUrl && (
            <div>
              <h3 className="text-lg font-medium mb-2">Video Screenshot</h3>
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
      </div>
    </div>
  );
}