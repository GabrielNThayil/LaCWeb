"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { getUserPreferences } from "@/lib/storage";
import { OrderCategory } from "@/lib/order-catalog";
import { ArrowRight } from "lucide-react";

// Mood configurations
interface MoodConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  drinkCategories: OrderCategory[];
  foodCategories: OrderCategory[];
}

const moodConfigs: MoodConfig[] = [
  {
    id: "need-focus",
    name: "Need Focus",
    description: "Sustained energy without feeling heavy",
    icon: () => <span className="h-5 w-5">⚡</span>, // Using a simple span for now, can replace with proper icon later
    drinkCategories: ["Coffee", "Drinks"],
    foodCategories: ["Brunch"]
  },
  {
    id: "cosy-warm",
    name: "Cosy & Warm",
    description: "Comforting warmth for relaxing moments",
    icon: () => <span className="h-5 w-5">🔥</span>,
    drinkCategories: ["Coffee", "Drinks"],
    foodCategories: ["Brunch", "Desserts"]
  },
  {
    id: "treat-yourself",
    name: "Treat Yourself",
    description: "Premium indulgence for special moments",
    icon: () => <span className="h-5 w-5">🎁</span>,
    drinkCategories: ["Coffee", "Drinks"],
    foodCategories: ["Desserts", "Brunch"]
  },
  {
    id: "productive-morning",
    name: "Productive Morning",
    description: "Light and energizing start to your day",
    icon: () => <span className="h-5 w-5">☀️</span>,
    drinkCategories: ["Coffee", "Drinks"],
    foodCategories: ["Brunch"]
  },
  {
    id: "creative-session",
    name: "Creative Session",
    description: "Unique flavors to inspire your creativity",
    icon: () => <span className="h-5 w-5">🎨</span>,
    drinkCategories: ["Drinks", "Coffee"],
    foodCategories: ["Desserts", "Brunch"]
  },
  {
    id: "something-new",
    name: "Something New",
    description: "Adventurous choices you haven't tried before",
    icon: () => <span className="h-5 w-5">🆕</span>,
    drinkCategories: ["Coffee", "Drinks", "Brunch"], // All categories
    foodCategories: ["Desserts", "Brunch", "Drinks"] // All categories
  }
];

// Mock menu items for demonstration (in real app, would fetch from API or order-catalog)
const mockMenuItems = {
  Coffee: [
    { name: "Single Origin Pour Over", price: 240, description: "Clean, bright acidity with floral notes" },
    { name: "Cinnanut Latte", price: 220, description: "Smoky espresso, nutty finish, silken milk." },
    { name: "White Rose Mocha", price: 260, description: "Espresso, white cocoa, delicate rose aroma." }
  ],
  Drinks: [
    { name: "Ruby Rose Elixir", price: 240, description: "Floral, sparkling and gently citrus-led." },
    { name: "Mango Matcha", price: 275, description: "Matcha with a bright mango cream pour." },
    { name: "Iced Lavender Latte", price: 230, description: "Cool lavender-infused milk with espresso" }
  ],
  Brunch: [
    { name: "Almond Croissant", price: 200, description: "Roasted almond cream, laminated pastry" },
    { name: "French Butter Croissant", price: 180, description: "Laminated pastry baked golden and crisp." },
    { name: "Croissant Sandwich", price: 290, description: "Paneer, garden greens and house sauce." }
  ],
  Desserts: [
    { name: "Burnt Basque Cheesecake", price: 310, description: "Caramelized top, molten cream cheese centre." },
    { name: "Tiramisu Tub", price: 260, description: "Coffee-soaked sponge and cloud-soft cream." },
    { name: "Pistachio Cake", price: 280, description: "Rich pistachio sponge with cream filling" }
  ]
};

export default function MoodRecommender() {
  const { data: session, status: sessionStatus } = useSession();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<{ drink: string; food: string; explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Get user preferences to personalize recommendations
  const userPreferences = useMemo(
    () =>
      session
        ? getUserPreferences(session.user.id)
        : { favoriteDrinks: [], favoriteFoods: [], preferredVisitTimes: [], flavorPreferences: [], dietaryRestrictions: [] },
    [session]
  );

  // Generate recommendation based on mood and user preferences
  const generateRecommendation = useCallback((moodId: string) => {
    setLoading(true);

    // Simulate async operation
    setTimeout(() => {
      const moodConfig = moodConfigs.find(m => m.id === moodId);
      if (!moodConfig) {
        setLoading(false);
        return;
      }

      // Get available items for this mood
      const availableDrinks: Array<{name: string; price: number; description: string}> = [];
      const availableFoods: Array<{name: string; price: number; description: string}> = [];

      moodConfig.drinkCategories.forEach(category => {
        if (mockMenuItems[category as OrderCategory]) {
          availableDrinks.push(...mockMenuItems[category as OrderCategory]);
        }
      });

      moodConfig.foodCategories.forEach(category => {
        if (mockMenuItems[category as OrderCategory]) {
          availableFoods.push(...mockMenuItems[category as OrderCategory]);
        }
      });

      // Filter based on user preferences (simple implementation)
      // In a real app, this would be more sophisticated
      const filteredDrinks = availableDrinks.filter(drink =>
        !userPreferences.dietaryRestrictions.some(restriction =>
          drink.name.toLowerCase().includes(restriction.toLowerCase()))
      );

      const filteredFoods = availableFoods.filter(food =>
        !userPreferences.dietaryRestrictions.some(restriction =>
          food.name.toLowerCase().includes(restriction.toLowerCase()))
      );

      // Select random items (could be smarter based on preferences)
      const randomDrink = filteredDrinks[Math.floor(Math.random() * filteredDrinks.length)] ||
                         availableDrinks[Math.floor(Math.random() * availableDrinks.length)] ||
                         { name: "Single Origin Pour Over", price: 240, description: "Clean, bright acidity with floral notes" };

      const randomFood = filteredFoods[Math.floor(Math.random() * filteredFoods.length)] ||
                        availableFoods[Math.floor(Math.random() * availableFoods.length)] ||
                        { name: "Almond Croissant", price: 200, description: "Roasted almond cream, laminated pastry" };

      // Generate explanation based on mood
      let explanation = moodConfig.description;

      // Personalize explanation based on user preferences
      if (userPreferences.favoriteDrinks.includes(randomDrink.name) ||
          userPreferences.favoriteFoods.includes(randomFood.name)) {
        explanation = "Based on your favorites, we recommend this combo that you're sure to love!";
      } else if (userPreferences.flavorPreferences.length > 0) {
        const hasPreferredFlavor = userPreferences.flavorPreferences.some(flavor =>
          randomDrink.name.toLowerCase().includes(flavor.toLowerCase()) ||
          randomFood.name.toLowerCase().includes(flavor.toLowerCase())
        );
        if (hasPreferredFlavor) {
          explanation = "Featuring your preferred flavors for a personalized experience.";
        }
      }

      setRecommendation({
        drink: randomDrink.name,
        food: randomFood.name,
        explanation
      });

      setLoading(false);
    }, 1000); // Simulate network delay
  }, [userPreferences]);

  // Handle mood selection
  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    generateRecommendation(moodId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold text-crown-ink">
          Mood-Based Recommendations
        </h2>
        <p className="text-crown-espresso/90">
          Tell us how you&apos;re feeling, and we&apos;ll suggest the perfect combo
        </p>
      </div>

      {/* Mood selector */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {moodConfigs.map(mood => (
          <button
            key={mood.id}
            onClick={() => handleMoodSelect(mood.id)}
            className={`flex flex-col items-center justify-between p-6 rounded-xl border border-crown-espresso/20 bg-crown-paper/80 hover:bg-crown-paper hover:border-crown-espresso/30 transition-all duration-300 ${
              selectedMood === mood.id
                ? "border-crown-espresso bg-crown-espresso/10"
                : ""
            }`}
          >
            <div className="flex items-center justify-center h-12 w-12 mb-4 rounded-full bg-crown-espresso/10 text-crown-espresso">
              {mood.icon()}
            </div>
            <h3 className="font-display text-xl font-semibold text-crown-ink">{mood.name}</h3>
            <p className="mt-2 text-sm text-crown-espresso/80 text-center">{mood.description}</p>
          </button>
        ))}
      </div>

      {/* Recommendation display */}
      {selectedMood && recommendation && (
        <div className="rounded-xl border border-crown-espresso/20 bg-crown-paper/90 p-6">
          <h2 className="font-display text-2xl font-semibold text-crown-ink mb-4">
            Your {moodConfigs.find(m => m.id === selectedMood)?.name} Recommendation
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-medium text-crown-espresso">Drink</p>
              <p className="font-display text-xl font-semibold text-crown-ink">
                {recommendation.drink}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-crown-espresso">Food</p>
              <p className="font-display text-xl font-semibold text-crown-ink">
                {recommendation.food}
              </p>
            </div>
          </div>

          <p className="mt-4 text-crown-espresso/90 leading-relaxed">
            {recommendation.explanation}
          </p>

          {/* Option to refresh recommendation */}
          {!loading && (
            <button
              onClick={() => generateRecommendation(selectedMood!)}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-crown-espresso/20 px-4 py-2 text-sm font-semibold text-crown-espresso hover:border-crown-espresso/30 hover:bg-white"
            >
              Refresh Suggestion
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {loading && (
            <p className="mt-4 text-crown-espresso/90">
              Generating your personalized recommendation...
            </p>
          )}
        </div>
      )}

      {/* Prompt to sign in for personalized recommendations */}
      {!session && !selectedMood && (
        <div className="text-center text-crown-espresso/80">
          <p className="mt-4">
            Sign in to get personalized recommendations based on your order history and preferences
          </p>
          <a
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-full bg-crown-espresso px-4 py-2 text-sm font-semibold text-crown-paper hover:bg-crown-caramel transition-colors"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}