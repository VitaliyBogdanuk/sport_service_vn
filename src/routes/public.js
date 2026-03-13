import { Router } from 'express';
import * as publicController from '../controllers/publicController.js';

const router = Router();

router.get('/', publicController.home);
router.get('/players', publicController.players);
router.get('/teams', publicController.teams);
router.get('/organizations', publicController.organizations);

export default router;
