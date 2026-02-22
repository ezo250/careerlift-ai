import express from 'express';
import { Section, User } from '../models/index.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all sections (public for signup)
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find().select('name').sort('name');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sections with details (authenticated)
router.get('/details', auth, async (req, res) => {
  try {
    const sections = await Section.find().populate('assignedTeachers', 'name email');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create section (superadmin only)
router.post('/', auth, authorize('superadmin'), async (req, res) => {
  try {
    const section = new Section(req.body);
    await section.save();
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign teacher to section
router.post('/:id/assign-teacher', auth, authorize('superadmin'), async (req, res) => {
  try {
    const { teacherId } = req.body;
    const section = await Section.findById(req.params.id);
    const teacher = await User.findById(teacherId);
    
    if (!section || !teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ error: 'Invalid section or teacher' });
    }

    if (!section.assignedTeachers.includes(teacherId)) {
      section.assignedTeachers.push(teacherId);
      await section.save();
    }

    if (!teacher.assignedSections.includes(section._id)) {
      teacher.assignedSections.push(section._id);
      await teacher.save();
    }

    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
