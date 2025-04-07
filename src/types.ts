export interface Resume {
  fullName: string;
  email: string;
  experience: string;
  education: string;
  skills: string[];
}

export interface Interview {
  id: string;
  candidateName: string;
  questions: InterviewQuestion[];
  audioUrl?: string;
  videoUrl?: string;
  codeSubmissions: CodeSubmission[];
  status: 'pending' | 'in-progress' | 'completed';
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