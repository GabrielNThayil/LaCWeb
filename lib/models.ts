// Type definitions for user data models

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role?: 'admin' | 'user';
  createdAt: Date;
  lastVisit: Date;
  visitCount: number;
  averageSpend: number;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  favoriteDrinks: string[];
  favoriteFoods: string[];
  preferredVisitTimes: string[]; // morning, afternoon, evening
  flavorPreferences: string[]; // Rose, Pistachio, White Chocolate, Hazelnut
  dietaryRestrictions: string[];
}

export interface UserOrder {
  id: string;
  userId: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  date: Date;
  type: 'delivery' | 'pickup' | 'private_space';
  status: 'confirmed' | 'completed' | 'cancelled';
}

export type OrderStatus = 'new' | 'preparing' | 'out_for_delivery' | 'ready' | 'delivered' | 'completed' | 'cancelled';
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'delivered';

export interface AdminOrder {
  id: string;
  confirmationId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerLandmark?: string;
  fulfillment: 'delivery' | 'pickup';
  timing: string;
  instructions?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  packagingFee: number;
  deliveryFee: number;
  total: number;
  paymentAmount: number;
  status: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  deliveryPartner?: string;
  trackingUrl?: string | null;
  borzoOrderId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  todayOrders: number;
  todayRevenue: number;
  pendingDeliveries: number;
  avgOrderValue: number;
}