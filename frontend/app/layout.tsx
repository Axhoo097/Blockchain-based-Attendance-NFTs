import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono  = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: {
    default:  'ChainProfile AI — Web3 Identity & Reputation',
    template: '%s | ChainProfile AI',
  },
  description:
    'Build your decentralized identity on Aptos. Publish posts, earn reputation, and get AI-powered skill analysis.',
  keywords: ['Aptos', 'Web3', 'blockchain', 'identity', 'reputation', 'AI', 'Move', 'dApp'],
  openGraph: {
    title:       'ChainProfile AI',
    description: 'Your decentralized Web3 identity powered by Aptos & AI',
    type:        'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(222 47% 8%)',
              color:      '#f1f5f9',
              border:     '1px solid rgba(168,85,247,0.3)',
            },
          }}
        />
      </body>
    </html>
  );
}
