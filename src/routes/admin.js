import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as profileController from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateCsrf } from '../middleware/csrf.js';
import { avatarUpload } from '../middleware/avatarUpload.js';
import * as adminDocumentsController from '../controllers/adminDocumentsController.js';

const router = Router();
const guard = [requireAuth, requireRole('admin')];

router.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && req.path !== '/profile' && !req.path.startsWith('/documents')) {
    return validateCsrf(req, res, next);
  }
  next();
});

router.get('/', guard, adminController.dashboard);
router.get('/profile', guard, profileController.showProfile);
router.post('/profile', guard, avatarUpload, validateCsrf, profileController.updateProfile);
router.get('/organizations', guard, adminController.listOrganizations);
router.get('/organizations/new', guard, adminController.newOrganization);
router.post('/organizations', guard, adminController.createOrganization);
router.get('/organizations/:id/edit', guard, adminController.editOrganization);
router.post('/organizations/:id', guard, adminController.updateOrganization);
router.post('/organizations/:id/delete', guard, adminController.deleteOrganization);
router.get('/teams', guard, adminController.listTeams);
router.get('/teams/new', guard, adminController.newTeam);
router.post('/teams', guard, adminController.createTeam);
router.get('/teams/:id/edit', guard, adminController.editTeam);
router.post('/teams/:id', guard, adminController.updateTeam);
router.post('/teams/:id/delete', guard, adminController.deleteTeam);
router.get('/users', guard, adminController.listUsers);
router.get('/users/new', guard, adminController.newUser);
router.post('/users', guard, adminController.createUser);
router.get('/users/:id/edit', guard, adminController.editUser);
router.post('/users/:id', guard, adminController.updateUser);
router.post('/users/:id/delete', guard, adminController.deleteUser);

router.get('/documents', guard, adminDocumentsController.listDocuments);
router.post('/documents/upload', guard, adminDocumentsController.adminUploadMiddleware, validateCsrf, adminDocumentsController.uploadForPlayer);
router.post('/documents/:id', guard, validateCsrf, adminDocumentsController.updateDocument);
router.post('/documents/:id/delete', guard, validateCsrf, adminDocumentsController.deleteDocument);

export default router;
