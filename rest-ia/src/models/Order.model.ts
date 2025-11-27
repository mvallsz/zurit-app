import mongoose, { Schema } from 'mongoose';
import { IOrder, IOrderItem, IAddress } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

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

const OrderItemModifierSchema = new Schema(
  {
    name: { type: String, required: true },
    option: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    modifiers: [OrderItemModifierSchema],
    specialInstructions: String,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () => `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    items: [OrderItemSchema],
    orderType: {
      type: String,
      enum: ['dine_in', 'takeout', 'delivery'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'],
      default: 'pending',
    },
    table: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'wallet'],
    },
    deliveryAddress: AddressSchema,
    specialInstructions: String,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    cancelReason: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: String,
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ restaurant: 1, status: 1 });
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ restaurant: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
