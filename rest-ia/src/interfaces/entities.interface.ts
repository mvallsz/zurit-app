import { Document, Types } from 'mongoose';

// Base interfaces
export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface IBaseEntity extends ITimestamps {
  _id: Types.ObjectId;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

// User interfaces
export interface IUser extends Document, ITimestamps {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'ROOT' | 'MANAGER' | 'STAFF' | 'CUSTOMER' | 'DELIVERY';
  isActive: boolean;
  restaurant?: Types.ObjectId;
  avatar?: string;
  lastLogin?: Date;
  comparePassword(password: string): Promise<boolean>;
}

// Restaurant interfaces
export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IRestaurant extends Document, ITimestamps {
  name: string;
  description?: string;
  address: IAddress;
  phone: string;
  email: string;
  logo?: string;
  coverImage?: string;
  cuisineTypes: string[];
  openingHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  isActive: boolean;
  rating?: number;
  totalReviews?: number;
  ownerId: Types.ObjectId;
}

// Category interfaces
export interface ICategory extends Document, ITimestamps {
  name: string;
  description?: string;
  image?: string;
  restaurant: Types.ObjectId;
  parentCategory?: Types.ObjectId;
  displayOrder: number;
  isActive: boolean;
}

// Menu interfaces
export interface IMenu extends Document, ITimestamps {
  name: string;
  description?: string;
  restaurant: Types.ObjectId;
  isActive: boolean;
  availableFrom?: Date;
  availableTo?: Date;
  categories: Types.ObjectId[];
}

// MenuItem interfaces
export interface IMenuItemModifier {
  name: string;
  options: {
    name: string;
    price: number;
    isDefault?: boolean;
  }[];
  required: boolean;
  multiSelect: boolean;
  maxSelect?: number;
}

export interface IMenuItem extends Document, ITimestamps {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: Types.ObjectId;
  menu: Types.ObjectId;
  restaurant: Types.ObjectId;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  modifiers?: IMenuItemModifier[];
  preparationTime?: number; // in minutes
  isAvailable: boolean;
  isActive: boolean;
  tags?: string[];
}

// Customer interfaces
export interface ICustomer extends Document, ITimestamps {
  user: Types.ObjectId;
  addresses: IAddress[];
  defaultAddress?: number;
  favoriteRestaurants: Types.ObjectId[];
  favoriteItems: Types.ObjectId[];
  allergies?: string[];
  dietaryPreferences?: string[];
  loyaltyPoints?: number;
  isActive: boolean;
}

// Order interfaces
export interface IOrderItem {
  menuItem: Types.ObjectId;
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
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type OrderType = 'dine_in' | 'takeout' | 'delivery';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'online' | 'wallet';

export interface IOrder extends Document, ITimestamps {
  orderNumber: string;
  restaurant: Types.ObjectId;
  customer: Types.ObjectId;
  items: IOrderItem[];
  orderType: OrderType;
  status: OrderStatus;
  table?: Types.ObjectId;
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  discount?: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  deliveryAddress?: IAddress;
  specialInstructions?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  cancelReason?: string;
  rating?: number;
  review?: string;
}

// Delivery interfaces
export type DeliveryStatus = 
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'failed';

export interface IDelivery extends Document, ITimestamps {
  order: Types.ObjectId;
  deliveryPerson: Types.ObjectId;
  restaurant: Types.ObjectId;
  pickupAddress: IAddress;
  deliveryAddress: IAddress;
  status: DeliveryStatus;
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
}

// Table interfaces
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface ITable extends Document, ITimestamps {
  restaurant: Types.ObjectId;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  location?: string;
  isActive: boolean;
  qrCode?: string;
}

// Reservation interfaces
export type ReservationStatus = 
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface IReservation extends Document, ITimestamps {
  restaurant: Types.ObjectId;
  customer: Types.ObjectId;
  table?: Types.ObjectId;
  reservationDate: Date;
  startTime: string;
  endTime?: string;
  partySize: number;
  status: ReservationStatus;
  specialRequests?: string;
  confirmationCode?: string;
  reminderSent?: boolean;
}

// AI Context interfaces
export interface IAIContext extends Document, ITimestamps {
  name: string;
  description?: string;
  systemPrompt: string;
  restaurant?: Types.ObjectId;
  isGlobal: boolean;
  isActive: boolean;
  settings?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}

// RAG Document interfaces
export interface IRAGDocument extends Document, ITimestamps {
  title: string;
  content: string;
  source?: string;
  restaurant?: Types.ObjectId;
  context?: Types.ObjectId;
  chunks: {
    content: string;
    embedding?: number[];
    metadata?: Record<string, unknown>;
  }[];
  isActive: boolean;
}

// Notification interfaces
export interface INotification extends Document, ITimestamps {
  recipient: Types.ObjectId;
  type: 'email' | 'sms' | 'push' | 'socket';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
}
