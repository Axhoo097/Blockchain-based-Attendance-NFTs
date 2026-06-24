'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { PostCard } from '@/components/posts/PostCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getOnChainProfile, getPostCount } from '@/lib/aptos';
import { fetchPosts } from '@/lib/api';
import { OnChainProfile, Post } from '@/types';
import { Search, Loader2, User } from 'lucide-react';

export default function ProfileExplorerPage() {
  const [address,  setAddress]  = useState('');
  const [profile,  setProfile]  = useState<OnChainProfile | null>(null);
  const [posts,    setPosts]    = useState<Post[]>([]);
  const [postCount,setPostCount]= useState(0);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = address.trim().toLowerCase();
    if (!addr) return;
    setLoading(true);
    setSearched(true);
    try {
      const [p, count, postsData] = await Promise.all([
        getOnChainProfile(addr),
        getPostCount(addr),
        fetchPosts(addr, 1, 10),
      ]);
      setProfile(p);
      setPostCount(count);
      setPosts(postsData.posts);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">Explore Profiles</h1>
          <p className="text-sm text-muted-foreground mt-1">Search any Aptos address to view their on-chain profile.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <Input
            placeholder="0x… Aptos wallet address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="font-mono"
          />
          <Button type="submit" variant="neon" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
        </form>

        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
          </div>
        )}

        {!loading && searched && !profile && (
          <Card className="glass-card text-center py-16">
            <CardContent>
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No profile found</h3>
              <p className="text-sm text-muted-foreground">This address hasn&apos;t created an on-chain profile yet.</p>
            </CardContent>
          </Card>
        )}

        {!loading && profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <ProfileCard address={address.trim().toLowerCase()} profile={profile} postCount={postCount} />
            </div>
            <div className="lg:col-span-2 space-y-3">
              {posts.length > 0 ? (
                <>
                  <h2 className="text-sm font-semibold text-muted-foreground">Posts ({postCount})</h2>
                  {posts.map((post) => <PostCard key={post._id} post={post} />)}
                </>
              ) : (
                <Card className="glass-card">
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No posts yet from this address.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
