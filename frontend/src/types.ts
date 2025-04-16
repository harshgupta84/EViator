export interface Resume {
  fullName: string;
  email: string;
  experience: string;
  education: string;
  skills: string[];
}

export interface Interview {
  candidateName: string;
  status: 'completed' | 'in-progress';
  questions: InterviewQuestion[];
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

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'verbal' | 'coding';
  expectedDuration: number;
}

export interface CodeSubmission {
  questionId: string;
  code: string;
  language: string;
  timestamp: number;
}

export type ProgrammingLanguage = {
  id: string;
  name: string;
  extension: string;
  language: string;
};

// Added interfaces for the resume upload component
export interface Question {
  Question: string;
  TestCase: string;
  Output: string;
}

export interface StoredData {
  resume: Resume;
  startingText: string;
  technicalQuestions: Question[];
  timestamp: number;
  isCompleted?: boolean;
  conversation?: string[];
  feedback?: string[];
  code?: string;
  duration?: number;
}