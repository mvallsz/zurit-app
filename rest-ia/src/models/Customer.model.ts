import mongoose, { Schema } from 'mongoose';
import { ICustomer, IAddress } from '../interfaces';

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    addresses: [AddressSchema],
    defaultAddress: {
      type: Number,
      default: 0,
    },
    favoriteRestaurants: [{
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
    }],
    favoriteItems: [{
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
    }],
    allergies: [String],
    dietaryPreferences: [String],
    loyaltyPoints: {
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

CustomerSchema.index({ user: 1 });

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
export default Customer;
