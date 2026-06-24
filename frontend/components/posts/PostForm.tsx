'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildStorePostTx, buildUpdateReputationTx, waitForTx } from '@/lib/aptos';
import { createPost } from '@/lib/api';
import { AIAnalysis } from '@/types';
import { explorerTxUrl } from '@/lib/utils';
import { Send, Loader2, Sparkles, ExternalLink } from 'lucide-react';

const MAX_LEN = 1000;

interface PostFormProps {
  walletAddress: string;
  onPostCreated?: () => void;
}

interface AIResult {
  analysis:         AIAnalysis;
  reputationEarned: number;
  txHash:           string;
}

export function PostForm({ walletAddress, onPostCreated }: PostFormProps) {
  const [content,  setContent]  = useState('');
  const [status,   setStatus]   = useState<'idle' | 'pending' | 'ai' | 'done'>('idle');
  const [aiResult, setAiResult] = useState<AIResult | null>(null);

  const charClass = content.length > MAX_LEN * 0.9 ? 'text-amber-400' : 'text-muted-foreground';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > MAX_LEN) return;
    if (!window.aptos) { toast.error('Wallet not connected'); return; }

    setStatus('pending');
    try {
      // 1. Store post on-chain
      const { hash } = await window.aptos.signAndSubmitTransaction(buildStorePostTx(content));
      toast.loading('Confirming transaction…', { id: 'post' });
      await waitForTx(hash);
      toast.dismiss('post');

      // 2. Save to MongoDB + run AI analysis
      setStatus('ai');
      toast.loading('Running AI analysis…', { id: 'ai' });
      const result = await createPost({ walletAddress, content, txHash: hash });
      toast.dismiss('ai');

      // 3. If AI detected skills, award reputation on-chain
      if (result.reputationEarned > 5) {
        const bonusPoints = result.reputationEarned - 5;
        try {
          const repTx = await window.aptos.signAndSubmitTransaction(
            buildUpdateReputationTx(bonusPoints)
          );
          await waitForTx(repTx.hash);
        } catch {
          // Non-critical — reputation can be retried
        }
      }

      setAiResult({ analysis: result.aiAnalysis, reputationEarned: result.reputationEarned, txHash: hash });
      setStatus('done');
      setContent('');
      toast.success(`Post published! +${result.reputationEarned} reputation earned 🎉`);
      onPostCreated?.();
    } catch (err: unknown) {
      setStatus('idle');
      toast.error(err instanceof Error ? err.message : 'Failed to publish post');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card border-cyan-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4 text-cyan-400" />
            Publish a Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Textarea
                placeholder="Share what you've built, learned, or accomplished on the blockchain…"
                value={content}
                onChange={(e) => { setContent(e.target.value); setAiResult(null); }}
                rows={4}
                disabled={status === 'pending' || status === 'ai'}
              />
              <span className={`absolute bottom-2 right-3 text-xs ${charClass}`}>
                {content.length}/{MAX_LEN}
              </span>
            </div>
            <Button
              type="submit"
              variant="neon"
              className="w-full"
              disabled={!content.trim() || content.length > MAX_LEN || status !== 'idle'}
            >
              {status === 'pending' ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing…</>
               : status === 'ai'   ? <><Sparkles className="w-4 h-4 animate-pulse" /> Analyzing with AI…</>
               : <><Send className="w-4 h-4" /> Publish on Chain</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Result Card */}
      {aiResult && status === 'done' && (
        <Card className="glass-card border-purple-500/20 animate-fade-in">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-300">
                <Sparkles className="w-4 h-4" />
                AI Analysis Result
              </span>
              <span className="text-xs font-bold text-amber-400">+{aiResult.reputationEarned} rep</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-muted-foreground mb-0.5">Sentiment</div>
                <div className="font-semibold capitalize">{aiResult.analysis.sentiment}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-muted-foreground mb-0.5">Level</div>
                <div className="font-semibold capitalize">{aiResult.analysis.experienceLevel}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-muted-foreground mb-0.5">Score</div>
                <div className="font-bold text-amber-400">{aiResult.analysis.score}/100</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-muted-foreground mb-0.5">Domain</div>
                <div className="font-semibold truncate">{aiResult.analysis.technology || '—'}</div>
              </div>
            </div>

            {aiResult.analysis.skillsDetected.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {aiResult.analysis.skillsDetected.map((s) => (
                  <Badge key={s} variant="skill">{s}</Badge>
                ))}
              </div>
            )}

            <a
              href={explorerTxUrl(aiResult.txHash)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
            >
              View on Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
