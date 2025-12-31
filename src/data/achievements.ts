export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'milestone' | 'allergen' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Milestone achievements
  {
    id: 'first_food',
    name: 'First Bite',
    description: 'Log your first food',
    emoji: '🍼',
    category: 'milestone',
    rarity: 'common',
  },
  {
    id: 'foods_10',
    name: 'Curious Taster',
    description: 'Try 10 different foods',
    emoji: '🥄',
    category: 'milestone',
    rarity: 'common',
  },
  {
    id: 'foods_25',
    name: 'Adventurous Eater',
    description: 'Try 25 different foods',
    emoji: '🍴',
    category: 'milestone',
    rarity: 'rare',
  },
  {
    id: 'foods_50',
    name: 'Food Explorer',
    description: 'Try 50 different foods',
    emoji: '🌟',
    category: 'milestone',
    rarity: 'rare',
  },
  {
    id: 'foods_75',
    name: 'Gourmet Baby',
    description: 'Try 75 different foods',
    emoji: '👨‍🍳',
    category: 'milestone',
    rarity: 'epic',
  },
  {
    id: 'foods_100',
    name: 'Century Club',
    description: 'Try 100 different foods',
    emoji: '💯',
    category: 'milestone',
    rarity: 'legendary',
  },

  // Allergen achievements
  {
    id: 'first_allergen',
    name: 'Allergen Pioneer',
    description: 'Clear your first allergen',
    emoji: '🛡️',
    category: 'allergen',
    rarity: 'common',
  },
  {
    id: 'dairy_complete',
    name: 'Dairy Champion',
    description: 'Clear all dairy allergens',
    emoji: '🥛',
    category: 'allergen',
    rarity: 'rare',
  },
  {
    id: 'egg_complete',
    name: 'Egg Expert',
    description: 'Clear all egg allergens',
    emoji: '🥚',
    category: 'allergen',
    rarity: 'rare',
  },
  {
    id: 'peanut_complete',
    name: 'Peanut Pro',
    description: 'Clear all peanut allergens',
    emoji: '🥜',
    category: 'allergen',
    rarity: 'rare',
  },
  {
    id: 'tree_nut_complete',
    name: 'Nut Navigator',
    description: 'Clear all tree nut allergens',
    emoji: '🌰',
    category: 'allergen',
    rarity: 'epic',
  },
  {
    id: 'soy_complete',
    name: 'Soy Superstar',
    description: 'Clear all soy allergens',
    emoji: '🌱',
    category: 'allergen',
    rarity: 'rare',
  },
  {
    id: 'wheat_complete',
    name: 'Wheat Winner',
    description: 'Clear all wheat allergens',
    emoji: '🌾',
    category: 'allergen',
    rarity: 'rare',
  },
  {
    id: 'fish_complete',
    name: 'Fish Friend',
    description: 'Clear all fish allergens',
    emoji: '🐟',
    category: 'allergen',
    rarity: 'epic',
  },
  {
    id: 'shellfish_complete',
    name: 'Shellfish Star',
    description: 'Clear all shellfish allergens',
    emoji: '🦐',
    category: 'allergen',
    rarity: 'epic',
  },
  {
    id: 'sesame_complete',
    name: 'Sesame Sage',
    description: 'Clear all sesame allergens',
    emoji: '🫘',
    category: 'allergen',
    rarity: 'rare',
  },
  {
    id: 'all_allergens',
    name: 'Allergy Conqueror',
    description: 'Clear ALL Top 9 allergens',
    emoji: '🏆',
    category: 'allergen',
    rarity: 'legendary',
  },

  // Logging achievements
  {
    id: 'logs_10',
    name: 'Dedicated Logger',
    description: 'Log 10 meals',
    emoji: '📝',
    category: 'milestone',
    rarity: 'common',
  },
  {
    id: 'logs_50',
    name: 'Journaling Pro',
    description: 'Log 50 meals',
    emoji: '📒',
    category: 'milestone',
    rarity: 'rare',
  },
  {
    id: 'logs_100',
    name: 'Master Chronicler',
    description: 'Log 100 meals',
    emoji: '📚',
    category: 'milestone',
    rarity: 'epic',
  },

  // Special achievements
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Log food 7 days in a row',
    emoji: '🔥',
    category: 'streak',
    rarity: 'rare',
  },
  {
    id: 'month_streak',
    name: 'Monthly Master',
    description: 'Log food 30 days in a row',
    emoji: '⚡',
    category: 'streak',
    rarity: 'legendary',
  },
  {
    id: 'category_fruits',
    name: 'Fruit Fan',
    description: 'Try 10 different fruits',
    emoji: '🍎',
    category: 'special',
    rarity: 'common',
  },
  {
    id: 'category_vegetables',
    name: 'Veggie Victor',
    description: 'Try 10 different vegetables',
    emoji: '🥦',
    category: 'special',
    rarity: 'common',
  },
  {
    id: 'category_proteins',
    name: 'Protein Power',
    description: 'Try 10 different proteins',
    emoji: '🍗',
    category: 'special',
    rarity: 'rare',
  },
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common': return 'from-slate-400 to-slate-500';
    case 'rare': return 'from-blue-400 to-blue-600';
    case 'epic': return 'from-purple-400 to-purple-600';
    case 'legendary': return 'from-amber-400 to-orange-500';
  }
};

export const getRarityBorder = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common': return 'border-slate-300';
    case 'rare': return 'border-blue-400';
    case 'epic': return 'border-purple-400';
    case 'legendary': return 'border-amber-400';
  }
};
