// Type definitions for user data models

export interface User {
  id: string;
  name: string;
  email: string;
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