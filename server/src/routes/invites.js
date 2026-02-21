import express from 'express';
import crypto from 'crypto';
import { TeacherInvite } from '../models/index.js';
import { auth, authorize } from '../middleware/auth.js';
import { sendTeacherInvite } from '../utils/email.js';

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
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'No emails provided' });
    }

    const results = [];

    for (const raw of emails) {
      const email = String(raw).toLowerCase().trim();
      const code = `KCL-TEACH-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const invite = new TeacherInvite({ email, code, status: 'pending' });
      await invite.save();

      // Try sending the email; do not fail all if one send fails
      try {
        await sendTeacherInvite({ to: email, code });
        results.push({ email, code, status: 'sent' });
      } catch (mailErr) {
        console.error('Invite email failed for', email, mailErr);
        results.push({ email, code, status: 'queued', error: 'Email failed to send; please retry or verify SMTP settings' });
      }
    }

    res.status(201).json({ invites: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify invite code
router.post('/verify', async (req, res) => {
  try {
    const { code, email } = req.body;
    // Try strict lookup first (code + email)
    let invite = await TeacherInvite.findOne({ code, email: email.toLowerCase(), status: 'pending' });
    // If not found, fall back to code-only pending lookup (allow some flexibility)
    if (!invite) {
      invite = await TeacherInvite.findOne({ code, status: 'pending' });
    }

    if (!invite) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired invite code' });
    }

    // If invite exists but email differs, normalize to the provided email so signup can proceed
    if (invite.email && invite.email !== email.toLowerCase()) {
      invite.email = email.toLowerCase();
      await invite.save();
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an invite (superadmin)
router.patch('/:id', auth, authorize('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.email) updates.email = updates.email.toLowerCase();
    const invite = await TeacherInvite.findByIdAndUpdate(id, updates, { new: true });
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    res.json(invite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an invite (superadmin)
router.delete('/:id', auth, authorize('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const invite = await TeacherInvite.findByIdAndDelete(id);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
