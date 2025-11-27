/**
 * Entity: Delivery
 * 
 * Represents a delivery assignment for an order.
 * Tracks delivery person, location, and status.
 */
export interface DeliveryEntity {
  id: string;
  orderId: string;
  deliveryPersonId: string;
  restaurantId: string;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  estimatedPickupTime?: Date;
  actualPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  distance?: number;
  deliveryNotes?: string;
  signature?: string;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}
