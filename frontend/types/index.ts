// Central TypeScript type definitions for ChainProfile AI

export interface WalletAccount {
  address:   string;
  publicKey: string;
}

export interface OnChainProfile {
  name:       string;
  bio:        string;
  skills:     string[];
  reputation: number;
  createdAt:  number;
  ipfsHash:   string;
}

export interface DBProfile {
  walletAddress: string;
  profileData: {
    name:     string;
    bio:      string;
    skills:   string[];
    ipfsHash: string;
  };
  reputation:  number;
  totalPosts:  number;
  isVerified:  boolean;
  createdAt:   string;
}

export interface AIAnalysis {
  sentiment:       'positive' | 'negative' | 'neutral';
  skillsDetected:  string[];
  technology:      string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  score:           number;
}

export interface Post {
  _id:           string;
  walletAddress: string;
  content:       string;
  txHash:        string;
  aiAnalysis:    AIAnalysis | null;
  reputationGained: number;
  createdAt:     string;
}

export interface AnalyticsData {
  totalUsers:    number;
  totalPosts:    number;
  avgReputation: number;
  maxReputation: number;
  topSkills:     Array<{ skill: string; count: number }>;
  recentActivity: Array<{ _id: string; count: number }>;
}

export interface LeaderboardEntry {
  walletAddress: string;
  profileData:   { name: string };
  reputation:    number;
  totalPosts:    number;
}

export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ReputationTier {
  name:     string;
  minRep:   number;
  color:    string;
  icon:     string;
}

declare global {
  interface Window {
    aptos?: {
      connect():                           Promise<WalletAccount>;
      disconnect():                        Promise<void>;
      account():                           Promise<WalletAccount>;
      isConnected():                       Promise<boolean>;
      signAndSubmitTransaction(tx: object): Promise<{ hash: string }>;
      network():                           Promise<{ name: string; chainId: string }>;
    };
  }
}
