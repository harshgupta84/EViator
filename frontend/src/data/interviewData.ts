import { Question, Resume, StoredData } from '../types';

/**
 * Default technical questions to use as fallback when API fails
 */
export const defaultQuestions: Question[] = [
  {
    Question: 'Sort the array using the quick sort algorithm',
    TestCase: 'Input: [3, 1, 4, 1, 5]',
    Output: '[1, 1, 3, 4, 5]'
  },
  {
    Question: 'Find the longest common prefix in an array of strings',
    TestCase: 'Input: ["flower", "flow", "flight"]',
    Output: '"fl"'
  },
  {
    Question: 'Implement a binary search algorithm',
    TestCase: 'Input: [1, 2, 3, 4, 5], Target: 3',
    Output: 'Index 2'
  },
  {
    Question: 'Design a rate limiter for an API',
    TestCase: 'Input: maxRequests = 3, timeWindow = 1s',
    Output: 'Boolean response indicating if request is allowed'
  }
];

/**
 * Sample resume data for testing
 */
export const sampleResume: Resume = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  experience: '5 years experience as a Full Stack Developer at Tech Innovations Inc. Led development of multiple web applications using React, Node.js, and AWS.',
  education: 'Bachelor of Science in Computer Science, University of Technology, 2018',
  skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'GraphQL', 'Docker']
};

/**
 * Sample code submission for interview tests
 */
export const sampleCodeSubmission = `function findFirstNonRepeatingChar(str) {
  if (!str || str.length === 0) {
    return null;
  }
  
  const charMap = new Map();
  
  // Count occurrences of each character
  for (const char of str) {
    charMap.set(char, (charMap.get(char) || 0) + 1);
  }
  
  // Find first character with count of 1
  for (const char of str) {
    if (charMap.get(char) === 1) {
      return char;
    }
  }
  
  // No non-repeating character found
  return null;
}`;

/**
 * Sample interview conversation
 */
export const sampleConversation = [
  "Interviewer: Hello, welcome to the technical interview. How are you today?",
  "Candidate: Hi, I'm doing well, thank you. I'm excited for this opportunity.",
  "Interviewer: Great! Let's start with some basic questions about your experience with React.",
  "Candidate: Sounds good, I've been working with React for about 4 years now.",
  "Interviewer: Can you explain how React's virtual DOM works and its advantages?",
  "Candidate: Sure! React's virtual DOM is an in-memory representation of the actual DOM...",
  "Interviewer: Excellent explanation. Now let's move on to a coding problem..."
];

/**
 * Generate sample stored data for testing the interview system
 */
export const generateSampleStoredData = (): StoredData => {
  return {
    resume: sampleResume,
    startingText: `Starting the interview with ${sampleResume.fullName} who has experience in: ${sampleResume.skills.join(', ')}`,
    technicalQuestions: defaultQuestions,
    timestamp: Date.now()
  };
};

/**
 * Storage key for localStorage
 */
export const STORAGE_KEY = 'interview_data'; 