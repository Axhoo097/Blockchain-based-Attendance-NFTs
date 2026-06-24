import mongoose, { Document, Schema } from 'mongoose';

export interface IAIAnalysis {
  sentiment:        string;
  skillsDetected:   string[];
  technology:       string;
  experienceLevel:  string;
  score:            number;
}

export interface IPost extends Document {
  walletAddress:  string;
  content:        string;
  txHash:         string;
  aiAnalysis:     IAIAnalysis | null;
  reputationGained: number;
  createdAt:      Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    sentiment:       { type: String, default: 'neutral' },
    skillsDetected:  { type: [String], default: [] },
    technology:      { type: String, default: '' },
    experienceLevel: { type: String, default: 'beginner' },
    score:           { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    txHash: {
      type: String,
      default: '',
    },
    aiAnalysis:      { type: AIAnalysisSchema, default: null },
    reputationGained: { type: Number, default: 5 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

PostSchema.index({ walletAddress: 1, createdAt: -1 });
PostSchema.index({ 'aiAnalysis.skillsDetected': 1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
