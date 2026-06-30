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

export const orderMenu: OrderMenuItem[] = loadJson();
export const packagingFee = 25;
export const deliveryFee = 59;
export const freeDeliveryThreshold = 800;

export function formatCurrency(amount: number) {
  return `INR ${amount.toLocaleString("en-IN")}`;
}

export function calculateOrderTotal(
  items: Array<{ id: string; quantity: number }>,
  fulfillment: "delivery" | "pickup",
  providerDeliveryFee?: number
) {
  const products = new Map(orderMenu.map((i) => [i.id, i]));
  const lines = items.map(({ id, quantity }) => {
    const p = products.get(id);
    if (!p || !Number.isInteger(quantity) || quantity < 1 || quantity > 12) {
      throw new Error("Invalid cart item.");
    }
    return { id: p.id, name: p.name, price: p.price, quantity, total: p.price * quantity };
  });
  if (lines.length === 0) throw new Error("Cart is empty.");
  const subtotal = lines.reduce((s, i) => s + i.total, 0);
  const fee = providerDeliveryFee !== undefined ? Math.round(providerDeliveryFee) : deliveryFee;
  const delivery = fulfillment === "delivery" && subtotal < freeDeliveryThreshold ? fee : 0;
  return { lines, subtotal, packaging: packagingFee, delivery, total: subtotal + packagingFee + delivery };
}