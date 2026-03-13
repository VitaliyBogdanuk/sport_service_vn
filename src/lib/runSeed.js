/**
 * Idempotent DB seed (admin, sample org/team/coach).
 * Expects mongoose already connected. Safe on every cold start if RUN_DB_SEED=true.
 */
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Team from '../models/Team.js';

export async function runSeed() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

  if (!(await User.findOne({ email: ADMIN_EMAIL }))) {
    await User.create({
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
    });
    console.log('[seed] Admin:', ADMIN_EMAIL);
  }

  let org = await Organization.findOne({ name: 'Sample Org' });
  if (!org) {
    org = await Organization.create({ name: 'Sample Org', description: 'Demo organization' });
    console.log('[seed] Organization: Sample Org');
  }

  let team = await Team.findOne({ name: 'Sample Team' });
  if (!team) {
    team = await Team.create({ name: 'Sample Team', organization: org._id });
    console.log('[seed] Team: Sample Team');
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
    console.log('[seed] Coach:', coachEmail);
  }

  console.log('[seed] Done.');
}
