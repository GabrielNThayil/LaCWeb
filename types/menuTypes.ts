export interface BaseMenuItem {
 id: string;
 name: string;
 description: string;
 price: number;
 categories: string[];
 dietaryTags?: string[];
 allergens?: string[];
 preparationTime?: number;
 featured?: boolean;
}

export interface MenuCategory {
 [key: string]: BaseMenuItem[];
}

export interface MenuSkeleton {
 version: string;
 lastUpdated: string;
 items: MenuCategory;
 metadata?: {
 dietaryFilters: string[];
 allergenFilters: string[];
}
}