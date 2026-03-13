import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import * as coachController from '../controllers/coachController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateCsrf } from '../middleware/csrf.js';
import { avatarUpload } from '../middleware/avatarUpload.js';

const router = Router();
const guard = [requireAuth, requireRole('coach')];

router.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && req.path !== '/profile') {
    return validateCsrf(req, res, next);
  }
  next();
});

router.get('/', guard, (req, res) => res.render('coach/dashboard', { user: req.user }));
router.get('/profile', guard, profileController.showProfile);
router.post('/profile', guard, avatarUpload, validateCsrf, profileController.updateProfile);
router.get('/players', guard, coachController.listPlayers);
router.get('/players/new', guard, coachController.newPlayer);
router.post('/players', guard, coachController.createPlayer);
router.get('/players/:id/edit', guard, coachController.editPlayer);
router.get('/players/:id/documents', guard, coachController.viewPlayerDocuments);
router.post('/players/:id', guard, coachController.updatePlayer);
router.post('/players/:id/delete', guard, coachController.deletePlayer);

export default router;
