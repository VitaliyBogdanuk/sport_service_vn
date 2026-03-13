import User from '../models/User.js';
import Team from '../models/Team.js';
import Organization from '../models/Organization.js';

function getAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export async function home(req, res) {
  res.render('public/home');
}

export async function players(req, res) {
  const q = req.query.q;
  const filter = { role: 'player' };
  if (q) {
    filter.$or = [
      { firstName: new RegExp(q, 'i') },
      { lastName: new RegExp(q, 'i') },
      { middleName: new RegExp(q, 'i') },
    ];
  }
  const players = await User.find(filter).lean();
  const data = players.map((p) => ({ ...p, age: getAge(p.dateOfBirth) }));
  res.render('public/players', { players: data, q: q || '' });
}

export async function teams(req, res) {
  const q = req.query.q;
  const filter = {};
  if (q) filter.name = new RegExp(q, 'i');
  const teams = await Team.find(filter).populate('organization').lean();
  res.render('public/teams', { teams, q: q || '' });
}

export async function organizations(req, res) {
  const q = req.query.q;
  const filter = {};
  if (q) filter.name = new RegExp(q, 'i');
  const organizations = await Organization.find(filter).lean();
  res.render('public/organizations', { organizations, q: q || '' });
}
