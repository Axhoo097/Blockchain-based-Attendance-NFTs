import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  date:            Date;
  totalUsers:      number;
  newUsers:        number;
  totalPosts:      number;
  newPosts:        number;
  avgReputation:   number;
  topSkills:       Array<{ skill: string; count: number }>;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    date:          { type: Date, required: true, unique: true },
    totalUsers:    { type: Number, default: 0 },
    newUsers:      { type: Number, default: 0 },
    totalPosts:    { type: Number, default: 0 },
    newPosts:      { type: Number, default: 0 },
    avgReputation: { type: Number, default: 0 },
    topSkills:     [{ skill: String, count: Number }],
  },
  { timestamps: true, versionKey: false }
);

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
