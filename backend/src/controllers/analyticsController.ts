import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Post } from '../models/Post';

/** GET /api/analytics — platform-wide stats */
export const getAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalUsers, totalPosts, reputationAgg, topSkillsAgg, recentActivity] =
      await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),

        User.aggregate([
          { $group: { _id: null, avg: { $avg: '$reputation' }, max: { $max: '$reputation' } } },
        ]),

        Post.aggregate([
          { $unwind: '$aiAnalysis.skillsDetected' },
          { $group: { _id: '$aiAnalysis.skillsDetected', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { skill: '$_id', count: 1, _id: 0 } },
        ]),

        // Last 7 days user registrations
        User.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        avgReputation: reputationAgg[0]?.avg ? Math.round(reputationAgg[0].avg) : 0,
        maxReputation: reputationAgg[0]?.max ?? 0,
        topSkills:     topSkillsAgg,
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/analytics/leaderboard */
export const getLeaderboard = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leaders = await User.find()
      .sort({ reputation: -1 })
      .limit(10)
      .select('walletAddress profileData.name reputation totalPosts');

    res.json({ success: true, data: leaders });
  } catch (err) {
    next(err);
  }
};
