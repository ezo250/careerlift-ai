import express from 'express';
import { StudentSubmission, JobSubmission, User } from '../models/index.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get submissions
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'teacher') {
      const jobs = await JobSubmission.find({ sectionId: { $in: req.user.assignedSections } });
      query.jobId = { $in: jobs.map(j => j._id) };
    }

    const submissions = await StudentSubmission.find(query)
      .populate('studentId', 'name email')
      .populate('jobId')
      .sort('-createdAt');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create submission
router.post('/', auth, authorize('student'), async (req, res) => {
  try {
    const { jobId, coverLetterName, resumeName, coverLetterUrl, resumeUrl } = req.body;
    
    const job = await JobSubmission.findById(jobId);
    if (!job || job.status !== 'active') {
      return res.status(400).json({ error: 'Job not available' });
    }

    const existingCount = await StudentSubmission.countDocuments({ studentId: req.user._id, jobId });
    if (existingCount >= job.maxSubmissions) {
      return res.status(400).json({ error: 'Maximum submissions reached' });
    }

    const submission = new StudentSubmission({
      studentId: req.user._id,
      jobId,
      submissionNumber: existingCount + 1,
      coverLetterName,
      resumeName,
      coverLetterUrl,
      resumeUrl,
      grades: [],
      overallScore: 0,
      aiFeedback: 'Processing...'
    });

    await submission.save();
    await submission.populate('studentId jobId');
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update submission with AI grades
router.patch('/:id/grade', auth, async (req, res) => {
  try {
    const { grades, overallScore, aiFeedback } = req.body;
    
    const submission = await StudentSubmission.findByIdAndUpdate(
      req.params.id,
      { grades, overallScore, aiFeedback },
      { new: true }
    ).populate('studentId jobId');
    
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top candidates
router.get('/top-candidates', auth, authorize('superadmin', 'teacher'), async (req, res) => {
  try {
    const { jobId, submissionNumber, limit = 5 } = req.query;
    
    const query = { jobId };
    if (submissionNumber) {
      query.submissionNumber = parseInt(submissionNumber);
    }

    const topSubmissions = await StudentSubmission.find(query)
      .populate('studentId', 'name email')
      .sort('-overallScore')
      .limit(parseInt(limit));

    res.json(topSubmissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
