import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin/teacher only)
router.get('/', auth, authorize('superadmin', 'teacher'), async (req, res) => {
  try {
    const users = await User.find()
      .populate('assignedSections sectionId')
      .select('-password')
      .sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually add a teacher with default password
router.post('/manual-teacher', auth, authorize('superadmin'), async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the default password "123"
    const hashedPassword = await bcrypt.hash('123', 10);
    
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'teacher',
      isActive: true
    });

    await user.save();
    
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: 'Teacher created with default password: 123'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user (superadmin)
router.patch('/:id', auth, authorize('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.email) updates.email = updates.email.toLowerCase();
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user (superadmin)
router.delete('/:id', auth, authorize('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
