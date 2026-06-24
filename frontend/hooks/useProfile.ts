'use client';

import { useState, useEffect, useCallback } from 'react';
import { OnChainProfile, DBProfile } from '@/types';
import { hasProfile, getOnChainProfile } from '@/lib/aptos';
import { fetchProfile } from '@/lib/api';

interface UseProfileReturn {
  onChainProfile: OnChainProfile | null;
  dbProfile:      DBProfile | null;
  hasProfileOnChain: boolean;
  isLoading:      boolean;
  refresh:        () => Promise<void>;
}

export function useProfile(address: string | null): UseProfileReturn {
  const [onChainProfile, setOnChainProfile] = useState<OnChainProfile | null>(null);
  const [dbProfile,      setDbProfile]      = useState<DBProfile | null>(null);
  const [hasProfileOnChain, setHasProfileOnChain] = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);

  const refresh = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const [exists, onChain, db] = await Promise.all([
        hasProfile(address),
        getOnChainProfile(address),
        fetchProfile(address),
      ]);
      setHasProfileOnChain(exists);
      setOnChainProfile(onChain);
      setDbProfile(db);
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { onChainProfile, dbProfile, hasProfileOnChain, isLoading, refresh };
}
