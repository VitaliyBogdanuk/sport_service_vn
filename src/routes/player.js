import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateCsrf } from '../middleware/csrf.js';
import { avatarUpload } from '../middleware/avatarUpload.js';
import * as profileController from '../controllers/profileController.js';
import * as documentsController from '../controllers/documentsController.js';

const router = Router();
const guard = [requireAuth, requireRole('player')];

router.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && req.path !== '/profile' && req.path !== '/documents') {
    return validateCsrf(req, res, next);
  }
  next();
});

router.get('/', guard, (req, res) => res.render('player/dashboard', { user: req.user }));
router.get('/profile', guard, profileController.showProfile);
router.post('/profile', guard, avatarUpload, validateCsrf, profileController.updateProfile);
router.get('/documents', guard, (req, res, next) => {
  req._query = { error: req.query.error, success: req.query.success };
  next();
}, documentsController.listDocuments);
router.post('/documents', guard, documentsController.uploadMiddleware, validateCsrf, documentsController.uploadDocuments);
router.post('/documents/:id/delete', guard, validateCsrf, documentsController.deleteDocument);

export default router;
