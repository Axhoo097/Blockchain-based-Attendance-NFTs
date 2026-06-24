'use client';

import { OnChainProfile } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getReputationTier, getNextTier, shortenAddress, explorerAccountUrl } from '@/lib/utils';
import { ExternalLink, Star, FileText, Clock } from 'lucide-react';

interface ProfileCardProps {
  address:        string;
  profile:        OnChainProfile;
  postCount?:     number;
  showActions?:   boolean;
  onEdit?:        () => void;
}

export function ProfileCard({
  address,
  profile,
  postCount = 0,
  showActions = false,
  onEdit,
}: ProfileCardProps) {
  const tier     = getReputationTier(profile.reputation);
  const nextTier = getNextTier(profile.reputation);
  const progress = nextTier
    ? ((profile.reputation - tier.minRep) / (nextTier.minRep - tier.minRep)) * 100
    : 100;

  return (
    <Card className="glass-card border-purple-500/20 overflow-hidden">
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600" />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30 flex-shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
              <a
                href={explorerAccountUrl(address)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-cyan-400 transition-colors"
              >
                {shortenAddress(address, 6)}
                <ExternalLink className="w-3 h-3" />
              </a>
              <div className="flex items-center gap-1.5 mt-1">
                <span style={{ color: tier.color }} className="text-sm">{tier.icon}</span>
                <span className="text-xs font-semibold" style={{ color: tier.color }}>
                  {tier.name}
                </span>
              </div>
            </div>
          </div>

          {/* Reputation */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-2xl font-bold gradient-text-gold">{profile.reputation}</span>
            </div>
            <span className="text-xs text-muted-foreground">Reputation</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
        )}

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="skill">{skill}</Badge>
            ))}
          </div>
        )}

        {/* Reputation Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{tier.name}</span>
            {nextTier && <span>Next: {nextTier.name} ({nextTier.minRep} pts)</span>}
          </div>
          <Progress value={progress} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-lg font-bold">{postCount}</span>
            </div>
            <span className="text-xs text-muted-foreground">Posts</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold">
                {new Date(profile.createdAt * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Joined</span>
          </div>
        </div>

        {showActions && onEdit && (
          <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
            Edit Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
