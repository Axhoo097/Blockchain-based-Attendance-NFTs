import { Router } from 'express';
import { analyzePost } from '../controllers/analyzeController';
import { analyzeLimiter } from '../middleware/rateLimiter';
import { validate, analyzeSchema } from '../middleware/validation';

const router = Router();

/** POST /api/analyze */
router.post('/', analyzeLimiter, validate(analyzeSchema), analyzePost);

export default router;
