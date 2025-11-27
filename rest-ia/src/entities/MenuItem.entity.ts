/**
 * Entity: MenuItem
 * 
 * Represents a menu item available for ordering.
 * Includes pricing, nutritional info, and customization options.
 */
export interface MenuItemEntity {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  categoryId: string;
  menuId: string;
  restaurantId: string;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  modifiers?: {
    name: string;
    options: {
      name: string;
      price: number;
      isDefault?: boolean;
    }[];
    required: boolean;
    multiSelect: boolean;
    maxSelect?: number;
  }[];
  preparationTime?: number;
  isAvailable: boolean;
  isActive: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
