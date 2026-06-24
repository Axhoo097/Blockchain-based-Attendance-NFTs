import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/** Validate request body against a Zod schema */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };

// ── Shared Zod schemas ────────────────────────────────────────────────────────

export const analyzeSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(1000, 'Content must be under 1000 characters')
    .transform((s) => s.trim()),
  walletAddress: z
    .string()
    .min(1, 'Wallet address is required')
    .regex(/^0x[a-fA-F0-9]+$/, 'Invalid Aptos wallet address')
    .transform((s) => s.toLowerCase()),
});

export const createProfileSchema = z.object({
  walletAddress: z
    .string()
    .min(1)
    .regex(/^0x[a-fA-F0-9]+$/)
    .transform((s) => s.toLowerCase()),
  name:     z.string().min(1).max(100).transform((s) => s.trim()),
  bio:      z.string().max(500).default('').transform((s) => s.trim()),
  skills:   z.array(z.string().max(50)).max(20).default([]),
  ipfsHash: z.string().max(200).default(''),
  txHash:   z.string().default(''),
});

export const createPostSchema = z.object({
  walletAddress: z
    .string()
    .min(1)
    .regex(/^0x[a-fA-F0-9]+$/)
    .transform((s) => s.toLowerCase()),
  content: z
    .string()
    .min(1)
    .max(1000)
    .transform((s) => s.trim()),
  txHash:  z.string().default(''),
});
