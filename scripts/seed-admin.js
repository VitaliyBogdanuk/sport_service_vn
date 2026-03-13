/**
 * Seed default admin, sample org, team, coach.
 * Run: node scripts/seed-admin.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User.js';
import Organization from '../src/models/Organization.js';
import Team from '../src/models/Team.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-service');

  if (!(await User.findOne({ email: ADMIN_EMAIL }))) {
    await User.create({
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
    });
    console.log('Admin:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
  }

  let org = await Organization.findOne({ name: 'Sample Org' });
  if (!org) {
    org = await Organization.create({ name: 'Sample Org', description: 'Demo organization' });
    console.log('Organization created: Sample Org');
  }

  let team = await Team.findOne({ name: 'Sample Team' });
  if (!team) {
    team = await Team.create({ name: 'Sample Team', organization: org._id });
    console.log('Team created: Sample Team');
  }

  const coachEmail = 'coach@example.com';
  if (!(await User.findOne({ email: coachEmail }))) {
    const coach = await User.create({
      email: coachEmail,
      passwordHash: await bcrypt.hash('coach123', 10),
      role: 'coach',
      firstName: 'Coach',
      lastName: 'Demo',
      team: team._id,
    });
    await Team.findByIdAndUpdate(team._id, { coach: coach._id });
    console.log('Coach:', coachEmail, '/ coach123');
  }

  console.log('Seed done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
