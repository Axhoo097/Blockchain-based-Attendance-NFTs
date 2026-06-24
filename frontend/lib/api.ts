import axios from 'axios';
import { DBProfile, Post, AnalyticsData, LeaderboardEntry, AIAnalysis } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Profile ───────────────────────────────────────────────────────────────────

export async function fetchProfile(address: string): Promise<DBProfile | null> {
  try {
    const { data } = await api.get<{ success: boolean; data: DBProfile }>(
      `/api/profile/${address}`
    );
    return data.data;
  } catch {
    return null;
  }
}

export async function upsertProfile(payload: {
  walletAddress: string;
  name: string;
  bio: string;
  skills: string[];
  ipfsHash: string;
  txHash: string;
}): Promise<DBProfile> {
  const { data } = await api.post<{ success: boolean; data: DBProfile }>(
    '/api/profile',
    payload
  );
  return data.data;
}

export async function updateReputation(address: string, points: number): Promise<void> {
  await api.patch(`/api/profile/${address}/reputation`, { points });
}

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function fetchPosts(
  address: string,
  page = 1,
  limit = 10
): Promise<{ posts: Post[]; total: number; pages: number }> {
  const { data } = await api.get(`/api/posts/${address}`, {
    params: { page, limit },
  });
  return data.data;
}

export async function createPost(payload: {
  walletAddress: string;
  content: string;
  txHash: string;
}): Promise<{ post: Post; aiAnalysis: AIAnalysis; reputationEarned: number }> {
  const { data } = await api.post('/api/posts', payload);
  return data.data;
}

// ── AI Analysis ───────────────────────────────────────────────────────────────

export async function analyzeContent(
  content: string,
  walletAddress: string
): Promise<{ analysis: AIAnalysis; reputationPoints: number }> {
  const { data } = await api.post('/api/analyze', { content, walletAddress });
  return { analysis: data.data.analysis, reputationPoints: data.data.reputationPoints };
}

// ── Analytics ──────────────────────────────────────────────────────────────────

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const { data } = await api.get<{ success: boolean; data: AnalyticsData }>('/api/analytics');
  return data.data;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<{ success: boolean; data: LeaderboardEntry[] }>(
    '/api/analytics/leaderboard'
  );
  return data.data;
}
