'use client';

import { useState, useEffect, useCallback } from 'react';
import { WalletAccount } from '@/types';

interface UseWalletReturn {
  account:      WalletAccount | null;
  isConnected:  boolean;
  isLoading:    boolean;
  walletAvail:  boolean;
  network:      string;
  connect:      () => Promise<void>;
  disconnect:   () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const [account,     setAccount]     = useState<WalletAccount | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [walletAvail, setWalletAvail] = useState(false);
  const [network,     setNetwork]     = useState('');

  // Detect Petra wallet
  useEffect(() => {
    const check = () => setWalletAvail(typeof window !== 'undefined' && typeof window.aptos !== 'undefined');
    if (document.readyState === 'complete') check();
    else window.addEventListener('load', check);
    return () => window.removeEventListener('load', check);
  }, []);

  // Auto-reconnect on mount
  useEffect(() => {
    if (!walletAvail) return;
    (async () => {
      try {
        const connected = await window.aptos!.isConnected();
        if (connected) {
          const acc = await window.aptos!.account();
          setAccount(acc);
          const net = await window.aptos!.network();
          setNetwork(net.name);
        }
      } catch {}
    })();
  }, [walletAvail]);

  const connect = useCallback(async () => {
    if (!window.aptos) return;
    setIsLoading(true);
    try {
      const acc = await window.aptos.connect();
      setAccount(acc);
      const net = await window.aptos.network();
      setNetwork(net.name);
    } catch (err) {
      console.error('Wallet connection failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await window.aptos?.disconnect();
    } catch {}
    setAccount(null);
    setNetwork('');
  }, []);

  return {
    account,
    isConnected: Boolean(account),
    isLoading,
    walletAvail,
    network,
    connect,
    disconnect,
  };
}
