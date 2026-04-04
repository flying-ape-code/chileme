// 用户喜好类型定义

export type PreferenceType = 'diet' | 'taste' | 'ingredient' | 'avoid';
export type DietType = 'vegetarian' | 'meat' | 'omnivore';
export type TasteType = 'spicy' | 'non_spicy' | 'mild_spicy' | 'heavy_spicy';
export type IngredientType = 'seafood' | 'beef' | 'pork' | 'chicken' | 'lamb' | 'vegetable' | 'egg' | 'dairy';

export interface UserPreference {
  id: string;
  user_id: string;
  preference_type: PreferenceType;
  preference_value: string;
  weight: number;
  created_at: string;
  updated_at: string;
}

export const WEIGHT_CONFIG = {
  avoid: 0,
  dislike: 0.3,
  neutral: 1.0,
  like: 2.0,
} as const;
