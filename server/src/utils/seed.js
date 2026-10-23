
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const seedData = async () => {
  const uri =
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/campusconnect';

  console.log('[Seed] Connecting to MongoDB...');

  let exitCode = 0;

  try {
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB.');

    // 1. Seed or verify Admin account
    const adminEmail =
      process.env.ADMIN_EMAIL || 'admin@campusconnect.edu';
    const adminName =
      process.env.ADMIN_NAME || 'Campus Administrator';
    const adminPassword = process.env.ADMIN_PASSWORD;

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      if (!adminPassword) {
        throw new Error(
          'ADMIN_PASSWORD is missing from server/.env. Set it before creating the admin account.'
        );
      }

      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        department: 'Academic Administration',
        studentId: 'ADMIN-01',
      });

      console.log(`[Seed] Created admin account: ${adminEmail}`);
    } else {
      console.log(`[Seed] Admin account already exists: ${adminEmail}`);
    }

    // 2. Seed or verify Organizer account
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
    } else {
      console.log(`[Seed] Organizer account already exists: ${orgEmail}`);
    }

    // 3. Seed or verify Student account
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
    } else {
      console.log(`[Seed] Student account already exists: ${studentEmail}`);
    }

    // 4. Prepare dates for demo events
    const today = new Date();

    const inThreeDays = new Date(today);
    inThreeDays.setDate(today.getDate() + 3);

    const inSevenDays = new Date(today);
    inSevenDays.setDate(today.getDate() + 7);

    const inTwoWeeks = new Date(today);
    inTwoWeeks.setDate(today.getDate() + 14);

    // 5. Define events across all seven categories
    const sampleEvents = [
      {
        title: 'Campus Hackathon 2026: AI & Cloud Innovation',
        description:
          'A 24-hour coding challenge bringing together students across engineering branches to solve real-world sustainability and campus automation problems. Mentorship and food provided!',
        category: 'Technical',
        date: inThreeDays,
        time: '09:00 AM - 09:00 AM (Next Day)',
        venue: 'Auditorium Complex & Tech Lab 3',
        capacity: 60,
      },
      {
        title: 'Annual Inter-College Cultural Fest: Resonance',
        description:
          'Celebrate arts, music, dance, and dramatic performances at our flagship cultural extravaganza. Open to students, faculty, and clubs.',
        category: 'Cultural',
        date: inSevenDays,
        time: '04:00 PM - 09:30 PM',
        venue: 'Main Campus Amphitheatre',
        capacity: 150,
      },
      {
        title: 'Full Stack MERN Architecture Workshop',
        description:
          'A hands-on workshop covering REST API development with Express, MongoDB database design, React state management, and production security.',
        category: 'Workshop',
        date: inTwoWeeks,
        time: '10:00 AM - 01:00 PM',
        venue: 'Seminar Hall B, Academic Block 2',
        capacity: 45,
      },
      {
        title: 'Inter-Department Football Championship',
        description:
          'Bring your department team together for a campus football tournament. Register to participate, support your teammates, and compete for the championship.',
        category: 'Sports',
        date: inSevenDays,
        time: '09:00 AM - 04:00 PM',
        venue: 'College Sports Ground',
        capacity: 100,
      },
      {
        title: 'Coding Club Community Meetup',
        description:
          'Join fellow coding enthusiasts for programming challenges, peer learning, project discussions, and collaborative problem-solving.',
        category: 'Club Activity',
        date: inTwoWeeks,
        time: '02:00 PM - 04:00 PM',
        venue: 'Computer Science Seminar Hall',
        capacity: 50,
      },
      {
        title: 'Emerging Technologies Seminar 2026',
        description:
          'Explore artificial intelligence, cybersecurity, cloud computing, and emerging technologies through expert talks and student discussions.',
        category: 'Seminar',
        date: inSevenDays,
        time: '10:00 AM - 12:30 PM',
        venue: 'Main Seminar Hall',
        capacity: 100,
      },
      {
        title: 'Campus Community Volunteering Day',
        description:
          'Participate in a campus community initiative featuring volunteering activities, environmental awareness, teamwork, and student-led activities.',
        category: 'Other',
        date: inTwoWeeks,
        time: '09:00 AM - 01:00 PM',
        venue: 'College Main Campus',
        capacity: 80,
      },
    ];

    // 6. Add missing events only. Do not delete or overwrite existing events.
    let addedCount = 0;

    for (const eventData of sampleEvents) {
      const existingEvent = await Event.findOne({
        title: eventData.title,
      });

      if (existingEvent) {
        console.log(
          `[Seed] Event already exists: ${eventData.title}`
        );
        continue;
      }

      await Event.create({
        ...eventData,
        registeredCount: 0,
        organizer: organizer._id,
        status: 'published',
        isApproved: true,
      });

      addedCount++;
      console.log(`[Seed] Added event: ${eventData.title}`);
    }

    console.log(`[Seed] Added ${addedCount} missing event(s).`);

    // 7. Ensure the demo student has a hackathon registration.
    // This does not duplicate an existing registration.
    const hackathon = await Event.findOne({
      title: 'Campus Hackathon 2026: AI & Cloud Innovation',
    });

    if (hackathon) {
      const existingRegistration = await Registration.findOne({
        student: student._id,
        event: hackathon._id,
      });

      if (!existingRegistration) {
        await Registration.create({
          student: student._id,
          event: hackathon._id,
          status: 'registered',
          attended: false,
        });

        await Event.updateOne(
          { _id: hackathon._id },
          { $inc: { registeredCount: 1 } }
        );

        console.log(
          '[Seed] Registered demo student for the hackathon.'
        );
      } else {
        console.log(
          '[Seed] Demo student hackathon registration already exists.'
        );
      }
    }

    console.log('[Seed] Database seeding completed successfully.');
  } catch (error) {
    exitCode = 1;
    console.error(`[Seed Error] ${error.message}`);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('[Seed] Disconnected from MongoDB.');
    } catch (disconnectError) {
      exitCode = 1;
      console.error(
        `[Seed Error] MongoDB disconnect failed: ${disconnectError.message}`
      );
    }
  }

  process.exitCode = exitCode;
};

seedData();
