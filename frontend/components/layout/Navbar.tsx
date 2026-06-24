'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, BarChart3, User, PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { shortenAddress } from '@/lib/utils';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/dashboard',        label: 'Dashboard',  icon: Zap },
  { href: '/profile/create',   label: 'Profile',    icon: User },
  { href: '/analytics',        label: 'Analytics',  icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const { account, isConnected, walletAvail, connect, disconnect, network } = useWallet();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/50 transition-all">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">ChainProfile AI</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname === href
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <Search className="w-4 h-4" />
              Explore
            </Link>
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {network && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {network}
              </span>
            )}
            {!walletAvail ? (
              <span className="text-xs text-muted-foreground">Install Petra</span>
            ) : isConnected && account ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {shortenAddress(account.address)}
                </span>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="neon" size="sm" onClick={connect}>
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
