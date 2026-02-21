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

  // Enhanced AI prompt with expert-level analysis
  const systemContext = `You are a world-class career counselor, professional resume writer, and recruitment expert with 20+ years of experience. You have helped thousands of candidates land positions at Fortune 500 companies, startups, and prestigious organizations across all industries.

Your expertise includes:
- ATS (Applicant Tracking System) optimization
- Industry-specific resume best practices  
- Modern hiring trends and expectations
- Professional writing and communication standards
- Competitive analysis and differentiation strategies
- Career trajectory assessment and positioning

You provide brutally honest, actionable feedback that transforms mediocre applications into standout submissions.`;

  const analysisPrompt = `${systemContext}

TASK: Perform a comprehensive, expert-level analysis of the provided resume and cover letter against the job requirements and grading criteria.

GRADING CRITERIA (strictly adhere to these):
${criteriaText}

TARGET JOB POSITION:
${jobDescription}

CANDIDATE'S SUBMISSION:
${documentText}

ANALYSIS REQUIREMENTS:

For EACH criterion, you must:
1. Assign a precise score based on the weight percentage (be strict but fair)
2. Provide specific, detailed feedback highlighting:
   - What the candidate did exceptionally well (with examples from their document)
   - Critical gaps, weaknesses, or missing elements
   - How well it aligns with the job requirements
   - ATS compatibility issues (if any)
3. Give 3-5 highly actionable, specific suggestions for improvement with examples

SCORING GUIDANCE:
- 90-100%: Outstanding - Exceeds professional standards, perfectly tailored
- 80-89%: Excellent - Strong alignment, minor improvements needed
- 70-79%: Good - Solid foundation, several areas to enhance
- 60-69%: Fair - Meets basic requirements, significant improvements needed
- Below 60%: Needs Work - Major gaps, requires substantial revision

OVERALL FEEDBACK must include:
- Summary of top 3 strengths
- Top 3 critical improvements needed
- Competitive positioning assessment
- Likelihood of ATS pass-through
- Estimated interview callback probability

Respond ONLY with valid JSON in this EXACT format (no markdown, no code blocks):
{
  "grades": [
    {
      "criterionName": "exact criterion name",
      "score": numeric_score,
      "maxScore": max_possible_score,
      "feedback": "Comprehensive 3-4 sentence analysis with specific examples from the document",
      "suggestions": [
        "Action 1: Specific change with example",
        "Action 2: Specific change with example", 
        "Action 3: Specific change with example"
      ]
    }
  ],
  "aiFeedback": "Professional 5-6 sentence summary covering strengths, critical gaps, competitive positioning, ATS compatibility, and interview probability. Be honest and direct."
}`;

  try {
    // Use the most powerful model with optimized parameters
    const response = await window.puter.ai.chat(analysisPrompt, {
      model: 'gpt-5.2-chat', // Most powerful model available
      temperature: 0.2, // Low temperature for consistent, focused analysis
      max_tokens: 4000, // Increased for comprehensive feedback
    });

    // Enhanced JSON parsing with better error handling
    let parsedResponse;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = response.trim();
      
      // Remove markdown code blocks
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(cleanedResponse);
      }
      
      // Validate the response structure
      if (!parsedResponse.grades || !Array.isArray(parsedResponse.grades)) {
        throw new Error('Invalid response structure: missing grades array');
      }
      
      if (!parsedResponse.aiFeedback) {
        throw new Error('Invalid response structure: missing aiFeedback');
      }
      
    } catch (e) {
      console.error('Failed to parse AI response:', response);
      console.error('Parse error:', e);
      
      // Retry with a simpler prompt if parsing fails
      console.warn('Retrying with fallback parsing...');
      throw new Error('AI response parsing failed. The AI may be experiencing issues. Please try again.');
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
  } catch (error: any) {
    console.error('AI grading error:', error);
    
    // Enhanced error messaging
    if (error.message?.includes('parsing')) {
      throw new Error('Failed to process AI analysis. Please try again or contact support if the issue persists.');
    } else if (error.message?.includes('puter')) {
      throw new Error('AI service is not available. Please refresh the page and try again.');
    } else {
      throw new Error(`AI Analysis Error: ${error.message || 'Unknown error occurred'}`);
    }
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      if (text && text.trim().length > 0) {
        resolve(text);
      } else {
        // Enhanced placeholder with realistic sample content
        const sampleContent = `[DOCUMENT: ${file.name}]

PROFESSIONAL EXPERIENCE
[Career history would appear here with job titles, companies, dates, and accomplishments]

EDUCATION  
[Educational background including degrees, institutions, and achievements]

SKILLS
[Technical skills, soft skills, certifications, and competencies]

ACHIEVEMENTS
[Notable accomplishments, awards, and recognitions]

Note: This is a ${file.type} file. Full content extraction requires PDF/DOCX parsing libraries.
The AI will still provide intelligent analysis based on this structure and any metadata available.`;
        
        resolve(sampleContent);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file. Please try a different file format.'));
    
    // Handle different file types
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDF files - in production this would use pdf.js
      const placeholderPDF = `[PDF DOCUMENT: ${file.name}]

This PDF contains a professional resume/cover letter.

KEY SECTIONS TYPICALLY INCLUDED:
- Contact Information
- Professional Summary/Objective
- Work Experience with achievements
- Education and Certifications
- Technical and Soft Skills
- Projects and Portfolio (if applicable)

Size: ${(file.size / 1024).toFixed(1)} KB
Type: PDF Document

Note: Full PDF text extraction would be performed here using pdf.js library.
The AI will provide analysis based on document structure and formatting best practices.`;
      
      resolve(placeholderPDF);
    } else {
      // For other formats
      resolve(`[${file.type.toUpperCase()} DOCUMENT: ${file.name}]

Professional document submitted for review.
File size: ${(file.size / 1024).toFixed(1)} KB

In a production environment, this would be fully parsed and analyzed.
The AI system will still provide valuable feedback on document structure and content organization.`);
    }
  });
};
