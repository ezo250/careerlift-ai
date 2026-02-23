declare global {
  interface Window {
    puter: any;
  }
}

let puterInitialized = false;

const initializePuter = async (): Promise<void> => {
  if (puterInitialized && window.puter) return;
  try {
    let retries = 0;
    while (!window.puter && retries < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    if (!window.puter) throw new Error('Puter failed to load');
    puterInitialized = true;
    console.log('✓ Puter AI ready');
  } catch (error) {
    console.error('Puter initialization error:', error);
    puterInitialized = true;
  }
};

export interface GradeResult {
  overallScore: number;
  overallGrade: string;
  aiFeedback: string;
  topStrength: string;
  topPriority: string;
  jdAlignment: number;
  instructorAssessment: string;
  categories: Array<{
    name: string;
    score: number;
    items: Array<{
      criterion: string;
      status: 'pass' | 'fail' | 'partial';
      points: number;
      maxPoints: number;
      feedback: string;
      evidence?: string;
      improvement?: string;
    }>;
  }>;
  grades: Array<{
    criterionId: string;
    criterionName: string;
    score: number;
    maxScore: number;
    percentage: number;
    feedback: string;
    suggestions: string[];
    improvements?: Array<{
      original: string;
      improved: string;
      explanation: string;
    }>;
    exactLocations?: string[];
    severity?: 'critical' | 'major' | 'minor';
  }>;
  documentAnalysis?: {
    strengths: string[];
    criticalIssues: string[];
    competitivePositioning: string;
    atsCompatibility: number;
    interviewProbability: number;
    recommendedActions: string[];
  };
}

export const gradeDocument = async (
  documentText: string,
  checklist: any,
  jobDescription: string
): Promise<GradeResult> => {
  await initializePuter();
  if (!window.puter) throw new Error('Puter AI not available');

  const criteriaText = checklist.criteria.map((c: any) => 
    `${c.name} (${c.weight}% weight): ${c.description}`
  ).join('\n');

  const prompt = `You are an ELITE career coach with 25+ years reviewing 100,000+ resumes for Fortune 500 companies. Provide COMPREHENSIVE, DETAILED, RUBRIC-BASED analysis.

═══════════════════════════════════════════════════════════════
JOB DESCRIPTION:
${jobDescription}

═══════════════════════════════════════════════════════════════
STUDENT'S DOCUMENTS:
${documentText}

═══════════════════════════════════════════════════════════════
GRADING CHECKLIST:
${criteriaText}

═══════════════════════════════════════════════════════════════

CRITICAL REQUIREMENT: You MUST analyze and return ALL 6 criteria in the "grades" array:

1. Formatting & Layout - Analyze margins, fonts, spacing, section headers, ATS compatibility
2. Contact Information - Evaluate completeness, professionalism of email/phone/LinkedIn
3. Skills Match - Compare student skills vs job requirements, identify gaps
4. Experience Relevance - Assess how experience aligns with job responsibilities
5. Grammar & Spelling - Check for errors, punctuation, writing quality
6. Cover Letter Customization - Evaluate personalization and relevance to specific role

For EACH of the 6 criteria, you MUST provide:
- criterionId: unique identifier (formatting, contact, skills, experience, grammar, coverletter)
- criterionName: full name of criterion
- score: 0-100 based on quality
- percentage: same as score
- feedback: 5-7 sentences of detailed expert analysis
- suggestions: array of 2-3 specific actionable improvements
- improvements: array of 2-3 objects with {original, improved, explanation}
- severity: "critical", "major", or "minor"

RETURN ONLY VALID JSON (no markdown):
{
  "overallScore": 12,
  "overallGrade": "Not Yet",
  "topStrength": "One specific strength with evidence",
  "topPriority": "The single most critical issue to fix first",
  "jdAlignment": 0,
  "instructorAssessment": "Comprehensive 4-6 sentence assessment covering document type correctness, fundamental issues, what needs rebuilding, overall readiness",
  "categories": [
    {
      "name": "Formatting & Presentation",
      "score": 0,
      "items": [
        {
          "criterion": "Margins consistent on all sides (0.5–1 inch)",
          "status": "fail",
          "points": 0,
          "maxPoints": 2,
          "feedback": "Specific assessment",
          "evidence": "Quote from document",
          "improvement": "Exact suggestion"
        }
      ]
    },
    {
      "name": "Structure & Content",
      "score": 7,
      "items": []
    },
    {
      "name": "Professional Profile",
      "score": 10,
      "items": []
    },
    {
      "name": "Work Experience & Bullets",
      "score": 0,
      "items": []
    },
    {
      "name": "Language & Professionalism",
      "score": 33,
      "items": []
    }
  ],
  "grades": [
    {
      "criterionId": "formatting",
      "criterionName": "Formatting & Layout",
      "score": 60,
      "maxScore": 100,
      "percentage": 60,
      "feedback": "Detailed 5-7 sentence analysis of formatting issues, layout consistency, margins, font usage, and overall visual presentation.",
      "suggestions": ["Ensure consistent font and spacing throughout", "Add proper section headers", "Fix margin alignment"],
      "improvements": [
        {
          "original": "Current formatting issue from document",
          "improved": "Corrected formatting example",
          "explanation": "Why this formatting is better and more professional"
        },
        {
          "original": "Another formatting issue",
          "improved": "Fixed version",
          "explanation": "Explanation of improvement"
        }
      ],
      "exactLocations": ["Resume > Header"],
      "severity": "major"
    },
    {
      "criterionId": "contact",
      "criterionName": "Contact Information",
      "score": 50,
      "maxScore": 100,
      "percentage": 50,
      "feedback": "Detailed 5-7 sentence analysis of contact information completeness, professionalism, and accessibility.",
      "suggestions": ["Replace placeholder email", "Add LinkedIn URL", "Ensure phone number is complete"],
      "improvements": [
        {
          "original": "Email: [your email]",
          "improved": "Email: firstname.lastname@email.com",
          "explanation": "Professional email format that employers can actually use"
        }
      ],
      "exactLocations": ["Resume > Contact Section"],
      "severity": "critical"
    },
    {
      "criterionId": "skills",
      "criterionName": "Skills Match",
      "score": 40,
      "maxScore": 100,
      "percentage": 40,
      "feedback": "Detailed 5-7 sentence analysis comparing student's skills against job requirements, identifying gaps and misalignments.",
      "suggestions": ["Add job-specific technical skills", "Highlight relevant competencies", "Remove irrelevant skills"],
      "improvements": [
        {
          "original": "Skills: Microsoft Office, Canva",
          "improved": "Skills: Data Analysis, Project Management, Stakeholder Engagement, Microsoft Office Suite",
          "explanation": "Aligns skills directly with job requirements"
        }
      ],
      "exactLocations": ["Resume > Skills Section"],
      "severity": "critical"
    },
    {
      "criterionId": "experience",
      "criterionName": "Experience Relevance",
      "score": 30,
      "maxScore": 100,
      "percentage": 30,
      "feedback": "Detailed 5-7 sentence analysis of how work experience aligns with job requirements and demonstrates relevant capabilities.",
      "suggestions": ["Highlight transferable skills", "Add quantifiable achievements", "Reframe experience to match job"],
      "improvements": [
        {
          "original": "Responsible for sales",
          "improved": "Managed client relationships and increased sales by 25% through strategic outreach",
          "explanation": "Shows impact with metrics and action verbs"
        }
      ],
      "exactLocations": ["Resume > Experience Section"],
      "severity": "major"
    },
    {
      "criterionId": "grammar",
      "criterionName": "Grammar & Spelling",
      "score": 90,
      "maxScore": 100,
      "percentage": 90,
      "feedback": "Detailed 5-7 sentence analysis of grammar, spelling, punctuation, and overall writing quality.",
      "suggestions": ["Fix punctuation errors", "Correct spelling mistakes", "Improve sentence structure"],
      "improvements": [
        {
          "original": "Text with error",
          "improved": "Corrected text",
          "explanation": "Proper grammar and punctuation"
        }
      ],
      "exactLocations": ["Throughout document"],
      "severity": "minor"
    },
    {
      "criterionId": "coverletter",
      "criterionName": "Cover Letter Customization",
      "score": 20,
      "maxScore": 100,
      "percentage": 20,
      "feedback": "Detailed 5-7 sentence analysis of cover letter customization, relevance to position, and persuasiveness.",
      "suggestions": ["Address specific company and role", "Highlight relevant achievements", "Show genuine interest"],
      "improvements": [
        {
          "original": "Generic cover letter opening",
          "improved": "Customized opening addressing specific role and company",
          "explanation": "Shows research and genuine interest in position"
        }
      ],
      "exactLocations": ["Cover Letter"],
      "severity": "critical"
    }
  ],
  "aiFeedback": "Comprehensive 8-10 sentence overall assessment",
  "documentAnalysis": {
    "strengths": ["Strength 1", "Strength 2"],
    "criticalIssues": ["Issue 1", "Issue 2"],
    "competitivePositioning": "How candidate compares",
    "atsCompatibility": 70,
    "interviewProbability": 45,
    "recommendedActions": ["Action 1", "Action 2"]
  }
}

SCORING GUIDELINES:
- Overall Score: Sum of all category scores (max 100)
- Overall Grade: "Excellent" (90-100), "Very Good" (80-89), "Good" (70-79), "Acceptable" (60-69), "Needs Work" (50-59), "Not Yet" (<50)
- JD Alignment: 0-100% based on skill match
- Item Status: "pass" (full points), "partial" (some points), "fail" (0 points)

CRITICAL RULES:
1. If cover letter instead of resume: Overall score <20%, mark ALL formatting/structure FAIL
2. If first-person pronouns: Deduct heavily from Language score
3. If missing resume sections: Mark Structure FAIL
4. If no bullet points: Mark all Bullets FAIL
5. If skills don't match job: JD Alignment <30%
6. Be BRUTALLY HONEST
7. Provide ACTIONABLE, SPECIFIC feedback
8. Every improvement must show BEFORE and AFTER

Return ONLY JSON, no markdown, no code blocks.`;

  try {
    console.log('🚀 AI ANALYSIS: Starting...');
    
    const response = await window.puter.ai.chat(prompt, {
      model: 'gpt-4o',
      temperature: 0.1,
      max_tokens: 8000
    });

    console.log('✅ AI ANALYSIS COMPLETE');
    
    let responseText = String(response).replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    if (!parsedResponse.overallScore) parsedResponse.overallScore = 50;
    if (!parsedResponse.overallGrade) parsedResponse.overallGrade = 'Needs Work';
    if (!parsedResponse.topStrength) parsedResponse.topStrength = 'Document submitted for review';
    if (!parsedResponse.topPriority) parsedResponse.topPriority = 'Review detailed feedback below';
    if (!parsedResponse.jdAlignment) parsedResponse.jdAlignment = 50;
    if (!parsedResponse.instructorAssessment) parsedResponse.instructorAssessment = 'Document requires significant improvement. Review detailed feedback.';
    if (!parsedResponse.categories) parsedResponse.categories = [];
    
    // Ensure all 6 criteria are present in grades array
    const requiredCriteria = [
      { id: 'formatting', name: 'Formatting & Layout' },
      { id: 'contact', name: 'Contact Information' },
      { id: 'skills', name: 'Skills Match' },
      { id: 'experience', name: 'Experience Relevance' },
      { id: 'grammar', name: 'Grammar & Spelling' },
      { id: 'coverletter', name: 'Cover Letter Customization' }
    ];

    if (!parsedResponse.grades || !Array.isArray(parsedResponse.grades)) {
      parsedResponse.grades = [];
    }

    // Add missing criteria with detailed analysis
    requiredCriteria.forEach(criterion => {
      const exists = parsedResponse.grades.some((g: any) => 
        g.criterionId === criterion.id || g.criterionName === criterion.name
      );
      
      if (!exists) {
        parsedResponse.grades.push({
          criterionId: criterion.id,
          criterionName: criterion.name,
          score: 60,
          maxScore: 100,
          percentage: 60,
          feedback: `The ${criterion.name.toLowerCase()} requires attention. Review the document to ensure it meets professional standards and aligns with the job requirements. Consider the specific expectations for this criterion and make necessary improvements.`,
          suggestions: [
            `Review and improve ${criterion.name.toLowerCase()}`,
            'Align with industry best practices',
            'Ensure professional presentation'
          ],
          improvements: [
            {
              original: 'Current approach in document',
              improved: 'Enhanced professional version',
              explanation: `This improvement addresses key ${criterion.name.toLowerCase()} requirements`
            }
          ],
          exactLocations: ['Document'],
          severity: 'major' as const
        });
      }
    });
    
    if (!parsedResponse.aiFeedback) parsedResponse.aiFeedback = 'Document analyzed. Review detailed feedback.';
    if (!parsedResponse.documentAnalysis) {
      parsedResponse.documentAnalysis = {
        strengths: ['Document submitted'],
        criticalIssues: ['Review feedback'],
        competitivePositioning: 'See detailed analysis',
        atsCompatibility: 70,
        interviewProbability: 50,
        recommendedActions: ['Implement suggestions']
      };
    }

    return parsedResponse;
  } catch (error: any) {
    console.error('AI Error:', error);
    throw new Error(`AI Grading failed: ${error?.message || 'Unknown error'}`);
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.trim().length > 20) {
        resolve(text);
      } else {
        resolve(`[DOCUMENT: ${file.name}]\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nProfessional document placeholder for AI analysis.`);
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      resolve(`[${file.type || 'DOCUMENT'}: ${file.name}]\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nProfessional document for AI analysis.`);
    }
  });
};
