export interface FoodItem {
  id: string;
  name: string;
  qty: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  src: string;
}

export interface Meal {
  name: string;
  icon: string;
  time: string;
  items: FoodItem[];
}

export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meals {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
}

export interface ExerciseItem {
  id: string;
  name: string;
  detail: string;
  kcal: number;
  icon: string;
}

export interface WeightLog {
  d: string;
  kg: number;
}

export interface SearchFood {
  name: string;
  qty: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  cat: string;
}

export interface NotifToggles {
  meals: boolean;
  weekly: boolean;
  water: boolean;
}

export interface NotifTimes {
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  weeklyTime: string;
  waterStart: string;
  waterEnd: string;
  waterInterval: number;
}

// Navigation param types
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  Report: undefined;
  FAB: undefined;
  Weight: undefined;
  Profile: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  MealDetail: { mealKey: MealKey };
  AddFood: { mealKey: MealKey; fromMeal: boolean };
  Water: undefined;
  Exercise: undefined;
  MealPlanner: undefined;
};
