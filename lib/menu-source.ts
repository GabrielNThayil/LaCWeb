import "server-only";

import fs from "fs";
import path from "path";
import type { MenuItem } from "@/types/menuTypes";
import type { OrderCategory } from "./order-utils";

// Re-export types and utilities from order-utils
export type { OrderCategory, OrderMenuItem } from "./order-utils";
export { packagingFee, deliveryFee, freeDeliveryThreshold, formatCurrency, calculateOrderTotal, CAT_MAP } from "./order-utils";

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