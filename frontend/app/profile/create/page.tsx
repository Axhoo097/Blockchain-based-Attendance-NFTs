'use client';

import { Navbar } from '@/components/layout/Navbar';
import { CreateProfileForm } from '@/components/profile/CreateProfileForm';
import { useWallet } from '@/hooks/useWallet';
import { WalletButton } from '@/components/wallet/WalletButton';

export default function CreateProfilePage() {
  const { account, isConnected } = useWallet();

  if (!isConnected || !account) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
          <div className="text-4xl">🔐</div>
          <h1 className="text-2xl font-bold">Wallet Required</h1>
          <p className="text-muted-foreground">Connect your Petra wallet to create a profile.</p>
          <WalletButton size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">Create Your Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your identity will be stored permanently on the Aptos blockchain.
          </p>
        </div>
        <CreateProfileForm walletAddress={account.address} />
      </main>
    </div>
  );
}
