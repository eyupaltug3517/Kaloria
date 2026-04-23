import { Meals, SearchFood, ExerciseItem } from '../types';

export const DEFAULT_MEALS: Meals = {
  breakfast: {
    name: 'Kahvaltı',
    icon: 'coffee',
    time: '8:42 AM',
    items: [
      { id: 'b1', name: 'Greek yogurt', qty: '200 g', kcal: 180, p: 18, c: 12, f: 6, src: 'Fage' },
      { id: 'b2', name: 'Blueberries', qty: '80 g', kcal: 46, p: 1, c: 11, f: 0, src: 'Fresh' },
      { id: 'b3', name: 'Granola', qty: '30 g', kcal: 132, p: 3, c: 20, f: 4, src: "Bob's Red Mill" },
    ],
  },
  lunch: {
    name: 'Öğle',
    icon: 'bowl',
    time: '1:15 PM',
    items: [
      { id: 'l1', name: 'Grilled chicken bowl', qty: '1 bowl', kcal: 520, p: 42, c: 48, f: 14, src: 'Sweetgreen' },
      { id: 'l2', name: 'Sourdough bread', qty: '1 slice', kcal: 110, p: 4, c: 20, f: 1, src: 'Home' },
    ],
  },
  dinner: {
    name: 'Akşam',
    icon: 'moon',
    time: '—',
    items: [],
  },
  snack: {
    name: 'Atıştırmalık',
    icon: 'apple',
    time: '4:30 PM',
    items: [
      { id: 's1', name: 'Almonds', qty: '20 g', kcal: 116, p: 4, c: 4, f: 10, src: 'Raw' },
    ],
  },
};

export const TARGET = { kcal: 2100, p: 140, c: 230, f: 65, water: 2500 };

export const WEEK_DATA = [
  { d: 'M', kcal: 1920, target: 2100 },
  { d: 'T', kcal: 2240, target: 2100 },
  { d: 'W', kcal: 1810, target: 2100 },
  { d: 'T', kcal: 2050, target: 2100 },
  { d: 'F', kcal: 2410, target: 2100 },
  { d: 'S', kcal: 1650, target: 2100 },
  { d: 'S', kcal: 1104, target: 2100 },
];

export const SEARCH_POOL: SearchFood[] = [
  { name: 'Banana', qty: '1 medium (118 g)', kcal: 105, p: 1, c: 27, f: 0, cat: 'Fruit' },
  { name: 'Oat milk', qty: '250 ml', kcal: 120, p: 3, c: 16, f: 5, cat: 'Dairy alt' },
  { name: 'Chicken breast', qty: '100 g, cooked', kcal: 165, p: 31, c: 0, f: 3, cat: 'Protein' },
  { name: 'Brown rice', qty: '1 cup cooked', kcal: 216, p: 5, c: 45, f: 2, cat: 'Grain' },
  { name: 'Avocado', qty: '½ medium', kcal: 160, p: 2, c: 9, f: 15, cat: 'Fruit' },
  { name: 'Whole egg', qty: '1 large', kcal: 72, p: 6, c: 0, f: 5, cat: 'Protein' },
  { name: 'Almond butter', qty: '1 tbsp', kcal: 98, p: 3, c: 3, f: 9, cat: 'Fats' },
  { name: 'Salmon fillet', qty: '120 g', kcal: 250, p: 26, c: 0, f: 16, cat: 'Protein' },
  { name: 'Sweet potato', qty: '1 medium', kcal: 112, p: 2, c: 26, f: 0, cat: 'Vegetable' },
  { name: 'Olive oil', qty: '1 tbsp', kcal: 119, p: 0, c: 0, f: 14, cat: 'Fats' },
];

export const FAVORITES = [
  { name: 'Overnight oats', kcal: 340, qty: 'Bowl', p: 12, c: 52, f: 8, cat: 'Favorite' },
  { name: 'Protein shake', kcal: 210, qty: '400 ml', p: 30, c: 8, f: 5, cat: 'Favorite' },
  { name: 'Chicken & rice', kcal: 620, qty: 'Standard', p: 45, c: 70, f: 14, cat: 'Favorite' },
  { name: 'Espresso', kcal: 2, qty: '30 ml', p: 0, c: 0, f: 0, cat: 'Favorite' },
];

export const DEFAULT_EXERCISES: ExerciseItem[] = [
  { id: 'e1', name: 'Morning run', detail: '5.2 km · 28 min', kcal: 412, icon: 'bolt' },
  { id: 'e2', name: 'Bodyweight circuit', detail: '20 min · moderate', kcal: 168, icon: 'dumbbell' },
];
