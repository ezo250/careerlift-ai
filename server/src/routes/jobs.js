import express from 'express';
import { JobSubmission, Checklist } from '../models/index.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get jobs (filtered by section for students/teachers)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'student') {
      query.sectionId = req.user.sectionId;
      query.status = 'active';
    } else if (req.user.role === 'teacher') {
      query.sectionId = { $in: req.user.assignedSections };
    }

    const jobs = await JobSubmission.find(query)
      .populate('sectionId', 'name code')
      .populate('checklistId')
      .sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create job (superadmin only)
router.post('/', auth, authorize('superadmin'), async (req, res) => {
  try {
    const job = new JobSubmission(req.body);
    await job.save();
    await job.populate('sectionId checklistId');
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update job
router.patch('/:id', auth, authorize('superadmin'), async (req, res) => {
  try {
    const job = await JobSubmission.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('sectionId checklistId');
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
