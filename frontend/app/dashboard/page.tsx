'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useProfile } from '@/hooks/useProfile';
import { Navbar } from '@/components/layout/Navbar';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { PostForm } from '@/components/posts/PostForm';
import { PostCard } from '@/components/posts/PostCard';
import { WalletButton } from '@/components/wallet/WalletButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchPosts } from '@/lib/api';
import { getPostCount } from '@/lib/aptos';
import { Post } from '@/types';
import { PlusCircle, RefreshCw, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { account, isConnected } = useWallet();
  const { onChainProfile, hasProfileOnChain, isLoading: profileLoading, refresh } = useProfile(account?.address ?? null);

  const [posts,     setPosts]     = useState<Post[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [postsLoading, setPostsLoading] = useState(false);

  const loadPosts = async () => {
    if (!account?.address) return;
    setPostsLoading(true);
    try {
      const [postsData, count] = await Promise.all([
        fetchPosts(account.address, 1, 5),
        getPostCount(account.address),
      ]);
      setPosts(postsData.posts);
      setPostCount(count);
    } catch {}
    finally { setPostsLoading(false); }
  };

  useEffect(() => { if (account?.address) loadPosts(); }, [account?.address]);

  const handlePostCreated = () => { loadPosts(); refresh(); };

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-4xl">
            👛
          </div>
          <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground max-w-sm">
            Connect your Petra wallet to access your ChainProfile AI dashboard.
          </p>
          <WalletButton size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your Web3 identity hub</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { refresh(); loadPosts(); }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile */}
          <div className="space-y-4">
            {profileLoading ? (
              <Card className="glass-card"><CardContent className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></CardContent></Card>
            ) : hasProfileOnChain && onChainProfile ? (
              <ProfileCard
                address={account.address}
                profile={onChainProfile}
                postCount={postCount}
                showActions
                onEdit={() => {}}
              />
            ) : (
              <Card className="glass-card border-purple-500/20 text-center">
                <CardContent className="py-10 space-y-4">
                  <div className="text-4xl">🆔</div>
                  <h3 className="font-bold">No Profile Yet</h3>
                  <p className="text-sm text-muted-foreground">Create your on-chain identity to start earning reputation.</p>
                  <Link href="/profile/create">
                    <Button variant="neon" size="sm">
                      <PlusCircle className="w-4 h-4" />
                      Create Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Posts */}
          <div className="lg:col-span-2 space-y-4">
            {hasProfileOnChain ? (
              <PostForm walletAddress={account.address} onPostCreated={handlePostCreated} />
            ) : (
              <Card className="glass-card border-border/30">
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  Create a profile to start publishing posts.
                </CardContent>
              </Card>
            )}

            {postsLoading ? (
              <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
            ) : posts.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground">Recent Posts</h2>
                {posts.map((post) => <PostCard key={post._id} post={post} />)}
              </div>
            ) : hasProfileOnChain ? (
              <Card className="glass-card border-border/30">
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  No posts yet. Publish your first post above!
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
