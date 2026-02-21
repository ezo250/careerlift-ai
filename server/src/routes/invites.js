import express from 'express';
import crypto from 'crypto';
import { TeacherInvite } from '../models/index.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all invites
router.get('/', auth, authorize('superadmin'), async (req, res) => {
  try {
    const invites = await TeacherInvite.find().sort('-sentAt');
    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create teacher invites
router.post('/', auth, authorize('superadmin'), async (req, res) => {
  try {
    const { emails } = req.body;
    const invites = [];

    for (const email of emails) {
      const code = `KCL-TEACH-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const invite = new TeacherInvite({
        email: email.toLowerCase(),
        code,
        status: 'pending'
      });
      await invite.save();
      invites.push(invite);
    }

    res.status(201).json(invites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify invite code
router.post('/verify', async (req, res) => {
  try {
    const { code, email } = req.body;
    const invite = await TeacherInvite.findOne({ 
      code, 
      email: email.toLowerCase(), 
      status: 'pending' 
    });
    
    if (!invite) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired invite code' });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
