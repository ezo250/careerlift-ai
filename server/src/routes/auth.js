import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, TeacherInvite, Section } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).populate('assignedSections sectionId');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        assignedSections: user.assignedSections,
        sectionId: user.sectionId
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Signup (Students only)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, sectionId } = req.body;
    
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(400).json({ error: 'Invalid section' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'student',
      sectionId
    });

    await user.save();
    
    section.studentCount += 1;
    await section.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        sectionId: user.sectionId
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher signup with invite code
router.post('/signup/teacher', async (req, res) => {
  try {
    const { email, password, name, inviteCode } = req.body;
    
    const invite = await TeacherInvite.findOne({ code: inviteCode, email: email.toLowerCase(), status: 'pending' });
    if (!invite) {
      return res.status(400).json({ error: 'Invalid or expired invite code' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'teacher',
      inviteCode
    });

    await user.save();
    
    invite.status = 'accepted';
    await invite.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        assignedSections: []
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('assignedSections sectionId')
      .select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
