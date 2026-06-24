# ChainProfile AI

> **Production-level Web3 identity & reputation platform on Aptos**
>
> Build your decentralized identity, publish posts, earn reputation, and get AI-powered skill analysis.

---

## Architecture

```
chainprofile-ai/
├── aptos-contract/   Move smart contract (ChainProfile::profile)
├── frontend/         Next.js 15 + TypeScript + Tailwind + Shadcn
└── backend/          Node.js + Express + MongoDB + OpenAI
```

**Data flow:**
```
User → Petra Wallet → Aptos Devnet (on-chain truth)
                  ↕ tx hash
              Backend API → MongoDB (off-chain analytics + AI)
                        → OpenAI (skill analysis)
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 18.18.0
- Aptos CLI installed (`aptos --version`)
- MongoDB running locally (`mongod`)
- Petra Wallet Chrome extension

### 1. Deploy the Smart Contract

```bash
cd aptos-contract

# Initialize your account (if not already done)
aptos init --network devnet

# Compile and run tests
aptos move compile
aptos move test

# Deploy to devnet
aptos move publish --named-addresses ChainProfile=<your-address>
```

Update `frontend/.env.local`:
```
NEXT_PUBLIC_MODULE_ADDRESS=<your-deployed-address>
```

### 2. Start the Backend

```bash
cd backend

# Install dependencies (already done)
npm install

# Configure environment
cp .env.example .env
# Edit .env and set OPENAI_API_KEY (optional — keyword fallback used if empty)

# Start dev server
npm run dev
```

Backend runs at: `http://localhost:5000`

Health check: `http://localhost:5000/health`

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## API Reference

### POST /api/analyze
AI analysis of a post.

**Body:**
```json
{ "content": "I built an AI chatbot in Python", "walletAddress": "0x..." }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "sentiment": "positive",
      "skillsDetected": ["Python", "AI", "Machine Learning"],
      "technology": "AI",
      "experienceLevel": "intermediate",
      "score": 75
    },
    "reputationPoints": 60
  }
}
```

### GET /api/profile/:address
Fetch off-chain profile from MongoDB.

### POST /api/profile
Create or update profile in MongoDB.

### GET /api/posts/:address
Get paginated posts for an address.

### POST /api/posts
Create post + trigger AI analysis.

### GET /api/analytics
Platform-wide statistics.

### GET /api/analytics/leaderboard
Top 10 users by reputation.

---

## Smart Contract Functions

| Function | Type | Description |
|----------|------|-------------|
| `create_profile(name, bio, skills, ipfs_hash)` | Entry | Create on-chain profile (+10 rep) |
| `update_profile(name, bio, skills, ipfs_hash)` | Entry | Update existing profile |
| `store_post(content)` | Entry | Store post on-chain (+5 rep) |
| `update_reputation(points)` | Entry | Add reputation points |
| `has_profile(addr)` | View | Check if profile exists |
| `get_profile(addr)` | View | Read profile data (free) |
| `get_reputation(addr)` | View | Get reputation score (free) |
| `get_post_count(addr)` | View | Get post count (free) |
| `get_posts(addr)` | View | Get all posts (free) |

## Reputation System

| Action | Points |
|--------|--------|
| Create profile | +10 |
| Publish a post | +5 |
| AI detects a technical skill | +20 per skill (max 3) |
| AI score ≥ 80 | +10 bonus |
| Expert-level detected | +15 bonus |

## Reputation Tiers

| Tier | Min Points |
|------|-----------|
| 🔰 Novice | 0 |
| 🔨 Builder | 50 |
| 💻 Developer | 150 |
| ⚡ Expert | 300 |
| 🏗️ Architect | 500 |
| 🌟 Legend | 1000 |

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `OPENAI_API_KEY` | OpenAI API key (optional — fallback used if not set) |
| `ALLOWED_ORIGINS` | CORS allowed origins |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API base URL |
| `NEXT_PUBLIC_MODULE_ADDRESS` | Deployed contract address |
| `NEXT_PUBLIC_NETWORK` | Aptos network (devnet) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Aptos + Move |
| Frontend | Next.js 15.5 + TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Wallet | Petra (window.aptos) |
| Aptos SDK | @aptos-labs/ts-sdk v1.39.0 |
| Backend | Express.js + TypeScript |
| Database | MongoDB + Mongoose |
| AI | OpenAI GPT-4o-mini + keyword fallback |
| Charts | Chart.js + react-chartjs-2 |
| Animations | Framer Motion |

---

## License

MIT
