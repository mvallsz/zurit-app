import mongoose, { Schema } from 'mongoose';
import { ITable } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

const TableSchema = new Schema<ITable>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'cleaning'],
      default: 'available',
    },
    location: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    qrCode: {
      type: String,
      default: () => uuidv4(),
    },
  },
  {
    timestamps: true,
  }
);

TableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });
TableSchema.index({ restaurant: 1, status: 1 });
TableSchema.index({ qrCode: 1 });

export const Table = mongoose.model<ITable>('Table', TableSchema);
export default Table;
