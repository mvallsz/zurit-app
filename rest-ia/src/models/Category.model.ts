import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../interfaces';

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: String,
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ restaurant: 1, name: 1 });
CategorySchema.index({ restaurant: 1, displayOrder: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
