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

export const orderMenu: OrderMenuItem[] = [
  {
    id: "cinnanut-latte",
    name: "Cinnanut Latte",
    category: "Coffee",
    price: 220,
    description: "Smoky espresso, nutty finish, silken milk.",
    badge: "Guest favourite",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "white-rose-mocha",
    name: "White Rose Mocha",
    category: "Coffee",
    price: 260,
    description: "Espresso, white cocoa, delicate rose aroma.",
    image:
      "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mango-matcha",
    name: "Mango Matcha",
    category: "Drinks",
    price: 275,
    description: "Matcha with a bright mango cream pour.",
    badge: "Signature",
    image:
      "https://images.unsplash.com/photo-1536013455962-5f65dd3d43ce?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "ruby-rose-elixir",
    name: "Ruby Rose Elixir",
    category: "Drinks",
    price: 240,
    description: "Floral, sparkling and gently citrus-led.",
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "butter-croissant",
    name: "French Butter Croissant",
    category: "Brunch",
    price: 180,
    description: "Laminated pastry baked golden and crisp.",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "croissant-sandwich",
    name: "Croissant Sandwich",
    category: "Brunch",
    price: 290,
    description: "Paneer, garden greens and house sauce.",
    image:
      "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "tiramisu-tub",
    name: "Tiramisu Tub",
    category: "Desserts",
    price: 260,
    description: "Coffee-soaked sponge and cloud-soft cream.",
    badge: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "basque-cheesecake",
    name: "Burnt Basque Cheesecake",
    category: "Desserts",
    price: 310,
    description: "Caramelized top, molten cream cheese centre.",
    image:
      "https://images.unsplash.com/photo-1567171466295-4afa63d45416?auto=format&fit=crop&w=800&q=80"
  }
];

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
  const products = new Map(orderMenu.map((item) => [item.id, item]));
  const lines = items.map(({ id, quantity }) => {
    const product = products.get(id);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 12) {
      throw new Error("Invalid cart item or quantity.");
    }
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      total: product.price * quantity
    };
  });

  if (lines.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const subtotal = lines.reduce((total, item) => total + item.total, 0);
  const chargedDeliveryFee =
    providerDeliveryFee !== undefined ? Math.round(providerDeliveryFee) : deliveryFee;
  const delivery =
    fulfillment === "delivery" && subtotal < freeDeliveryThreshold
      ? chargedDeliveryFee
      : 0;
  const total = subtotal + packagingFee + delivery;

  return { lines, subtotal, packaging: packagingFee, delivery, total };
}
