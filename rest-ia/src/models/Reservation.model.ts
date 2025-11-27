import mongoose, { Schema } from 'mongoose';
import { IReservation } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

const ReservationSchema = new Schema<IReservation>(
  {
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
    table: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
    },
    reservationDate: {
      type: Date,
      required: [true, 'Reservation date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: String,
    partySize: {
      type: Number,
      required: [true, 'Party size is required'],
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    specialRequests: String,
    confirmationCode: {
      type: String,
      default: () => uuidv4().substring(0, 8).toUpperCase(),
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ReservationSchema.index({ restaurant: 1, reservationDate: 1 });
ReservationSchema.index({ customer: 1, reservationDate: -1 });
ReservationSchema.index({ confirmationCode: 1 });
ReservationSchema.index({ restaurant: 1, status: 1 });

export const Reservation = mongoose.model<IReservation>('Reservation', ReservationSchema);
export default Reservation;
