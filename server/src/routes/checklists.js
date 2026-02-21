import express from 'express';
import { Checklist } from '../models/index.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all checklists
router.get('/', auth, async (req, res) => {
  try {
    const checklists = await Checklist.find().sort('-createdAt');
    res.json(checklists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create checklist
router.post('/', auth, authorize('superadmin'), async (req, res) => {
  try {
    const checklist = new Checklist(req.body);
    await checklist.save();
    res.status(201).json(checklist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
