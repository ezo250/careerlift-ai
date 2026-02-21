import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, Section, Checklist } from './models/index.js';
import authRoutes from './routes/auth.js';
import sectionRoutes from './routes/sections.js';
import jobRoutes from './routes/jobs.js';
import submissionRoutes from './routes/submissions.js';
import checklistRoutes from './routes/checklists.js';
import inviteRoutes from './routes/invites.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auto-seed database on first run
const autoSeed = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding database...');
      
      const hashedPassword = await bcrypt.hash('123', 10);
      await User.create({
        email: 'amanialaindrin7@gmail.com',
        password: hashedPassword,
        name: 'Amani Alain',
        role: 'superadmin',
        isActive: true
      });

      await Section.insertMany([
        { name: 'KC 2025', code: 'KC2025', description: 'Kepler College Class of 2025 - Computer Science & IT', assignedTeachers: [], studentCount: 0 },
        { name: 'BA 2024', code: 'BA2024', description: 'Business Administration Class of 2024', assignedTeachers: [], studentCount: 0 },
        { name: 'PM 2023', code: 'PM2023', description: 'Project Management Class of 2023', assignedTeachers: [], studentCount: 0 }
      ]);

      await Checklist.create({
        name: 'Standard Resume & Cover Letter Checklist',
        criteria: [
          { name: 'Formatting & Layout', weight: 20, description: 'Proper margins, font consistency, spacing, professional layout' },
          { name: 'Contact Information', weight: 10, description: 'Complete and accurate contact details' },
          { name: 'Skills Match', weight: 25, description: 'Skills align with job description requirements' },
          { name: 'Experience Relevance', weight: 20, description: 'Work experience relevant to the position' },
          { name: 'Grammar & Spelling', weight: 10, description: 'Error-free writing with proper grammar' },
          { name: 'Cover Letter Customization', weight: 15, description: 'Cover letter tailored to the specific job' }
        ]
      });

      console.log('✅ Database seeded successfully!');
    }
  } catch (error) {
    console.error('❌ Auto-seed error:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await autoSeed();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
