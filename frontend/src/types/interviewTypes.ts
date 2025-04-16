export interface Resume {
  fullName: string;
  email: string;
  experience: string;
  education: string;
  skills: string[];
}

export interface Question {
  Question: string;
  TestCase: string;
  Output: string;
}

export interface StoredData {
  resume: Resume;
  technicalQuestions: Question[];
  feedback: string[];
  code: string;
  timestamp: number;
  isCompleted?: boolean;
  conversation?: string[];
  duration?: number;
}

export interface FeedbackPoint {
  category: string;
  score: number;
  comment: string;
}

export interface AIFeedback {
  evaluationPoints: FeedbackPoint[];
  overallFeedback: string;
  totalScore: number;
} 