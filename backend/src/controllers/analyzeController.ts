import { Request, Response, NextFunction } from 'express';
import { analyzeContent } from '../services/aiService';
import { calculateAIReputation } from '../services/reputationService';

/**
 * POST /api/analyze
 * Body: { content: string, walletAddress: string }
 * Returns AI analysis result + reputation points to award
 */
export const analyzePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { content, walletAddress } = req.body as {
      content: string;
      walletAddress: string;
    };

    const analysis = await analyzeContent(content);
    const reputationPoints = calculateAIReputation(analysis);

    res.json({
      success: true,
      data: {
        walletAddress,
        analysis,
        reputationPoints,
        usedOpenAI: Boolean(process.env.OPENAI_API_KEY),
      },
    });
  } catch (err) {
    next(err);
  }
};
