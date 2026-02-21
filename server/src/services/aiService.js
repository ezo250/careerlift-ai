// AI Service for grading documents
// This will be called from the frontend using Puter.js directly
// Backend provides the checklist and job description context

export const prepareGradingContext = (checklist, jobDescription, documentText) => {
  const criteriaText = checklist.criteria.map(c => 
    `${c.name} (${c.weight}%): ${c.description}`
  ).join('\n');

  return {
    systemPrompt: `You are an expert career counselor and resume reviewer. Grade the following document based on these criteria:

${criteriaText}

Job Description:
${jobDescription}

Provide detailed feedback for each criterion with:
1. Score (0-${checklist.criteria.reduce((sum, c) => sum + c.weight, 0)})
2. Percentage
3. Specific feedback
4. Actionable suggestions for improvement

Format your response as JSON with this structure:
{
  "grades": [
    {
      "criterionId": "string",
      "criterionName": "string",
      "score": number,
      "maxScore": number,
      "percentage": number,
      "feedback": "string",
      "suggestions": ["string"]
    }
  ],
  "overallScore": number,
  "aiFeedback": "string"
}`,
    documentText
  };
};

export const calculateOverallScore = (grades) => {
  const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
  const maxScore = grades.reduce((sum, g) => sum + g.maxScore, 0);
  return Math.round((totalScore / maxScore) * 100);
};
