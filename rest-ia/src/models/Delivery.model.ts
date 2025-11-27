import mongoose, { Schema } from 'mongoose';
import { IDelivery, IAddress } from '../interfaces';

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

const DeliverySchema = new Schema<IDelivery>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    deliveryPerson: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    pickupAddress: {
      type: AddressSchema,
      required: true,
    },
    deliveryAddress: {
      type: AddressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
      default: 'pending',
    },
    estimatedPickupTime: Date,
    actualPickupTime: Date,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    currentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
    distance: Number,
    deliveryNotes: String,
    signature: String,
    photo: String,
  },
  {
    timestamps: true,
  }
);

DeliverySchema.index({ order: 1 });
DeliverySchema.index({ deliveryPerson: 1, status: 1 });
DeliverySchema.index({ restaurant: 1, status: 1 });

export const Delivery = mongoose.model<IDelivery>('Delivery', DeliverySchema);
export default Delivery;
