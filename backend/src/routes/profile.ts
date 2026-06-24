import { Router } from 'express';
import {
  getProfile,
  upsertProfile,
  profileExists,
  updateReputation,
} from '../controllers/profileController';
import { validate, createProfileSchema } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

router.get('/:address',           getProfile);
router.get('/:address/exists',    profileExists);
router.post('/',  validate(createProfileSchema), upsertProfile);
router.patch(
  '/:address/reputation',
  validate(z.object({ points: z.number().int().positive() })),
  updateReputation
);

export default router;
