export type UserRole = 'superadmin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  assignedSections?: string[];
  sectionId?: string;
}

export interface Section {
  id: string;
  name: string;
  code: string;
  description: string;
  assignedTeachers: string[];
  studentCount: number;
  createdAt: string;
}

export interface JobSubmission {
  id: string;
  title: string;
  company: string;
  description: string;
  sectionId: string;
  maxSubmissions: number;
  checklistId: string;
  createdAt: string;
  deadline: string;
  status: 'active' | 'closed';
}

export interface Checklist {
  id: string;
  name: string;
  criteria: ChecklistCriterion[];
  createdAt: string;
}

export interface ChecklistCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  jobId: string;
  submissionNumber: number;
  coverLetterName: string;
  resumeName: string;
  submittedAt: string;
  grades: GradeItem[];
  overallScore: number;
  aiFeedback: string;
}

export interface GradeItem {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string;
  suggestions: string[];
}

export interface TeacherInvite {
  id: string;
  email: string;
  code: string;
  status: 'pending' | 'accepted';
  sentAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalSections: number;
  totalJobs: number;
  totalSubmissions: number;
  averageScore: number;
  commonWeaknesses: { area: string; percentage: number }[];
}
