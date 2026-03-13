import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import Document from '../models/Document.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
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

export function uploadMiddleware(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.redirect('/player/documents?error=' + encodeURIComponent(err.message));
    next();
  });
}

export async function listDocuments(req, res) {
  const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.render('player/documents', {
    user: req.user,
    documents: docs,
    error: req._query?.error || req.query.error,
    success: req._query?.success || req.query.success,
  });
}

export async function uploadDocuments(req, res) {
  if (!req.files?.length) return res.redirect('/player/documents?error=No files selected');
  for (const file of req.files) {
    await Document.create({
      user: req.user._id,
      name: file.originalname,
      url: '/uploads/' + file.filename,
      mimeType: file.mimetype,
      size: file.size,
      status: 'pending',
      uploadedBy: 'player',
    });
  }
  res.redirect('/player/documents?success=Documents uploaded');
}

export async function deleteDocument(req, res) {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) return res.status(404).send('Not found');
  await Document.findByIdAndDelete(doc._id);
  res.redirect('/player/documents?success=Document deleted');
}
