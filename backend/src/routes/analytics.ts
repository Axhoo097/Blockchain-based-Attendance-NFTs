import { Router } from 'express';
import { getAnalytics, getLeaderboard } from '../controllers/analyticsController';

const router = Router();

router.get('/',             getAnalytics);
router.get('/leaderboard',  getLeaderboard);

export default router;
