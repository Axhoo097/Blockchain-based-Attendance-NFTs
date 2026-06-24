'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { WalletButton } from '@/components/wallet/WalletButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Brain, BarChart3, ArrowRight, Github } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'On-Chain Identity',
    desc: 'Your profile lives permanently on the Aptos blockchain. Censorship-proof, self-sovereign, and always yours.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Brain,
    title: 'AI Skill Analysis',
    desc: 'Every post is analyzed by GPT-4o. Detect skills, experience level, sentiment, and earn reputation automatically.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: Zap,
    title: 'Reputation Engine',
    desc: 'Earn points for creating profiles, publishing posts, and demonstrating technical skills. Your reputation is on-chain.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Real-time platform analytics. Top skills, user growth, leaderboards — all powered by MongoDB aggregations.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
];

const STATS = [
  { label: 'Blockchain', value: 'Aptos' },
  { label: 'AI Model',   value: 'GPT-4o' },
  { label: 'Storage',    value: 'Move + MongoDB' },
  { label: 'Network',    value: 'Devnet' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen grid-bg">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[600px] h-[600px] bg-purple-600 -top-48 -left-24" />
        <div className="orb w-[500px] h-[500px] bg-cyan-500 top-1/2 -right-48" />
        <div className="orb w-[400px] h-[400px] bg-purple-800 bottom-0 left-1/3" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-border/50 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">ChainProfile AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/analytics">
              <Button variant="ghost" size="sm">Analytics</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">Explore</Button>
            </Link>
            <WalletButton size="sm" />
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Live on Aptos Devnet
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
            <span className="gradient-text">Decentralized</span>
            <br />
            <span className="text-foreground">Identity + AI</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Build your on-chain Web3 identity. Publish posts, earn reputation,
            and let AI analyze your skills — all on the Aptos blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <WalletButton size="xl" />
            <Link href="/dashboard">
              <Button variant="glass" size="xl">
                View Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap justify-center gap-6 mt-16">
            {STATS.map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-lg font-bold gradient-text">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-3">
            Everything you need for a Web3 identity
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Built with Move smart contracts, OpenAI, MongoDB, and Next.js 15
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`glass-card rounded-xl p-6 border ${bg} hover:scale-[1.02] transition-all duration-200`}>
                <div className={`w-10 h-10 rounded-lg ${bg} border flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect Wallet', desc: 'Connect your Petra wallet to identify yourself on Aptos.' },
              { step: '02', title: 'Create Profile', desc: 'Store your name, bio, and skills permanently on-chain.' },
              { step: '03', title: 'Post & Earn', desc: 'Publish posts, get AI analysis, and earn reputation points.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-black gradient-text opacity-20 mb-2">{step}</div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="glass-card border-purple-500/20 rounded-2xl p-10">
            <h2 className="text-3xl font-bold mb-4">Ready to go on-chain?</h2>
            <p className="text-muted-foreground mb-8">
              Connect your Petra wallet and create your decentralized identity in under 2 minutes.
            </p>
            <WalletButton size="xl" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>ChainProfile AI — Built on Aptos · Powered by Move + OpenAI + MongoDB</p>
      </footer>
    </div>
  );
}
