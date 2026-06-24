'use client';

import { useWallet } from '@/hooks/useWallet';
import { shortenAddress } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Wallet, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xl';
}

export function WalletButton({ className, size = 'default' }: WalletButtonProps) {
  const { account, isConnected, isLoading, walletAvail, connect, disconnect, network } = useWallet();

  if (!walletAvail) {
    return (
      <a
        href="https://petra.app"
        target="_blank"
        rel="noreferrer"
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-all',
          className
        )}
      >
        <WifiOff className="w-4 h-4" />
        Install Petra Wallet
      </a>
    );
  }

  if (isConnected && account) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-sm">{shortenAddress(account.address)}</span>
          {network && (
            <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded">
              {network}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="neon"
      size={size}
      onClick={connect}
      disabled={isLoading}
      className={cn('gap-2', className)}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      {isLoading ? 'Connecting…' : 'Connect Petra Wallet'}
    </Button>
  );
}
