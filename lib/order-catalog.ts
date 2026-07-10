// Server-side only: loads menu from filesystem
import "server-only";

import fs from "fs";
import path from "path";

// Fallback images keyed by category — multiple options per category for variety
export type OrderCategory = "Coffee" | "Desserts" | "Brunch" | "Bakes" | "Drinks";

const CATEGORY_IMAGES: Record<OrderCategory, string[]> = {
  Coffee: [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80",
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
    "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&q=80",
  ],
  Drinks: [
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80",
    "https://images.unsplash.com/photo-156895487229-89b4cb9c5df6?w=400&q=80",
    "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80",
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80",
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
  ],
  Brunch: [
    "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80",
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
  ],
  Bakes: [
    "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&q=80",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
    "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&q=80",
    "https://images.unsplash.com/photo-1612203985729-70726954388c?w=400&q=80",
    "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80",
  ],
  Desserts: [
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80",
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80",
    "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80",
    "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&q=80",
  ],
};

// Simple deterministic hash so same item always gets the same image
function hashItem(itemId: string): number {
  let h = 0;
  for (let i = 0; i < itemId.length; i++) {
    h = (Math.imul(31, h) + itemId.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export type OrderMenuItem = {
  id: string;
  name: string;
  category: OrderCategory;
  price: number;
  description: string;
  image: string;
  badge?: string;
};

// Known product photo mappings (local images in /public/pics/)
const LOCAL_PHOTO_MAP: Record<string, string> = {
  "korean-cheese-buns":          "/pics/Korean Bun.png",
  "healthy-budha-bowl":          "/pics/Interior 1.png",
  "butter-croissant":            "/pics/Interior 2.png",
  "hot-chocolate":               "/pics/Hot Chocolate Landscape.png",
  "newyork-styled-salted-caramel-cheesecake": "/pics/Burnt Basqu 2.png",
  "veg-burger":                  "/pics/Burger Landscape.png",
  "san-sebastian-basque-burnt-cheesecake-": "/pics/Burnt Basque Cheesecake Landscape.png",
  "classic-tres-leches-tubs":    "/pics/Tres Leches.png",
};

const CAT_MAP: Record<string, OrderCategory> = {
  coffee: "Coffee", drinks: "Drinks", brunch: "Brunch", bakes: "Bakes", desserts: "Desserts",
};

function getImageForItem(itemId: string, category: OrderCategory): string {
  // 1. Check for a known local product photo
  const local = LOCAL_PHOTO_MAP[itemId];
  if (local) return local;

  // 2. Pick one image from the category pool (deterministic per item)
  const pool = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES.Coffee;
  return pool[hashItem(itemId) % pool.length];
}

function loadJson(): OrderMenuItem[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "menu.json"), "utf8");
    const data = JSON.parse(raw) as { items: any[] };
    return data.items.map((item) => {
      const category = CAT_MAP[item.category] ?? "Coffee";
      return {
        id: item.id,
        name: item.name,
        category,
        price: item.price,
        description: item.description,
        image: getImageForItem(item.id, category),
        badge: item.badge,
      };
    });
  } catch {
    return [];
  }
}

// Only load on the server - this will be tree-shaken from client bundles
export const orderMenu: OrderMenuItem[] = loadJson();