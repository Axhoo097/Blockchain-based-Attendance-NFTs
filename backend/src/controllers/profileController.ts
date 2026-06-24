import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';

/** GET /api/profile/:address */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const address = req.params.address.toLowerCase();
    const user = await User.findOne({ walletAddress: address });

    if (!user) {
      throw new AppError('Profile not found', 404);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/** POST /api/profile — upsert (create or update) */
export const upsertProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { walletAddress, name, bio, skills, ipfsHash, txHash } = req.body as {
      walletAddress: string;
      name: string;
      bio: string;
      skills: string[];
      ipfsHash: string;
      txHash: string;
    };

    const existing = await User.findOne({ walletAddress });
    const isNew = !existing;

    const user = await User.findOneAndUpdate(
      { walletAddress },
      {
        $set: {
          'profileData.name':     name,
          'profileData.bio':      bio,
          'profileData.skills':   skills,
          'profileData.ipfsHash': ipfsHash,
        },
        $setOnInsert: {
          walletAddress,
          reputation: 10,
          totalPosts: 0,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(isNew ? 201 : 200).json({
      success: true,
      message: isNew ? 'Profile created' : 'Profile updated',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/profile/:address/exists */
export const profileExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const address = req.params.address.toLowerCase();
    const exists = await User.exists({ walletAddress: address });
    res.json({ success: true, exists: Boolean(exists) });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/profile/:address/reputation */
export const updateReputation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const address = req.params.address.toLowerCase();
    const { points } = req.body as { points: number };

    const user = await User.findOneAndUpdate(
      { walletAddress: address },
      { $inc: { reputation: points } },
      { new: true }
    );

    if (!user) throw new AppError('Profile not found', 404);

    res.json({ success: true, data: { reputation: user.reputation } });
  } catch (err) {
    next(err);
  }
};
