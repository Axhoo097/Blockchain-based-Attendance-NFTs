'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buildCreateProfileTx, buildUpdateProfileTx, waitForTx } from '@/lib/aptos';
import { upsertProfile } from '@/lib/api';
import { explorerTxUrl } from '@/lib/utils';
import { Plus, X, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { OnChainProfile } from '@/types';

interface CreateProfileFormProps {
  walletAddress: string;
  existingProfile?: OnChainProfile | null;
  onSuccess?: () => void;
}

export function CreateProfileForm({
  walletAddress,
  existingProfile,
  onSuccess,
}: CreateProfileFormProps) {
  const router = useRouter();
  const isEditing = Boolean(existingProfile);

  const [name,     setName]     = useState(existingProfile?.name || '');
  const [bio,      setBio]      = useState(existingProfile?.bio || '');
  const [skills,   setSkills]   = useState<string[]>(existingProfile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [status,   setStatus]   = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [txHash,   setTxHash]   = useState('');

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s) && skills.length < 20) {
      setSkills([...skills, s]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (!window.aptos) { toast.error('Petra wallet not found'); return; }

    setStatus('pending');
    try {
      // 1. Submit on-chain transaction
      const tx = isEditing
        ? buildUpdateProfileTx(name, bio, skills, '')
        : buildCreateProfileTx(name, bio, skills, '');

      const { hash } = await window.aptos.signAndSubmitTransaction(tx);
      setTxHash(hash);
      toast.loading('Waiting for transaction confirmation…', { id: 'tx' });

      await waitForTx(hash);
      toast.dismiss('tx');

      // 2. Save to MongoDB via backend
      await upsertProfile({ walletAddress, name, bio, skills, ipfsHash: '', txHash: hash });

      setStatus('success');
      toast.success(isEditing ? 'Profile updated!' : 'Profile created on Aptos! 🎉');
      onSuccess?.();
      if (!isEditing) router.push('/dashboard');
    } catch (err: unknown) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      toast.error(msg);
    }
  };

  if (status === 'success') {
    return (
      <Card className="glass-card border-emerald-500/20 text-center py-8">
        <CardContent className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Profile {isEditing ? 'Updated' : 'Created'}!
          </h3>
          <p className="text-muted-foreground text-sm">Your profile is now live on the Aptos blockchain.</p>
          {txHash && (
            <a
              href={explorerTxUrl(txHash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:underline"
            >
              View transaction <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Button variant="neon" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="gradient-text">
          {isEditing ? 'Update Profile' : 'Create On-Chain Profile'}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update your profile data on the Aptos blockchain.'
            : 'Your profile will be stored permanently on the Aptos blockchain.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Alice Dev"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground">{name.length}/100</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell the world about yourself…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{bio.length}/500</p>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills (up to 20)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Move, TypeScript, Rust…"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
              />
              <Button type="button" variant="secondary" size="icon" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="skill" className="gap-1 cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="neon"
            size="lg"
            className="w-full"
            disabled={status === 'pending'}
          >
            {status === 'pending' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? 'Updating…' : 'Creating Profile…'}</>
            ) : (
              isEditing ? '⬆ Update on Aptos' : '⬆ Create on Aptos'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This will open your Petra wallet to sign the transaction. A small gas fee applies.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
