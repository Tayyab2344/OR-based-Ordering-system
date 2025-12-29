// Menu Item Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isPopular?: boolean;
  extras?: Extra[];
  sizes?: Size[];
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface Size {
  id: string;
  name: string;
  priceModifier: number;
}

// Cart Types
export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: Size;
  selectedExtras: Extra[];
  specialInstructions?: string;
}

// Order Types
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled';

// Payment Types
export type PaymentMethod = 'EasyPaisa' | 'JazzCash' | 'Bank Transfer' | 'Cash on Delivery';

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  tax: number;
  total: number;
  specialInstructions?: string;
}

// Table Types
export interface Table {
  id: number;
  name: string;
  seats: number;
  isOccupied: boolean;
  currentOrderId?: string;
}

// Analytics Types
export interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
}

export interface PopularItem {
  menuItemId: string;
  name: string;
  orderCount: number;
}

export interface TableStats {
  tableId: number;
  orderCount: number;
}
