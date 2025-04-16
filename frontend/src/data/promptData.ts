/**
 * Predefined prompts for AI interactions
 */

/**
 * Generate a starting text for an interview based on candidate skills
 */
export const getStartingTextPrompt = (skills: string[]): string => {
  return `Generate a starting text for an interview based on the candidate's skills: ${skills.join(', ')}.
  
  The text should:
  - Be professional and welcoming
  - Mention specific skills the candidate has
  - Set expectations for the interview
  - Be around 3-4 sentences in length
  - End with a question to engage the candidate
  
  Example format:
  "Welcome to your technical interview. I see you have experience with [specific skills]. Today, we'll be discussing these areas, along with some general programming concepts. Let's begin by talking about your experience with [one of their key skills]."`;
};

/**
 * Generate technical questions based on candidate skills
 */
export const getTechnicalQuestionsPrompt = (skills: string[]): string => {
  return `As a technical interviewer, generate 4 programming questions based on the candidate's skills: ${skills.join(', ')}. 

  Format each question exactly as follows:

  {
    "questions": [
      {
        "Question": "<clear problem statement>",
        "TestCase": "<specific input format and example>",
        "Output": "<expected output for the test case>"
      }
    ]
  }

  Requirements for questions:
  1. First question should be Easy (array/string manipulation)
  2. Second question should be Medium (data structures: trees/linked lists/stacks)
  3. Third question should be Medium-Hard (algorithms: dynamic programming/graphs)
  4. Fourth question should be System Design or Advanced Concept based on candidate's skills

  Guidelines:
  - Questions should be clear and concise
  - Test cases should be specific with exact input format
  - Expected output should match the test case
  - Questions should progressively increase in difficulty
  - Include relevant skills from: ${skills.join(', ')}
  - Each question should test different aspects of programming

  Return only valid JSON with 4 questions following this exact structure.`;
};

/**
 * Generate feedback based on interview data
 */
export const getInterviewFeedbackPrompt = (
  candidateName: string,
  skills: string[],
  experience: string,
  education: string,
  questions: { Question: string }[],
  code: string,
  conversation: string[] = []
): string => {
  return `
  You are a technical interviewer. Review this complete interview data and provide feedback:
  
  CANDIDATE INFORMATION:
  Name: ${candidateName}
  Skills: ${skills.join(", ")}
  Experience: ${experience}
  Education: ${education}
  
  TECHNICAL ASSESSMENT:
  Questions Asked: ${questions
    .map((q, i) => `\nQ${i + 1}: ${q.Question}`)
    .join("")}
  
  CODE SUBMISSION:
  ${code}
  
  INTERVIEW CONVERSATION:
  ${conversation.join("\n")}
  
  Based on this complete interview, provide feedback in this exact JSON format:
  
  {
    "evaluationPoints": [
      {
        "category": "Technical Knowledge",
        "score": <1-10>,
        "comment": "<one-line evaluation based on technical responses and code>"
      },
      {
        "category": "Problem Solving",
        "score": <1-10>,
        "comment": "<one-line evaluation of approach and solutions>"
      },
      {
        "category": "Communication",
        "score": <1-10>,
        "comment": "<one-line evaluation of articulation and clarity>"
      },
      {
        "category": "Overall Attitude",
        "score": <1-10>,
        "comment": "<one-line evaluation of professionalism and enthusiasm>"
      }
    ],
    "overallFeedback": "<3-4 sentences summarizing performance, strengths, and improvement areas>",
    "totalScore": <0-100>
  }`;
}; 