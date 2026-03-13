import bcrypt from 'bcrypt';
import User from '../models/User.js';

export async function showProfile(req, res) {
  const user = await User.findById(req.user._id).lean();
  const success = req.query.success;
  res.render('profile', { user, success });
}

export async function updateProfile(req, res) {
  const { firstName, lastName, middleName, dateOfBirth, newPassword } = req.body;
  const updates = { firstName, lastName, middleName: middleName || '' };
  if (req.user.role === 'player' && dateOfBirth) updates.dateOfBirth = new Date(dateOfBirth);
  if (newPassword && newPassword.length >= 6) {
    updates.passwordHash = await bcrypt.hash(newPassword, 10);
  }
  if (req.file) {
    updates.avatar = '/uploads/avatars/' + req.file.filename;
  }
  await User.findByIdAndUpdate(req.user._id, updates);
  res.redirect(`/${req.user.role}/profile?success=Profile updated`);
}
