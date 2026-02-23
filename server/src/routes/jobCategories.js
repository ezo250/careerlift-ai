import express from 'express';
import { JobCategory } from '../models/index.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const categories = await JobCategory.find().sort('name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, authorize('superadmin'), async (req, res) => {
  try {
    const category = new JobCategory(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', auth, authorize('superadmin'), async (req, res) => {
  try {
    const category = await JobCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, authorize('superadmin'), async (req, res) => {
  try {
    await JobCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
