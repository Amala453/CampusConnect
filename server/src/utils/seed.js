require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const seedData = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';
  console.log(`[Seed] Connecting to MongoDB: ${uri}`);

  try {
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB.');

    // 1. Seed or Verify Admin Account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@campusconnect.edu';
    const adminName = process.env.ADMIN_NAME || 'Campus Administrator';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecure123!';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        department: 'Academic Administration',
        studentId: 'ADMIN-01',
      });
      console.log(`[Seed] Created initial Admin account: ${adminEmail}`);
    } else {
      console.log(`[Seed] Admin account already exists: ${adminEmail}`);
    }

    // 2. Seed Organizer
    const orgEmail = 'organizer@campusconnect.edu';
    let organizer = await User.findOne({ email: orgEmail });
    if (!organizer) {
      organizer = await User.create({
        name: 'Prof. Sarah Jenkins (Coding Club)',
        email: orgEmail,
        password: 'OrganizerSecure123!',
        role: 'organizer',
        department: 'Computer Science & Engineering',
        studentId: 'FAC-102',
      });
      console.log(`[Seed] Created demo Organizer: ${orgEmail}`);
    }

    // 3. Seed Student
    const studentEmail = 'student@campusconnect.edu';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({
        name: 'Alex Johnson',
        email: studentEmail,
        password: 'StudentSecure123!',
        role: 'student',
        department: 'Information Technology',
        studentId: 'STU-2024-042',
      });
      console.log(`[Seed] Created demo Student: ${studentEmail}`);
    }

    // 4. Seed Sample Events if none exist
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      const today = new Date();
      const inThreeDays = new Date(today);
      inThreeDays.setDate(today.getDate() + 3);

      const inSevenDays = new Date(today);
      inSevenDays.setDate(today.getDate() + 7);

      const inTwoWeeks = new Date(today);
      inTwoWeeks.setDate(today.getDate() + 14);

      const events = [
        {
          title: 'Campus Hackathon 2026: AI & Cloud Innovation',
          description:
            'A 24-hour coding challenge bringing together students across engineering branches to solve real-world sustainability and campus automation problems. Mentorship and food provided!',
          category: 'Technical',
          date: inThreeDays,
          time: '09:00 AM - 09:00 AM (Next Day)',
          venue: 'Auditorium Complex & Tech Lab 3',
          capacity: 60,
          registeredCount: 1,
          organizer: organizer._id,
          status: 'published',
          isApproved: true,
        },
        {
          title: 'Annual Inter-College Cultural Fest: Resonance',
          description:
            'Celebrate arts, music, dance, and dramatic performances at our flagship cultural extravaganza. Open to all students, faculties, and clubs.',
          category: 'Cultural',
          date: inSevenDays,
          time: '04:00 PM - 09:30 PM',
          venue: 'Main Campus Amphitheatre',
          capacity: 150,
          registeredCount: 0,
          organizer: organizer._id,
          status: 'published',
          isApproved: true,
        },
        {
          title: 'Full Stack MERN Architecture Workshop',
          description:
            'Hands-on interactive workshop covering REST API development with Express, MongoDB database design, React state management, and production security essentials.',
          category: 'Workshop',
          date: inTwoWeeks,
          time: '10:00 AM - 01:00 PM',
          venue: 'Seminar Hall B, Academic Block 2',
          capacity: 45,
          registeredCount: 0,
          organizer: organizer._id,
          status: 'published',
          isApproved: true,
        },
      ];

      const createdEvents = await Event.insertMany(events);
      console.log(`[Seed] Seeded ${createdEvents.length} initial events.`);

      // Register the sample student for the hackathon
      await Registration.create({
        student: student._id,
        event: createdEvents[0]._id,
        status: 'registered',
        attended: false,
      });
      console.log('[Seed] Registered demo student for initial hackathon event.');
    }

    console.log('[Seed] Database seeding completed successfully.');
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB.');
    process.exit(0);
  }
};

seedData();
