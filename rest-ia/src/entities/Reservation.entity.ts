/**
 * Entity: Reservation
 * 
 * Represents a table reservation at a restaurant.
 * Includes party size, time slot, and confirmation.
 */
export interface ReservationEntity {
  id: string;
  restaurantId: string;
  customerId: string;
  tableId?: string;
  reservationDate: Date;
  startTime: string;
  endTime?: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  specialRequests?: string;
  confirmationCode?: string;
  reminderSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
