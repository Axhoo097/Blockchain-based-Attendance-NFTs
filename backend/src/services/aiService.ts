import OpenAI from 'openai';

export interface AIAnalysisResult {
  sentiment:       'positive' | 'negative' | 'neutral';
  skillsDetected:  string[];
  technology:      string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  score:           number;
}

// ── Keyword-based fallback analyzer ──────────────────────────────────────────
const TECH_KEYWORDS: Record<string, string[]> = {
  'Python':         ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
  'JavaScript':     ['javascript', 'js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
  'TypeScript':     ['typescript', 'ts', 'tsx'],
  'Rust':           ['rust', 'cargo', 'rustlang'],
  'Move':           ['move', 'aptos', 'sui', 'movevm'],
  'Solidity':       ['solidity', 'ethereum', 'smart contract', 'evm', 'web3'],
  'Go':             ['golang', ' go ', 'gin', 'fiber'],
  'Java':           ['java', 'spring', 'springboot', 'jvm'],
  'Machine Learning':['machine learning', 'ml ', 'neural network', 'deep learning', 'tensorflow', 'pytorch', 'llm'],
  'AI':             ['ai ', 'artificial intelligence', 'chatgpt', 'openai', 'gpt', 'llm', 'langchain'],
  'Blockchain':     ['blockchain', 'defi', 'nft', 'dao', 'crypto', 'web3', 'dapp'],
  'Cloud':          ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'devops', 'ci/cd'],
  'Database':       ['mongodb', 'postgresql', 'mysql', 'redis', 'sql', 'database'],
};

function keywordAnalysis(content: string): AIAnalysisResult {
  const lower = content.toLowerCase();
  const detected: string[] = [];

  for (const [skill, keywords] of Object.entries(TECH_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(skill);
    }
  }

  const positiveWords = ['built', 'created', 'deployed', 'shipped', 'launched', 'achieved', 'completed', 'won', 'excited', 'great'];
  const negativeWords = ['failed', 'broke', 'bug', 'issue', 'problem', 'error', 'stuck', 'confused'];

  const posCount = positiveWords.filter((w) => lower.includes(w)).length;
  const negCount = negativeWords.filter((w) => lower.includes(w)).length;
  const sentiment = posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral';

  const expertWords  = ['architected', 'optimized', 'production', 'scale', 'performance'];
  const advWords     = ['deployed', 'integrated', 'implemented', 'designed'];
  const interWords   = ['built', 'created', 'developed', 'shipped'];

  let experienceLevel: AIAnalysisResult['experienceLevel'] = 'beginner';
  if (expertWords.some((w) => lower.includes(w)))      experienceLevel = 'expert';
  else if (advWords.some((w) => lower.includes(w)))    experienceLevel = 'advanced';
  else if (interWords.some((w) => lower.includes(w)))  experienceLevel = 'intermediate';

  const techCategory = detected.length > 0 ? detected[0] : 'General';
  const score = Math.min(100, 30 + detected.length * 15 + (sentiment === 'positive' ? 10 : 0));

  return {
    sentiment,
    skillsDetected: detected,
    technology: techCategory,
    experienceLevel,
    score,
  };
}

// ── OpenAI analyzer ───────────────────────────────────────────────────────────
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

async function openaiAnalysis(content: string): Promise<AIAnalysisResult> {
  const client = getOpenAIClient();
  if (!client) throw new Error('OpenAI not configured');

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a technical skill analyzer for a Web3 developer platform.
Analyze the given post/message and respond ONLY with a JSON object matching this exact shape:
{
  "sentiment": "positive" | "negative" | "neutral",
  "skillsDetected": ["Skill1", "Skill2"],
  "technology": "primary technology or domain",
  "experienceLevel": "beginner" | "intermediate" | "advanced" | "expert",
  "score": <integer 0-100>
}
Do not include any explanation or extra text.`,
      },
      { role: 'user', content },
    ],
    temperature: 0.2,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0].message.content ?? '{}';
  const parsed = JSON.parse(raw) as AIAnalysisResult;

  // Sanitize
  return {
    sentiment:       ['positive', 'negative', 'neutral'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral',
    skillsDetected:  Array.isArray(parsed.skillsDetected) ? parsed.skillsDetected.slice(0, 10) : [],
    technology:      typeof parsed.technology === 'string' ? parsed.technology : '',
    experienceLevel: ['beginner', 'intermediate', 'advanced', 'expert'].includes(parsed.experienceLevel)
      ? parsed.experienceLevel : 'beginner',
    score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function analyzeContent(content: string): Promise<AIAnalysisResult> {
  try {
    if (process.env.OPENAI_API_KEY) {
      return await openaiAnalysis(content);
    }
  } catch (err) {
    console.warn('[AI Service] OpenAI failed, using keyword fallback:', (err as Error).message);
  }
  return keywordAnalysis(content);
}
