// Server-side only: loads menu from filesystem
// Use @/lib/order-utils for client-safe functions
import "server-only";

import fs from "fs";
import path from "path";

export type OrderCategory = "Coffee" | "Desserts" | "Brunch" | "Drinks";

export type OrderMenuItem = {
  id: string;
  name: string;
  category: OrderCategory;
  price: number;
  description: string;
  image: string;
  badge?: string;
};

const CAT_MAP: Record<string, OrderCategory> = {
  coffee: "Coffee", drinks: "Drinks", brunch: "Brunch", bakes: "Brunch", desserts: "Desserts",
};

function loadJson(): OrderMenuItem[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "menu.json"), "utf8");
    const data = JSON.parse(raw) as { items: any[] };
    return data.items.map((item) => ({
      id: item.id, name: item.name,
      category: CAT_MAP[item.category] ?? "Coffee",
      price: item.price, description: item.description,
      image: item.localImage || item.unsplashImage || "",
      badge: item.badge,
    }));
  } catch {
    return [];
  }
}

// Only load on the server - this will be tree-shaken from client bundles
export const orderMenu: OrderMenuItem[] = loadJson();