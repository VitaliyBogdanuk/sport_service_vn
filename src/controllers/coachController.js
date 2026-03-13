import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Document from '../models/Document.js';

function getAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export async function listPlayers(req, res) {
  const teamId = req.user.team;
  if (!teamId) {
    return res.render('coach/players', { user: req.user, players: [], q: '', success: req.query.success, active: 'players' });
  }
  const q = req.query.q || '';
  const filter = { role: 'player', team: teamId };
  if (q) filter.$or = [{ firstName: new RegExp(q, 'i') }, { lastName: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  const players = await User.find(filter).lean();
  const data = players.map((p) => ({ ...p, age: getAge(p.dateOfBirth) }));
  res.render('coach/players', { user: req.user, players: data, q, success: req.query.success, active: 'players' });
}

export async function newPlayer(req, res) {
  res.render('coach/player-form', { user: req.user, targetPlayer: null, active: 'players' });
}

export async function createPlayer(req, res) {
  const { email, password, firstName, lastName, middleName, dateOfBirth } = req.body;
  const passwordHash = await bcrypt.hash(password || 'changeme', 10);
  await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role: 'player',
    firstName,
    lastName,
    middleName: middleName || '',
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    team: req.user.team,
  });
  res.redirect('/coach/players?success=Created');
}

export async function editPlayer(req, res) {
  const targetPlayer = await User.findOne({ _id: req.params.id, role: 'player', team: req.user.team }).lean();
  if (!targetPlayer) return res.status(404).send('Not found');
  res.render('coach/player-form', { user: req.user, targetPlayer, active: 'players' });
}

export async function updatePlayer(req, res) {
  const target = await User.findOne({ _id: req.params.id, role: 'player', team: req.user.team });
  if (!target) return res.status(404).send('Not found');
  const { firstName, lastName, middleName, dateOfBirth, newPassword } = req.body;
  const updates = { firstName, lastName, middleName: middleName || '' };
  if (dateOfBirth) updates.dateOfBirth = new Date(dateOfBirth);
  if (newPassword && newPassword.length >= 6) updates.passwordHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(req.params.id, updates);
  res.redirect('/coach/players?success=Updated');
}

export async function deletePlayer(req, res) {
  const target = await User.findOne({ _id: req.params.id, role: 'player', team: req.user.team });
  if (!target) return res.status(404).send('Not found');
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/coach/players?success=Deleted');
}

export async function viewPlayerDocuments(req, res) {
  const targetPlayer = await User.findOne({ _id: req.params.id, role: 'player', team: req.user.team }).lean();
  if (!targetPlayer) return res.status(404).send('Not found');
  const documents = await Document.find({ user: targetPlayer._id, status: 'approved' }).sort({ createdAt: -1 }).lean();
  res.render('coach/player-documents', {
    user: req.user,
    targetPlayer,
    documents,
    active: 'players',
  });
}
