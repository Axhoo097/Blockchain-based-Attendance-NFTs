import { Request, Response, NextFunction } from 'express';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { analyzeContent } from '../services/aiService';
import { calculateAIReputation } from '../services/reputationService';
import { AppError } from '../middleware/errorHandler';

/** GET /api/posts/:address?page=1&limit=10 */
export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const address = req.params.address.toLowerCase();
    const page  = Math.max(1, parseInt(String(req.query.page  || '1')));
    const limit = Math.min(50, parseInt(String(req.query.limit || '10')));
    const skip  = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ walletAddress: address })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ walletAddress: address }),
    ]);

    res.json({
      success: true,
      data: { posts, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/posts — create post + run AI analysis */
export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { walletAddress, content, txHash } = req.body as {
      walletAddress: string;
      content: string;
      txHash: string;
    };

    // Ensure user exists
    const user = await User.findOne({ walletAddress });
    if (!user) throw new AppError('Profile not found — create a profile first', 404);

    // Run AI analysis
    const analysis = await analyzeContent(content);
    const aiRepPoints = calculateAIReputation(analysis);

    // Save post
    const post = await Post.create({
      walletAddress,
      content,
      txHash,
      aiAnalysis: {
        sentiment:       analysis.sentiment,
        skillsDetected:  analysis.skillsDetected,
        technology:      analysis.technology,
        experienceLevel: analysis.experienceLevel,
        score:           analysis.score,
      },
      reputationGained: 5 + aiRepPoints,
    });

    // Update user stats in MongoDB
    await User.findOneAndUpdate(
      { walletAddress },
      {
        $inc: {
          totalPosts: 1,
          reputation: 5 + aiRepPoints,
        },
      }
    );

    res.status(201).json({
      success: true,
      data: {
        post,
        aiAnalysis: analysis,
        reputationEarned: 5 + aiRepPoints,
      },
    });
  } catch (err) {
    next(err);
  }
};
