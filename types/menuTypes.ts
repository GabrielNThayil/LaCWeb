// Typed menu data — sourced from data/menu.json

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "coffee" | "drinks" | "brunch" | "desserts" | "bakes";
  dietaryTags: string[];
  allergens: string[];
  prepTime: string;
  featured: boolean;
  localImage: string | null;
  unsplashImage: string | null;
  badge?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}

export interface MenuData {
  version: string;
  lastUpdated: string;
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface MenuApiResponse {
  version: string;
  lastUpdated: string;
  categories: MenuCategory[];
  items: MenuItem[];
}

// Helper: get items by category
export function getItemsByCategory(data: MenuData, categoryId: string): MenuItem[] {
  return data.items.filter((item) => item.category === categoryId);
}

// Helper: get featured items
export function getFeaturedItems(data: MenuData): MenuItem[] {
  return data.items.filter((item) => item.featured);
}

// Category display names and ordering
export const CATEGORY_ORDER: Record<string, { label: string; order: number }> = {
  coffee:  { label: "Coffee & Espresso", order: 1 },
  drinks:  { label: "Drinks & Mocktails", order: 2 },
  brunch:  { label: "Brunch", order: 3 },
  bakes:   { label: "Bakes", order: 4 },
  desserts:{ label: "Desserts", order: 5 },
};

export const ALLERGEN_LABELS: Record<string, string> = {
  dairy: "Contains dairy",
  gluten: "Contains gluten",
  eggs: "Contains eggs",
  soy: "Contains soy",
  nuts: "Contains nuts",
  "nut-free": "Nut-free",
};

export const DIET_LABELS: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  "gluten-free": "Gluten-free",
};