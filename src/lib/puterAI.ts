declare global {
  interface Window {
    puter: any;
  }
}

export interface GradeResult {
  grades: Array<{
    criterionId: string;
    criterionName: string;
    score: number;
    maxScore: number;
    percentage: number;
    feedback: string;
    suggestions: string[];
  }>;
  overallScore: number;
  aiFeedback: string;
}

export const gradeDocument = async (
  documentText: string,
  checklist: any,
  jobDescription: string
): Promise<GradeResult> => {
  if (!window.puter) {
    throw new Error('Puter AI not loaded');
  }

  const criteriaText = checklist.criteria.map((c: any) => 
    `- ${c.name} (Weight: ${c.weight}%): ${c.description}`
  ).join('\n');

  const prompt = `You are an expert career counselor and resume reviewer. Analyze the following document and provide detailed grading.

GRADING CRITERIA:
${criteriaText}

JOB DESCRIPTION:
${jobDescription}

DOCUMENT TO GRADE:
${documentText}

Provide a detailed analysis for each criterion with:
1. A score out of the weight percentage
2. Specific feedback on what was done well and what needs improvement
3. Actionable suggestions for improvement

Respond ONLY with valid JSON in this exact format:
{
  "grades": [
    {
      "criterionName": "Formatting & Layout",
      "score": 15,
      "maxScore": 20,
      "feedback": "Detailed feedback here",
      "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
    }
  ],
  "aiFeedback": "Overall summary of the document quality and main areas for improvement"
}`;

  try {
    const response = await window.puter.ai.chat(prompt, {
      model: 'gpt-5-nano',
      temperature: 0.3,
      max_tokens: 2000
    });

    // Parse the AI response
    let parsedResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(response);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', response);
      throw new Error('Invalid AI response format');
    }

    // Map the response to include criterion IDs and calculate percentages
    const grades = parsedResponse.grades.map((grade: any, index: number) => {
      const criterion = checklist.criteria[index];
      const percentage = Math.round((grade.score / grade.maxScore) * 100);
      
      return {
        criterionId: criterion._id || criterion.id,
        criterionName: grade.criterionName,
        score: grade.score,
        maxScore: grade.maxScore,
        percentage,
        feedback: grade.feedback,
        suggestions: grade.suggestions || []
      };
    });

    // Calculate overall score
    const totalScore = grades.reduce((sum: number, g: any) => sum + g.score, 0);
    const maxScore = grades.reduce((sum: number, g: any) => sum + g.maxScore, 0);
    const overallScore = Math.round((totalScore / maxScore) * 100);

    return {
      grades,
      overallScore,
      aiFeedback: parsedResponse.aiFeedback
    };
  } catch (error) {
    console.error('AI grading error:', error);
    throw error;
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // For demo purposes, we'll use the file content directly
      // In production, you'd want to use a proper PDF/DOCX parser
      resolve(text || `[File: ${file.name}]\nContent extraction would happen here in production.`);
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      // For PDF/DOCX, we'll create a placeholder
      // In production, use libraries like pdf.js or mammoth.js
      resolve(`[${file.name}]\n\nThis is a ${file.type} file. In production, the actual content would be extracted here using appropriate libraries.`);
    }
  });
};
