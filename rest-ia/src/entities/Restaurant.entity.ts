/**
 * Entity: Restaurant
 * 
 * Represents a restaurant in the food ordering system.
 * Each restaurant has an owner, location, menu, and operating hours.
 */
export interface RestaurantEntity {
  id: string;
  name: string;
  description?: string;
  address: {
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
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
