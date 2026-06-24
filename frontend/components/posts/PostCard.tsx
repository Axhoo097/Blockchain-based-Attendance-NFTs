'use client';

import { Post } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, explorerTxUrl, shortenAddress } from '@/lib/utils';
import { ExternalLink, Sparkles, Star } from 'lucide-react';

interface PostCardProps {
  post: Post;
  showAddress?: boolean;
}

const SENTIMENT_COLORS = {
  positive: 'text-emerald-400',
  negative: 'text-red-400',
  neutral:  'text-slate-400',
};

export function PostCard({ post, showAddress = false }: PostCardProps) {
  return (
    <Card className="glass-card border-border hover:border-purple-500/30 transition-all duration-200">
      <CardContent className="pt-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          {showAddress && (
            <span className="font-mono text-xs text-muted-foreground">
              {shortenAddress(post.walletAddress)}
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatDate(post.createdAt)}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground leading-relaxed">{post.content}</p>

        {/* AI Analysis */}
        {post.aiAnalysis && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2 border border-purple-500/10">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-semibold text-purple-300">
                <Sparkles className="w-3 h-3" />
                AI Analysis
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">
                  {post.aiAnalysis.score}/100
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className={`font-medium capitalize ${SENTIMENT_COLORS[post.aiAnalysis.sentiment]}`}>
                {post.aiAnalysis.sentiment}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground capitalize">{post.aiAnalysis.experienceLevel}</span>
              {post.aiAnalysis.technology && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-cyan-400">{post.aiAnalysis.technology}</span>
                </>
              )}
            </div>

            {post.aiAnalysis.skillsDetected.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.aiAnalysis.skillsDetected.map((s) => (
                  <Badge key={s} variant="skill" className="text-[10px] px-1.5 py-0">{s}</Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-amber-400/80">
            <Star className="w-3 h-3" />
            +{post.reputationGained} rep
          </span>
          {post.txHash && (
            <a
              href={explorerTxUrl(post.txHash)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-cyan-400 transition-colors"
            >
              On-chain <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
