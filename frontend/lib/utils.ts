import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReputationTier } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(addr: string, chars = 4): string {
  if (!addr) return '';
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function explorerTxUrl(hash: string): string {
  return `https://explorer.aptoslabs.com/txn/${hash}?network=devnet`;
}

export function explorerAccountUrl(addr: string): string {
  return `https://explorer.aptoslabs.com/account/${addr}?network=devnet`;
}

export const REPUTATION_TIERS: ReputationTier[] = [
  { name: 'Novice',      minRep: 0,    color: '#94a3b8', icon: '🔰' },
  { name: 'Builder',     minRep: 50,   color: '#34d399', icon: '🔨' },
  { name: 'Developer',   minRep: 150,  color: '#06b6d4', icon: '💻' },
  { name: 'Expert',      minRep: 300,  color: '#a855f7', icon: '⚡' },
  { name: 'Architect',   minRep: 500,  color: '#f59e0b', icon: '🏗️' },
  { name: 'Legend',      minRep: 1000, color: '#f472b6', icon: '🌟' },
];

export function getReputationTier(reputation: number): ReputationTier {
  return (
    [...REPUTATION_TIERS].reverse().find((t) => reputation >= t.minRep) ??
    REPUTATION_TIERS[0]
  );
}

export function getNextTier(reputation: number): ReputationTier | null {
  return REPUTATION_TIERS.find((t) => reputation < t.minRep) ?? null;
}
