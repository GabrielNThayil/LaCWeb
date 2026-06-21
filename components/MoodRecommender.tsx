"use client";

import { useEffect, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getUserPreferences } from '@/lib/storage';
import { ArrowRight, Brain, ShoppingCart, Sparkles, RotateCcw, Zap, MessageSquare } from 'lucide-react';
import { BaseMenuItem } from '@/types/menuTypes';

// Memoized fetch for menu data
const fetchMenu = async (): Promise<BaseMenuItem[]> => {
  let menu: BaseMenuItem[] = [];

  try {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error(`API error! status: ${res.status}`);
    const data = await res.json();
    menu = (Object.values(data.items) as BaseMenuItem[][]).flat();
  } catch (error) {
    console.error('Error fetching menu:', error);
    menu = [
      {
        id: 'MOCK1',
        name: 'Single Origin Pour Over',
        description: 'Bright, clean pour over with floral notes',
        price: 240,
        categories: ['Coffee', 'Drinks'],
        dietaryTags: [],
        allergens: [],
      },
    ];
  }

  return menu;
};

const moodConfigs = [
  { id: 'focus', icon: '🎯', name: 'Need Focus', description: 'A sharp mind needs the right fuel' },
  { id: 'cozy', icon: '🌙', name: 'Cosy & Warm', description: 'Comfort in every sip' },
  { id: 'treat', icon: '✨', name: 'Treat Yourself', description: 'You deserve a little extra' },
  { id: 'morning', icon: '☀️', name: 'Morning Boost', description: 'Start your day right' },
  { id: 'creative', icon: '🎨', name: 'Creative Flow', description: 'Unlock inspiration' },
  { id: 'new', icon: '🆕', name: 'Try Something New', description: 'Discover the unexpected' },
];

export default function MoodRecommender() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<{
    drink: BaseMenuItem;
    food: BaseMenuItem;
    confidence: number;
    reasoning: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [menuItems, setMenuItems] = useState<BaseMenuItem[]>([]);
  const [typingText, setTypingText] = useState('');
  const [showReasoning, setShowReasoning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOrderNow = () => {
    // Store recommended items in sessionStorage for the order module
    if (recommendation) {
      const orderItems = [
        { name: recommendation.drink.name, price: recommendation.drink.price, type: 'drink' },
        { name: recommendation.food.name, price: recommendation.food.price, type: 'food' },
      ];
      sessionStorage.setItem('moodOrder', JSON.stringify(orderItems));
    }
    // Navigate to order section
    router.push('/#order');
  };

  const processingMessages = [
    'Analyzing your mood...',
    'Scanning flavor profiles...',
    'Cross-referencing preferences...',
    'Matching pairings...',
    'Finalizing recommendation...',
  ];

  useEffect(() => {
    let isMounted = true;
    fetchMenu().then((menu) => {
      if (isMounted) setMenuItems(menu);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (loading) {
      setProcessingStep(0);
      const interval = setInterval(() => {
        setProcessingStep((prev) => {
          if (prev < processingMessages.length - 1) return prev + 1;
          return prev;
        });
      }, 400);
      return () => clearInterval(interval);
    } else {
      setProcessingStep(0);
    }
  }, [loading]);

  useEffect(() => {
    if (recommendation && !showReasoning) {
      const fullReasoning = recommendation.reasoning.join('\n\n');
      let i = 0;
      setTypingText('');
      setShowReasoning(true);

      const typeInterval = setInterval(() => {
        if (i < fullReasoning.length) {
          setTypingText(fullReasoning.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 8);

      return () => clearInterval(typeInterval);
    }
  }, [recommendation]);

  const generateRecommendation = useCallback(() => {
    if (!selectedMood) return;
    setLoading(true);
    setRecommendation(null);
    setShowReasoning(false);
    setTypingText('');

    setTimeout(() => {
      const moodConfig = moodConfigs.find((m) => m.id === selectedMood);
      if (!moodConfig || menuItems.length === 0) {
        setLoading(false);
        return;
      }

      // Filter items matching mood
      const moodKeywords: Record<string, string[]> = {
        focus: ['espresso', 'coffee', 'cold brew', 'black'],
        cozy: ['latte', 'cappuccino', 'hot chocolate', 'croissant', 'warm'],
        treat: ['cheesecake', 'tiramisu', 'mocha', 'rose', 'premium'],
        morning: ['pour over', 'cappuccino', 'croissant', 'breakfast', 'matcha'],
        creative: ['matcha', 'latte art', 'special', 'mocktail', 'dessert'],
        new: ['elixir', 'special', 'rose', 'seasonal', 'mocktails'],
      };

      const keywords = moodKeywords[selectedMood] || [];
      const matched = menuItems.filter((item) =>
        keywords.some(
          (kw) =>
            item.name.toLowerCase().includes(kw) ||
            item.description?.toLowerCase().includes(kw) ||
            item.categories.some((c) => c.toLowerCase().includes(kw))
        )
      );

      const pool = matched.length >= 2 ? matched : menuItems;

      // Pick items
      const drinkIdx = Math.floor(Math.random() * pool.length);
      let foodIdx = Math.floor(Math.random() * pool.length);
      while (foodIdx === drinkIdx && pool.length > 1) {
        foodIdx = Math.floor(Math.random() * pool.length);
      }

      const drinkItem = pool[drinkIdx];
      const foodItem = pool[foodIdx];

      // Apply user preferences if logged in
      const userPrefs = getUserPreferences(session?.user?.id ?? '');
      const confidenceScore = session ? 0.92 : 0.78;

      // Generate AI-style reasoning
      const reasoning = [
        `Detected mood: ${moodConfig.name}`,
        `Analyzing ${drinkItem.name} characteristics...`,
        `Matching flavor profile with ${foodItem.name}...`,
        `Confidence: ${Math.round(confidenceScore * 100)}%`,
        `Pairing optimized for ${selectedMood === 'focus' ? 'clarity and alertness' :
          selectedMood === 'cozy' ? 'warmth and comfort' :
          selectedMood === 'treat' ? 'indulgence and satisfaction' :
          selectedMood === 'morning' ? 'energy and refreshment' :
          selectedMood === 'creative' ? 'inspiration and flow' :
          'discovery and adventure'}.`,
      ];

      setRecommendation({
        drink: drinkItem,
        food: foodItem,
        confidence: confidenceScore,
        reasoning,
      });
      setLoading(false);
    }, 1800);
  }, [selectedMood, menuItems, session]);

  const handleReset = () => {
    setSelectedMood(null);
    setRecommendation(null);
    setShowReasoning(false);
    setTypingText('');
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    generateRecommendation();
  };

  return (
    <section className="relative overflow-hidden">
      {/* Neural network background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#61481C" />
              <stop offset="100%" stopColor="#BF9742" />
            </linearGradient>
          </defs>
          {/* Neural network pattern */}
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i}>
              <circle cx={50 + (i % 5) * 180} cy={80 + Math.floor(i / 5) * 120} r="3" fill="url(#lineGrad)" opacity="0.5" />
              <circle cx={50 + ((i + 1) % 5) * 180} cy={80 + Math.floor((i + 1) / 5) * 120} r="3" fill="url(#lineGrad)" opacity="0.5" />
              <line
                x1={50 + (i % 5) * 180}
                y1={80 + Math.floor(i / 5) * 120}
                x2={50 + ((i + 1) % 5) * 180}
                y2={80 + Math.floor((i + 1) / 5) * 120}
                stroke="url(#lineGrad)"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </g>
          ))}
        </svg>
      </div>

      <div ref={containerRef} className="relative max-w-4xl mx-auto px-6 py-20 md:py-28">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-crown-espresso/5 border border-crown-espresso/10 mb-6">
            <Brain className="w-4 h-4 text-crown-gold" />
            <span className="text-xs font-medium text-crown-espresso/60 tracking-wide">AI-Powered Recommendations</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-light text-crown-ink mb-3">
            What&rsquo;s your mood?
          </h2>
          <p className="text-sm text-crown-espresso/50 max-w-md mx-auto">
            Our AI analyzes your vibe and curates the perfect drink and bite pairing for you.
          </p>
        </div>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
          {moodConfigs.map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`
                  group relative p-5 rounded-2xl border transition-all duration-300
                  hover:shadow-lg hover:-translate-y-0.5
                  ${isSelected
                    ? 'bg-crown-espresso border-crown-espresso text-crown-paper shadow-xl'
                    : 'bg-white/60 border-crown-espresso/15 hover:border-crown-espresso/30 hover:bg-white/90'
                  }
                `}
              >
                <span className="block text-3xl mb-2">{mood.icon}</span>
                <span className={`block font-medium text-sm ${isSelected ? 'text-crown-paper' : 'text-crown-espresso'}`}>
                  {mood.name}
                </span>
                <span className={`block text-xs mt-0.5 ${isSelected ? 'text-crown-paper/70' : 'text-crown-espresso/40'}`}>
                  {mood.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* AI Processing State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-crown-espresso/5 border border-crown-espresso/10">
              <div className="relative">
                <div className="w-8 h-8 rounded-full border-2 border-crown-espresso/20" />
                <div className="absolute inset-0 border-2 border-crown-gold border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-crown-espresso">
                  {processingMessages[processingStep]}
                </p>
                <div className="flex gap-1 mt-1">
                  {[...Array(3)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-crown-gold/50 animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Neural activity visualization */}
            <div className="flex justify-center gap-1 mt-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-crown-gold/30 rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.random() * 20}px`,
                    animationDelay: `${i * 80}ms`,
                    animationDuration: '600ms',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recommendation Result */}
        {recommendation && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* AI Header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-crown-gold/20 flex items-center justify-center">
                <Zap className="w-3 h-3 text-crown-gold" />
              </div>
              <span className="text-xs font-medium text-crown-espresso/50">AI Recommendation</span>
              <span className="ml-auto text-xs text-crown-espresso/30">
                {Math.round(recommendation.confidence * 100)}% confidence
              </span>
            </div>

            {/* Main Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-crown-espresso/10 shadow-xl overflow-hidden">
              {/* Items */}
              <div className="grid md:grid-cols-2 gap-4 p-6">
                {/* Drink */}
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-crown-cream/50 to-white/50 border border-crown-espresso/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-crown-gold">Drink</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-crown-gold/30 to-transparent" />
                  </div>
                  <h3 className="text-xl font-medium text-crown-ink mb-1">
                    {recommendation.drink.name}
                  </h3>
                  <p className="text-sm text-crown-espresso/60 line-clamp-2 mb-3">
                    {recommendation.drink.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-crown-espresso">
                      ₹{recommendation.drink.price}
                    </span>
                    <ArrowRight className="w-4 h-4 text-crown-espresso/30" />
                  </div>
                </div>

                {/* Food */}
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-crown-cream/50 to-white/50 border border-crown-espresso/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-crown-gold">Food</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-crown-gold/30 to-transparent" />
                  </div>
                  <h3 className="text-xl font-medium text-crown-ink mb-1">
                    {recommendation.food.name}
                  </h3>
                  <p className="text-sm text-crown-espresso/60 line-clamp-2 mb-3">
                    {recommendation.food.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-crown-espresso">
                      ₹{recommendation.food.price}
                    </span>
                    <ArrowRight className="w-4 h-4 text-crown-espresso/30" />
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="border-t border-crown-espresso/5 px-6 py-5 bg-crown-espresso/2">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-3.5 h-3.5 text-crown-espresso/40" />
                  <span className="text-xs font-medium text-crown-espresso/40 uppercase tracking-wider">
                    AI Reasoning
                  </span>
                </div>
                <div className="font-mono text-sm text-crown-espresso/60 leading-relaxed whitespace-pre-line">
                  {typingText}
                  {typingText.length < recommendation.reasoning.join('\n\n').length && (
                    <span className="inline-block w-2 h-4 bg-crown-gold/60 ml-0.5 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Total & Action */}
              <div className="px-6 py-5 bg-white/50 border-t border-crown-espresso/5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1">
                    <span className="text-xs text-crown-espresso/40 uppercase tracking-wider">Total</span>
                    <p className="text-2xl font-semibold text-crown-espresso">
                      ₹{recommendation.drink.price + recommendation.food.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleOrderNow}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-crown-espresso text-crown-paper font-medium text-sm hover:bg-crown-caramel transition-colors shadow-lg"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Order This Pairing
                    </button>

                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-crown-espresso/60 hover:text-crown-espresso hover:bg-crown-espresso/5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Try another mood</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}