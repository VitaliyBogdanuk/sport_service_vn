import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import Document from '../models/Document.js';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    const playerId = req.body?.playerId || req.user?._id;
    cb(null, `admin-${playerId}-${Date.now()}${ext}`);
  },
});

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png'];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Allowed: PDF, JPEG, PNG'));
  },
}).array('documents', 5);

export const adminUploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.redirect('/admin/documents?error=' + encodeURIComponent(err.message));
    next();
  });
};

export async function listDocuments(req, res) {
  const { playerId, status } = req.query;
  const filter = {};
  if (playerId) filter.user = playerId;
  if (status) {
    if (status === 'pending') filter.$or = [{ status: 'pending' }, { status: { $exists: false } }];
    else filter.status = status;
  }
  const documents = await Document.find(filter).populate('user').sort({ createdAt: -1 }).lean();
  const players = await User.find({ role: 'player' }).sort({ lastName: 1 }).lean();
  res.render('admin/documents', {
    user: req.user,
    documents,
    players,
    playerId: playerId || '',
    status: status || '',
    success: req.query.success,
    error: req.query.error,
    active: 'documents',
  });
}

function safeRedirect(returnTo, defaultPath, suffix = '') {
  if (returnTo && typeof returnTo === 'string' && returnTo.startsWith('/admin')) {
    return returnTo + (suffix ? (returnTo.includes('?') ? '&' : '?') + suffix : '');
  }
  return defaultPath + (suffix ? (defaultPath.includes('?') ? '&' : '?') + suffix : '');
}

export async function uploadForPlayer(req, res) {
  const playerId = req.body.playerId;
  const returnTo = req.body.returnTo;
  if (!playerId) return res.redirect(safeRedirect(returnTo, '/admin/documents', 'error=' + encodeURIComponent('Select a player')));
  if (!req.files?.length) return res.redirect(safeRedirect(returnTo, '/admin/documents', 'error=' + encodeURIComponent('No files selected')));
  for (const file of req.files) {
    await Document.create({
      user: playerId,
      name: file.originalname,
      url: '/uploads/' + file.filename,
      mimeType: file.mimetype,
      size: file.size,
      status: 'approved',
      uploadedBy: 'admin',
    });
  }
  res.redirect(safeRedirect(returnTo, '/admin/documents', 'success=' + encodeURIComponent('Documents uploaded')));
}

export async function updateDocument(req, res) {
  const { name, status, returnTo } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (status) updates.status = status;
  await Document.findByIdAndUpdate(req.params.id, updates);
  res.redirect(safeRedirect(returnTo, '/admin/documents', 'success=' + encodeURIComponent('Document updated')));
}

export async function deleteDocument(req, res) {
  await Document.findByIdAndDelete(req.params.id);
  const returnTo = req.body.returnTo;
  res.redirect(safeRedirect(returnTo, '/admin/documents', 'success=' + encodeURIComponent('Document deleted')));
}
