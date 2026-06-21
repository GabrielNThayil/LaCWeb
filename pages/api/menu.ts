import type { NextApiRequest, NextApiResponse } from 'next';
import type { MenuSkeleton } from '@/types/menuTypes';

// Menu Skeleton - Adaptable structure
const createBaseMenuItem = (
  id: string,
  name: string,
  description: string,
  price: number,
  categories: string[]
) => ({
  id,
  name,
  description,
  price,
  categories,
  dietaryTags: [],
  allergens: [],
  preparationTime: 0,
  featured: false,
});

const menuSkeleton: MenuSkeleton = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  items: {
    Coffee: [
      createBaseMenuItem('COFFEE1', 'Single Origin Pour Over', 'Clean, bright acidity with floral notes from Kenya', 240, ['Coffee', 'Drinks']),
      createBaseMenuItem('COFFEE2', 'Cinnanut Latte', 'Smoky espresso, nutty finish, silken milk.', 220, ['Coffee', 'Drinks']),
    ],
    Drinks: [
      createBaseMenuItem('DRINK1', 'Ruby Rose Elixir', 'Floral, sparkling and gently citrus-led.', 240, ['Drinks']),
    ],
    Brunch: [
      createBaseMenuItem('BRUNCH1', 'Almond Croissant', 'Roasted almond cream, laminated pastry', 200, ['Brunch']),
    ],
    Desserts: [
      createBaseMenuItem('DESSERT1', 'Burnt Basque Cheesecake', 'Caramelized top, molten cream cheese centre.', 310, ['Desserts']),
    ],
  },
  metadata: {
    dietaryFilters: ['vegan', 'gluten-free', 'nut-free'],
    allergenFilters: ['nuts', 'dairy', 'soy'],
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json(menuSkeleton);
}