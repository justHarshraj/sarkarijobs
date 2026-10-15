import mongoose, { Schema, Model, Document } from 'mongoose';
import type { ICategory } from '@/types';

// ============================================================
// Category Model — Job classification categories
// ============================================================

export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document {}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    icon: { type: String, default: '📋' },
    description: { type: String, default: '' },
    jobCount: { type: Number, default: 0 },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Category: Model<ICategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDocument>('Category', CategorySchema);

export default Category;
