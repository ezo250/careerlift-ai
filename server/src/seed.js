import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Section, Checklist } from './models/index.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Section.deleteMany({});
    await Checklist.deleteMany({});
    console.log('Cleared existing data');

    // Create superadmin
    const hashedPassword = await bcrypt.hash('123', 10);
    const superadmin = await User.create({
      email: 'amanialaindrin7@gmail.com',
      password: hashedPassword,
      name: 'Amani Alain',
      role: 'superadmin',
      isActive: true
    });
    console.log('✅ Created superadmin');

    // Create sections
    const sections = await Section.insertMany([
      {
        name: 'KC 2025',
        code: 'KC2025',
        description: 'Kepler College Class of 2025 - Computer Science & IT',
        assignedTeachers: [],
        studentCount: 0
      },
      {
        name: 'BA 2024',
        code: 'BA2024',
        description: 'Business Administration Class of 2024',
        assignedTeachers: [],
        studentCount: 0
      },
      {
        name: 'PM 2023',
        code: 'PM2023',
        description: 'Project Management Class of 2023',
        assignedTeachers: [],
        studentCount: 0
      }
    ]);
    console.log('✅ Created sections');

    // Create default checklist
    const checklist = await Checklist.create({
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
    console.log('✅ Created default checklist');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSuperadmin credentials:');
    console.log('Email: amanialaindrin7@gmail.com');
    console.log('Password: 123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
