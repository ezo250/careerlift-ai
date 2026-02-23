import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'teacher', 'student'], required: true },
  avatar: String,
  assignedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  inviteCode: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  assignedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  studentCount: { type: Number, default: 0 }
}, { timestamps: true });

const checklistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  criteria: [{
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    description: String
  }]
}, { timestamps: true });

const jobCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String
}, { timestamps: true });

const jobSubmissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  maxSubmissions: { type: Number, default: 1 },
  checklistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Checklist', required: true },
  deadline: Date,
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCategory' },
  requireResume: { type: Boolean, default: true },
  requireCoverLetter: { type: Boolean, default: true }
}, { timestamps: true });

const studentSubmissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSubmission', required: true },
  submissionNumber: { type: Number, required: true },
  coverLetterUrl: String,
  coverLetterName: String,
  resumeUrl: String,
  resumeName: String,
  grades: [{
    criterionId: String,
    criterionName: String,
    score: Number,
    maxScore: Number,
    percentage: Number,
    feedback: String,
    suggestions: [String],
    improvements: [{
      original: String,
      improved: String,
      explanation: String
    }]
  }],
  overallScore: Number,
  aiFeedback: String,
  isSelfEvaluation: { type: Boolean, default: false }
}, { timestamps: true });

const teacherInviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  sentAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
export const Section = mongoose.model('Section', sectionSchema);
export const Checklist = mongoose.model('Checklist', checklistSchema);
export const JobCategory = mongoose.model('JobCategory', jobCategorySchema);
export const JobSubmission = mongoose.model('JobSubmission', jobSubmissionSchema);
export const StudentSubmission = mongoose.model('StudentSubmission', studentSubmissionSchema);
export const TeacherInvite = mongoose.model('TeacherInvite', teacherInviteSchema);
