import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  profileData: {
    name: string;
    bio: string;
    skills: string[];
    ipfsHash: string;
  };
  reputation: number;
  totalPosts: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    profileData: {
      name:     { type: String, required: true, maxlength: 100 },
      bio:      { type: String, default: '', maxlength: 500 },
      skills:   { type: [String], default: [] },
      ipfsHash: { type: String, default: '' },
    },
    reputation:  { type: Number, default: 10, min: 0 },
    totalPosts:  { type: Number, default: 0, min: 0 },
    isVerified:  { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
UserSchema.index({ reputation: -1 });
UserSchema.index({ 'profileData.skills': 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
