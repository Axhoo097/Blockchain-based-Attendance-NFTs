'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchAnalytics, fetchLeaderboard } from '@/lib/api';
import { AnalyticsData, LeaderboardEntry } from '@/types';
import { shortenAddress, getReputationTier } from '@/lib/utils';
import { Users, FileText, Star, Trophy, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics,    setAnalytics]    = useState<AnalyticsData | null>(null);
  const [leaderboard,  setLeaderboard]  = useState<LeaderboardEntry[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchLeaderboard()])
      .then(([a, l]) => { setAnalytics(a); setLeaderboard(l); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = analytics
    ? [
        { label: 'Total Users',    value: analytics.totalUsers,    icon: Users,    color: 'text-purple-400' },
        { label: 'Total Posts',    value: analytics.totalPosts,    icon: FileText, color: 'text-cyan-400' },
        { label: 'Avg Reputation', value: analytics.avgReputation, icon: Star,     color: 'text-amber-400' },
        { label: 'Top Reputation', value: analytics.maxReputation, icon: Trophy,   color: 'text-emerald-400' },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform-wide statistics powered by MongoDB aggregations.</p>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="glass-card border-border hover:border-purple-500/30 transition-all">
                  <CardContent className="p-4">
                    <Icon className={`w-5 h-5 ${color} mb-2`} />
                    <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <AnalyticsCharts data={analytics} />

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <Card className="glass-card border-amber-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Reputation Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => {
                      const tier = getReputationTier(entry.reputation);
                      return (
                        <div key={entry.walletAddress} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                          <span className="text-lg font-black text-muted-foreground w-6 text-center">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">
                              {entry.profileData?.name || shortenAddress(entry.walletAddress)}
                            </div>
                            <div className="text-xs font-mono text-muted-foreground">{shortenAddress(entry.walletAddress)}</div>
                          </div>
                          <Badge variant="skill">{tier.icon} {tier.name}</Badge>
                          <div className="text-right">
                            <div className="font-bold text-amber-400">{entry.reputation}</div>
                            <div className="text-xs text-muted-foreground">{entry.totalPosts} posts</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              Could not load analytics. Make sure the backend server is running on port 5000.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
