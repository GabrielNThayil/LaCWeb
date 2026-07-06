// Client-safe utility functions for orders
export const packagingFee = 25;
export const deliveryFee = 59;
export const freeDeliveryThreshold = 800;

export function formatCurrency(amount: number) {
  return `INR ${amount.toLocaleString("en-IN")}`;
}

export type OrderCategory = "Coffee" | "Desserts" | "Brunch" | "Drinks" | "Bakes";

export type OrderMenuItem = {
  id: string;
  name: string;
  category: OrderCategory;
  price: number;
  description: string;
  image: string;
  badge?: string;
};

export const CAT_MAP: Record<string, OrderCategory> = {
  coffee: "Coffee", drinks: "Drinks", brunch: "Brunch", bakes: "Bakes", desserts: "Desserts",
};

export function calculateOrderTotal(
  items: Array<{ id: string; quantity: number }>,
  orderMenu: OrderMenuItem[],
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