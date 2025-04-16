// Sample interview data for demo/testing purposes
import { StoredData,AIFeedback } from "../types/interviewTypes";

// Generate sample data when no real data exists
export const generateSampleData = (): StoredData => {
  return {
    resume: {
      fullName: "John Doe",
      email: "john.doe@example.com",
      experience: "5 years experience as a Full Stack Developer at Tech Innovations Inc. Led development of multiple web applications using React, Node.js, and AWS.",
      education: "Bachelor of Science in Computer Science, University of Technology, 2018",
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "AWS", "MongoDB", "GraphQL", "Docker"]
    },
    technicalQuestions: [
      {
        Question: "Explain how React's virtual DOM works and its advantages.",
        TestCase: "",
        Output: "The candidate explained that React's virtual DOM is an in-memory representation of the actual DOM. When state changes occur, React creates a new virtual DOM tree, compares it with the previous one (diffing), and updates only the necessary parts of the actual DOM. This approach minimizes direct DOM manipulation, resulting in better performance for complex UIs. The candidate demonstrated good understanding of React's core concepts."
      },
      {
        Question: "Write a function to find the first non-repeating character in a string.",
        TestCase: "Input: 'programming'",
        Output: "The candidate provided a solution using a Map to track character counts, then found the first character with a count of 1. Their solution had O(n) time complexity. Code was well-structured with good variable naming and comments."
      },
      {
        Question: "Explain the difference between HTTP and WebSockets.",
        TestCase: "",
        Output: "The candidate explained that HTTP is a request-response protocol where the client initiates all communication and the connection closes after each response. WebSockets provide persistent, bi-directional communication channels, allowing both client and server to send messages anytime. They discussed appropriate use cases for each, showing good understanding of web communication protocols."
      }
    ],
    feedback: [
      "Strong technical knowledge in frontend technologies",
      "Communicated clearly and effectively throughout the interview",
      "Good problem-solving approach, explaining thought process before implementation",
      "Could improve knowledge of system design concepts"
    ],
    code: `function findFirstNonRepeatingChar(str) {
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
}

// Test with example
console.log(findFirstNonRepeatingChar('programming')); // Output: 'p'`,
    timestamp: Date.now() - 86400000, // Yesterday
    isCompleted: true,
    conversation: [
      "Interviewer: Hello John, welcome to the technical interview. How are you today?",
      "Candidate: Hi, I'm doing well, thank you. I'm excited for this opportunity.",
      "Interviewer: Great! Let's start with some basic questions about your experience with React.",
      "Candidate: Sounds good, I've been working with React for about 4 years now.",
      "Interviewer: Can you explain how React's virtual DOM works and its advantages?",
      "Candidate: Sure! React's virtual DOM is an in-memory representation of the actual DOM...",
      "Interviewer: Excellent explanation. Now let's move on to a coding problem...",
    ],
    duration: 45 * 60 * 1000 // 45 minutes in milliseconds
  };
};

// Sample AI feedback when no real feedback exists
export const generateSampleAIFeedback = (): AIFeedback => {
  return {
    evaluationPoints: [
      {
        category: "Technical Knowledge",
        score: 8,
        comment: "Demonstrated solid understanding of React, JavaScript, and web protocols with clear explanations."
      },
      {
        category: "Problem Solving",
        score: 7,
        comment: "Approached problems methodically with good optimization considerations."
      },
      {
        category: "Communication",
        score: 9,
        comment: "Articulated concepts clearly with excellent technical vocabulary and coherent explanations."
      },
      {
        category: "Overall Attitude",
        score: 8,
        comment: "Showed enthusiasm, professionalism, and genuine interest in technical discussions."
      }
    ],
    overallFeedback: "John demonstrated strong technical aptitude, particularly in frontend technologies. His communication skills are excellent, explaining complex concepts with clarity. Could benefit from more exposure to system design concepts. Overall, a strong candidate who would likely be a valuable addition to a development team.",
    totalScore: 80
  };
}; 