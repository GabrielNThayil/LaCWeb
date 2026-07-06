import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import type { MenuApiResponse } from "@/types/menuTypes";

type OrderCategory = "Coffee" | "Desserts" | "Brunch" | "Drinks" | "Bakes";

type OrderMenuItem = {
  id: string;
  name: string;
  category: OrderCategory;
  price: number;
  description: string;
  image: string;
  badge?: string;
};

const CAT_MAP: Record<string, OrderCategory> = {
  coffee: "Coffee",
  drinks: "Drinks",
  brunch: "Brunch",
  bakes: "Bakes",
  desserts: "Desserts",
};

// Fallback images by category (Unsplash)
const CATEGORY_IMAGES: Record<string, string> = {
  Coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
  Drinks: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop",
  Brunch: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
  Bakes: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
  Desserts: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
};

function readMenu(): MenuApiResponse {
  const filePath = path.join(process.cwd(), "data", "menu.json");
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as MenuApiResponse;
  } catch {
    // Fallback: serve empty but valid response
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      categories: [],
      items: [],
    };
  }
}

// Read menu and map to order format
function readOrderMenu(): OrderMenuItem[] {
  const menu = readMenu();
  return menu.items.map((item) => {
    const category = CAT_MAP[item.category] ?? "Coffee";
    return {
      id: item.id,
      name: item.name,
      category,
      price: item.price,
      description: item.description,
      image: item.localImage || item.unsplashImage || CATEGORY_IMAGES[category],
      badge: item.badge,
    };
  });
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const menu = readMenu();
  const orderItems = readOrderMenu();

  // Optionally filter by category
  const { category } = req.query;
  if (category && typeof category === "string") {
    const filtered = menu.items.filter((item) => item.category === category);
    return res.status(200).json({ ...menu, items: filtered, orderItems: orderItems.filter(item => item.category.toLowerCase() === category) });
  }

  return res.status(200).json({ ...menu, orderItems });
}