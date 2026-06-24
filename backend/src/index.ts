import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/errorHandler';

import analyzeRoutes   from './routes/analyze';
import profileRoutes   from './routes/profile';
import postsRoutes     from './routes/posts';
import analyticsRoutes from './routes/analytics';

const app  = express();
const PORT = parseInt(process.env.PORT || '5000');

// ── Security & Logging ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:   'ok',
    service:  'ChainProfile AI API',
    version:  '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/analyze',   analyzeRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/posts',     postsRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── 404 & Error Handling ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Database & Server Start ───────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chainprofile';

  try {
    await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connected: ${mongoUri}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    console.warn('⚠️  Server starting without database — some routes will fail');
  }

  app.listen(PORT, () => {
    console.log(`🚀 ChainProfile AI API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   AI endpoint: http://localhost:${PORT}/api/analyze`);
    console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✅ configured' : '⚠️  using keyword fallback'}`);
  });
}

bootstrap();

export default app;
