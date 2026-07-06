import "server-only";

import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import type { MenuApiResponse } from "@/types/menuTypes";

type OrderCategory = "Coffee" | "Desserts" | "Brunch" | "Drinks";

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
  bakes: "Brunch",
  desserts: "Desserts",
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
  return menu.items.map((item) => ({
    id: item.id,
    name: item.name,
    category: CAT_MAP[item.category] ?? "Coffee",
    price: item.price,
    description: item.description,
    image: item.localImage || item.unsplashImage || "",
    badge: item.badge,
  }));
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