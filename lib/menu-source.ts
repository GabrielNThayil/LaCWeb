import fs from "fs";
import path from "path";
import type { MenuItem } from "@/types/menuTypes";
import type { OrderCategory } from "./order-catalog";

// Re-export types
export type { OrderCategory, OrderMenuItem } from "./order-catalog";

// Read order-catalog types (kept for backward compat with OrderingModule)
export { orderMenu, packagingFee, deliveryFee, freeDeliveryThreshold, formatCurrency, calculateOrderTotal } from "./order-catalog";

// ── Read JSON menu lazily (server-side only) ────────────────────────────────

let _menuItems: MenuItem[] | null = null;

function loadMenuItems(): MenuItem[] {
  if (_menuItems) return _menuItems;
  try {
    const filePath = path.join(process.cwd(), "data", "menu.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw) as { items: MenuItem[] };
    _menuItems = data.items;
  } catch {
    _menuItems = [];
  }
  return _menuItems;
}

// Expose full menu items for components
export function getMenuItems(): MenuItem[] {
  return loadMenuItems();
}

export function getMenuItemsByCategory(category: string): MenuItem[] {
  return loadMenuItems().filter((item) => item.category === category);
}

export function getFeaturedMenuItems(): MenuItem[] {
  return loadMenuItems().filter((item) => item.featured);
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return loadMenuItems().find((item) => item.id === id);
}