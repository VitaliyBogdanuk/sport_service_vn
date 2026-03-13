import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import Document from '../models/Document.js';
import Team from '../models/Team.js';
import Organization from '../models/Organization.js';
import { sendCoachCredentials } from '../services/email.js';

export async function dashboard(req, res) {
  const [organizations, teams, players, coaches] = await Promise.all([
    Organization.countDocuments(),
    Team.countDocuments(),
    User.countDocuments({ role: 'player' }),
    User.countDocuments({ role: 'coach' }),
  ]);
  res.render('admin/dashboard', {
    user: req.user,
    stats: { organizations, teams, players, coaches },
  });
}

// Organizations
export async function listOrganizations(req, res) {
  const q = req.query.q || '';
  const filter = q ? { name: new RegExp(q, 'i') } : {};
  const organizations = await Organization.find(filter).sort({ name: 1 }).lean();
  res.render('admin/organizations', { user: req.user, organizations, q, success: req.query.success, active: 'organizations' });
}

export async function newOrganization(req, res) {
  res.render('admin/organization-form', { user: req.user, organization: null, active: 'organizations' });
}

export async function createOrganization(req, res) {
  await Organization.create({ name: req.body.name, description: req.body.description });
  res.redirect('/admin/organizations?success=Created');
}

export async function editOrganization(req, res) {
  const organization = await Organization.findById(req.params.id).lean();
  if (!organization) return res.status(404).send('Not found');
  res.render('admin/organization-form', { user: req.user, organization, active: 'organizations' });
}

export async function updateOrganization(req, res) {
  await Organization.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description });
  res.redirect('/admin/organizations?success=Updated');
}

export async function deleteOrganization(req, res) {
  await Organization.findByIdAndDelete(req.params.id);
  res.redirect('/admin/organizations?success=Deleted');
}

// Teams
export async function listTeams(req, res) {
  const q = req.query.q || '';
  const filter = q ? { name: new RegExp(q, 'i') } : {};
  const teams = await Team.find(filter).populate('organization').populate('coach').sort({ name: 1 }).lean();
  const organizations = await Organization.find().sort({ name: 1 }).lean();
  const coaches = await User.find({ role: 'coach' }).sort({ lastName: 1 }).lean();
  res.render('admin/teams', { user: req.user, teams, organizations, coaches, q, success: req.query.success, active: 'teams' });
}

export async function newTeam(req, res) {
  const [organizations, coaches] = await Promise.all([
    Organization.find().sort({ name: 1 }).lean(),
    User.find({ role: 'coach' }).sort({ lastName: 1 }).lean(),
  ]);
  res.render('admin/team-form', { user: req.user, team: null, organizations, coaches, active: 'teams' });
}

export async function createTeam(req, res) {
  const team = await Team.create({
    name: req.body.name,
    organization: req.body.organization || undefined,
    coach: req.body.coach || undefined,
  });
  if (req.body.coach) await User.findByIdAndUpdate(req.body.coach, { team: team._id });
  res.redirect('/admin/teams?success=Created');
}

export async function editTeam(req, res) {
  const [team, organizations, coaches] = await Promise.all([
    Team.findById(req.params.id).lean(),
    Organization.find().sort({ name: 1 }).lean(),
    User.find({ role: 'coach' }).sort({ lastName: 1 }).lean(),
  ]);
  if (!team) return res.status(404).send('Not found');
  res.render('admin/team-form', { user: req.user, team, organizations, coaches, active: 'teams' });
}

export async function updateTeam(req, res) {
  const oldTeam = await Team.findById(req.params.id);
  await Team.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    organization: req.body.organization || undefined,
    coach: req.body.coach || undefined,
  });
  if (oldTeam?.coach && oldTeam.coach.toString() !== req.body.coach) {
    await User.findByIdAndUpdate(oldTeam.coach, { $unset: { team: 1 } });
  }
  if (req.body.coach) await User.findByIdAndUpdate(req.body.coach, { team: req.params.id });
  res.redirect('/admin/teams?success=Updated');
}

export async function deleteTeam(req, res) {
  const team = await Team.findById(req.params.id);
  if (team?.coach) await User.findByIdAndUpdate(team.coach, { $unset: { team: 1 } });
  await Team.findByIdAndDelete(req.params.id);
  res.redirect('/admin/teams?success=Deleted');
}

// Users
export async function listUsers(req, res) {
  const q = req.query.q || '';
  const role = req.query.role || '';
  const filter = {};
  if (q) filter.$or = [{ email: new RegExp(q, 'i') }, { firstName: new RegExp(q, 'i') }, { lastName: new RegExp(q, 'i') }];
  if (role) filter.role = role;
  const users = await User.find(filter).populate('team').sort({ role: 1, lastName: 1 }).lean();
  res.render('admin/users', { user: req.user, users, q, role, success: req.query.success, active: 'users' });
}

export async function newUser(req, res) {
  const [teams, organizations] = await Promise.all([
    Team.find().sort({ name: 1 }).lean(),
    Organization.find().sort({ name: 1 }).lean(),
  ]);
  res.render('admin/user-form', { user: req.user, targetUser: null, teams, organizations, active: 'users' });
}

export async function createUser(req, res) {
  const { email, password, role, firstName, lastName, middleName, dateOfBirth, team } = req.body;
  const plainPassword = password || crypto.randomBytes(6).toString('hex');
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role,
    firstName,
    lastName,
    middleName: middleName || '',
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    team: team || undefined,
  });
  if (role === 'coach') {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    await sendCoachCredentials(email, plainPassword, firstName, lastName, baseUrl);
  }
  res.redirect('/admin/users?success=Created');
}

export async function editUser(req, res) {
  const [targetUser, teams, organizations, documents] = await Promise.all([
    User.findById(req.params.id).populate('team').lean(),
    Team.find().sort({ name: 1 }).lean(),
    Organization.find().sort({ name: 1 }).lean(),
    Document.find({ user: req.params.id }).sort({ createdAt: -1 }).lean(),
  ]);
  if (!targetUser) return res.status(404).send('Not found');
  res.render('admin/user-form', {
    user: req.user,
    targetUser,
    teams,
    organizations,
    documents: documents || [],
    success: req.query.success,
    error: req.query.error,
    active: 'users',
  });
}

export async function updateUser(req, res) {
  const { role, firstName, lastName, middleName, dateOfBirth, team, newPassword } = req.body;
  const updates = { role, firstName, lastName, middleName: middleName || '', team: team || undefined };
  if (dateOfBirth) updates.dateOfBirth = new Date(dateOfBirth);
  if (newPassword && newPassword.length >= 6) {
    updates.passwordHash = await bcrypt.hash(newPassword, 10);
  }
  await User.findByIdAndUpdate(req.params.id, updates);
  res.redirect('/admin/users?success=Updated');
}

export async function deleteUser(req, res) {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/users?success=Deleted');
}
