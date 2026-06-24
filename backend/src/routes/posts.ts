import { Router } from 'express';
import { getPosts, createPost } from '../controllers/postsController';
import { validate, createPostSchema } from '../middleware/validation';

const router = Router();

router.get('/:address', getPosts);
router.post('/', validate(createPostSchema), createPost);

export default router;
