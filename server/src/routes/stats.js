import express from 'express';
import { User, Section, JobSubmission, StudentSubmission } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats (public endpoint)
router.get('/', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    const totalSections = await Section.countDocuments();
    const totalJobs = await JobSubmission.countDocuments();
    const totalSubmissions = await StudentSubmission.countDocuments();

    const submissions = await StudentSubmission.find();
    const averageScore = submissions.length > 0
      ? Math.round(submissions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / submissions.length)
      : 0;

    // Calculate common weaknesses
    const weaknessMap = {};
    submissions.forEach(sub => {
      sub.grades.forEach(grade => {
        if (grade.percentage < 70) {
          weaknessMap[grade.criterionName] = (weaknessMap[grade.criterionName] || 0) + 1;
        }
      });
    });

    const totalWeaknesses = Object.values(weaknessMap).reduce((sum, count) => sum + count, 0);
    const commonWeaknesses = Object.entries(weaknessMap)
      .map(([area, count]) => ({
        area,
        percentage: totalWeaknesses > 0 ? Math.round((count / totalWeaknesses) * 100) : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    res.json({
      totalStudents,
      totalTeachers,
      totalSections,
      totalJobs,
      totalSubmissions,
      averageScore,
      commonWeaknesses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
