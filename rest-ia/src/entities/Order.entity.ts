/**
 * Entity: Order
 * 
 * Represents an order in the food ordering system.
 * Supports dine-in, takeout, and delivery order types.
 */
export interface OrderEntity {
  id: string;
  orderNumber: string;
  restaurantId: string;
  customerId: string;
  items: {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    modifiers?: {
      name: string;
      option: string;
      price: number;
    }[];
    specialInstructions?: string;
  }[];
  orderType: 'dine_in' | 'takeout' | 'delivery';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled';
  tableId?: string;
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  discount?: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'online' | 'wallet';
  deliveryAddress?: {
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
  specialInstructions?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  cancelReason?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}
