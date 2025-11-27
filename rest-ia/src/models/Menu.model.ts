import mongoose, { Schema } from 'mongoose';
import { IMenu } from '../interfaces';

const MenuSchema = new Schema<IMenu>(
  {
    name: {
      type: String,
      required: [true, 'Menu name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    availableFrom: Date,
    availableTo: Date,
    categories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category',
    }],
  },
  {
    timestamps: true,
  }
);

MenuSchema.index({ restaurant: 1 });
MenuSchema.index({ restaurant: 1, isActive: 1 });

export const Menu = mongoose.model<IMenu>('Menu', MenuSchema);
export default Menu;
