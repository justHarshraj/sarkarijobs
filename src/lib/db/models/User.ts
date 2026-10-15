import mongoose, { Schema, Model, Document } from 'mongoose';
import type { IUser } from '@/types';

// ============================================================
// User Model — For future bookmarking and preferences
// ============================================================

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, default: '', trim: true },
    bookmarkedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    preferences: {
      categories: { type: [String], default: [] },
      states: { type: [String], default: [] },
      qualifications: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
