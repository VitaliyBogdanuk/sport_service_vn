import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVATAR_DIR = path.join(__dirname, '../../uploads/avatars');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});

const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP'));
  },
}).single('avatar');

export function avatarUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err) return res.redirect(`/${req.user.role}/profile?error=${encodeURIComponent(err.message)}`);
    next();
  });
}
