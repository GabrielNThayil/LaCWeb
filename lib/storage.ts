// Mock storage system simulating a backend database
// In a real application, this would be replaced with a proper database

import { User, UserProfile, UserPreferences, UserOrder } from './models';

// Mock data storage
let users: Map<string, User> = new Map();
let orders: Map<string, UserOrder[]> = new Map();
// New: preferences storage
let userPreferences: Map<string, UserPreferences> = new Map();

// Initialize with some sample data
function initializeMockData() {
  // Create a sample user
  const sampleUser: User = {
    id: 'user_1',
    name: 'Arjun Patel',
    email: 'arjun@example.com',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    visitCount: 5,
    averageSpend: 850
  };

  users.set(sampleUser.id, sampleUser);

  // Initialize preferences for the sample user
  const samplePreferences: UserPreferences = {
    favoriteDrinks: ['Cinnanut Latte', 'White Rose Mocha'],
    favoriteFoods: ['French Butter Croissant', 'Tiramisu Tub'],
    preferredVisitTimes: ['morning'],
    flavorPreferences: ['Rose', 'White Chocolate'],
    dietaryRestrictions: []
  };
  userPreferences.set(sampleUser.id, samplePreferences);

  // Create sample orders for the user
  const sampleOrders: UserOrder[] = [
    {
      id: 'order_1',
      userId: sampleUser.id,
      items: [
        { name: 'Cinnanut Latte', quantity: 2, price: 220 },
        { name: 'French Butter Croissant', quantity: 1, price: 180 }
      ],
      total: 620,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      type: 'delivery',
      status: 'completed'
    },
    {
      id: 'order_2',
      userId: sampleUser.id,
      items: [
        { name: 'White Rose Mocha', quantity: 1, price: 260 },
        { name: 'Tiramisu Tub', quantity: 1, price: 260 }
      ],
      total: 520,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      type: 'pickup',
      status: 'completed'
    }
  ];

  orders.set(sampleUser.id, sampleOrders);
}

// Call initialization
initializeMockData();

/**
 * Get user by ID
 */
export function getUserById(userId: string): User | undefined {
  return users.get(userId);
}

/**
 * Get user by email (case-insensitive)
 */
export function getUserByEmail(email: string): User | undefined {
  const normalizedEmail = email.toLowerCase();
  return Array.from(users.values()).find(user => user.email.toLowerCase() === normalizedEmail);
}

/**
 * Create a new user
 */
export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastVisit' | 'visitCount' | 'averageSpend'>): User {
  const id = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date();

  const user: User = {
    id,
    ...userData,
    createdAt: now,
    lastVisit: now,
    visitCount: 1,
    averageSpend: 0
  };

  users.set(id, user);
  orders.set(id, []); // Initialize empty orders array
  // Initialize empty preferences for the new user
  userPreferences.set(id, getDefaultPreferences());

  return user;
}

/**
 * Update user information
 */
export function updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | undefined {
  const user = users.get(userId);
  if (!user) return undefined;

  const updatedUser = { ...user, ...updates };
  users.set(userId, updatedUser);
  return updatedUser;
}

/**
 * Get user orders
 */
export function getUserOrders(userId: string): UserOrder[] {
  return orders.get(userId) || [];
}

/**
 * Add an order for a user
 */
export function addUserOrder(userId: string, order: Omit<UserOrder, 'id'>): UserOrder {
  const userOrders = getUserOrders(userId);
  const newOrder: UserOrder = {
    id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ...order
  };

  userOrders.push(newOrder);
  orders.set(userId, userOrders);

  // Update user statistics
  updateUserStatistics(userId);

  return newOrder;
}

/**
 * Update user statistics based on order history
 */
function updateUserStatistics(userId: string): void {
  const user = users.get(userId);
  if (!user) return;

  const userOrders = getUserOrders(userId);

  // Update visit count (unique days)
  const visitDates = new Set(
    userOrders
      .filter(order => order.status === 'completed')
      .map(order => order.date.toDateString())
  );

  user.visitCount = visitDates.size;

  // Update average spend
  const completedOrders = userOrders.filter(order => order.status === 'completed');
  if (completedOrders.length > 0) {
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
    user.averageSpend = Math.round(totalSpent / completedOrders.length);
  }

  // Update last visit
  const latestOrder = userOrders
    .filter(order => order.status === 'completed')
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

  if (latestOrder) {
    user.lastVisit = latestOrder.date;
  }

  users.set(userId, user);
}

/**
 * Get user preferences (mock implementation)
 */
export function getUserPreferences(userId: string): UserPreferences {
  // In a real app, this would fetch from database
  // For now, return preferences from the map, or default if not found
  const prefs = userPreferences.get(userId);
  if (prefs) {
    return prefs;
  }
  // If not found, return default and also store it for future
  const defaultPrefs = getDefaultPreferences();
  userPreferences.set(userId, defaultPrefs);
  return defaultPrefs;
}

/**
 * Update user preferences
 */
export function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): UserPreferences | undefined {
  // Get current preferences
  const currentPrefs = getUserPreferences(userId);
  // Merge the updates
  const updatedPrefs = { ...currentPrefs, ...preferences };
  // Store the updated preferences
  userPreferences.set(userId, updatedPrefs);
  return updatedPrefs;
}

/**
 * Get default preferences for new users
 */
export function getDefaultPreferences(): UserPreferences {
  return {
    favoriteDrinks: ['Cinnanut Latte', 'White Rose Mocha'],
    favoriteFoods: ['French Butter Croissant', 'Tiramisu Tub'],
    preferredVisitTimes: ['morning'],
    flavorPreferences: ['Rose', 'White Chocolate'],
    dietaryRestrictions: []
  };
}

/**
 * Clear all mock data (for testing)
 */
export function clearMockData() {
  users.clear();
  orders.clear();
  userPreferences.clear();
  initializeMockData();
}