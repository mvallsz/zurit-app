import mongoose, { Schema } from 'mongoose';
import { IMenuItem, IMenuItemModifier } from '../interfaces';

const ModifierOptionSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const ModifierSchema = new Schema<IMenuItemModifier>(
  {
    name: { type: String, required: true },
    options: [ModifierOptionSchema],
    required: { type: Boolean, default: false },
    multiSelect: { type: Boolean, default: false },
    maxSelect: Number,
  },
  { _id: false }
);

const NutritionalInfoSchema = new Schema(
  {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  { _id: false }
);

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    images: [String],
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    menu: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
      required: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    ingredients: [String],
    allergens: [String],
    nutritionalInfo: NutritionalInfoSchema,
    modifiers: [ModifierSchema],
    preparationTime: Number,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

MenuItemSchema.index({ restaurant: 1, category: 1 });
MenuItemSchema.index({ restaurant: 1, menu: 1 });
MenuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });
MenuItemSchema.index({ restaurant: 1, isAvailable: 1, isActive: 1 });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
export default MenuItem;
