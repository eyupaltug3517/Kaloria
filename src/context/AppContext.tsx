import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meals, MealKey, FoodItem, ExerciseItem, WeightLog, NotifToggles, NotifTimes } from '../types';
import { DEFAULT_MEALS } from '../data/mockData';

function usePersistedState<T>(key: string, defaultVal: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [val, setVal] = useState<T>(defaultVal);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(key).then(stored => {
      if (stored !== null) {
        try { setVal(JSON.parse(stored)); } catch {}
      }
      setLoaded(true);
    });
  }, [key]);

  const setAndSave = useCallback((v: T | ((prev: T) => T)) => {
    setVal(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [key]);

  return [val, setAndSave];
}

const emptyMeals = (): Meals => ({
  breakfast: { ...DEFAULT_MEALS.breakfast, items: [], time: '—' },
  lunch: { ...DEFAULT_MEALS.lunch, items: [], time: '—' },
  dinner: { ...DEFAULT_MEALS.dinner, items: [], time: '—' },
  snack: { ...DEFAULT_MEALS.snack, items: [], time: '—' },
});

interface AppContextType {
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  userName: string;
  setUserName: (v: string) => void;
  userEmail: string;
  setUserEmail: (v: string) => void;
  goalKcal: number;
  setGoalKcal: (v: number) => void;
  goalProtein: number;
  setGoalProtein: (v: number) => void;
  goalCarbs: number;
  setGoalCarbs: (v: number) => void;
  goalFat: number;
  setGoalFat: (v: number) => void;
  goalWeight: string;
  setGoalWeight: (v: string) => void;
  activity: string;
  setActivity: (v: string) => void;
  units: string;
  setUnits: (v: string) => void;
  notifToggles: NotifToggles;
  setNotifToggles: (v: NotifToggles) => void;
  notifTimes: NotifTimes;
  setNotifTimes: (v: NotifTimes) => void;
  weightLogs: WeightLog[];
  setWeightLogs: (v: WeightLog[] | ((p: WeightLog[]) => WeightLog[])) => void;
  streak: number;
  setStreak: (v: number | ((p: number) => number)) => void;
  meals: Meals;
  setMeals: (v: Meals | ((p: Meals) => Meals)) => void;
  water: number;
  setWater: (v: number | ((p: number) => number)) => void;
  exercises: ExerciseItem[];
  setExercises: (v: ExerciseItem[] | ((p: ExerciseItem[]) => ExerciseItem[])) => void;
  addItem: (mealKey: MealKey, item: Omit<FoodItem, 'id'> & { cat?: string }, servings: number) => void;
  deleteItem: (mealKey: MealKey, id: string) => void;
  signOut: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = usePersistedState('kaloria-onboarded', false);
  const [userName, setUserName] = usePersistedState('kaloria-name', 'Alex Morgan');
  const [userEmail, setUserEmail] = usePersistedState('kaloria-email', 'alex@morgan.co');
  const [goalKcal, setGoalKcal] = usePersistedState('kaloria-goal-kcal', 2100);
  const [goalProtein, setGoalProtein] = usePersistedState('kaloria-goal-protein', 158);
  const [goalCarbs, setGoalCarbs] = usePersistedState('kaloria-goal-carbs', 236);
  const [goalFat, setGoalFat] = usePersistedState('kaloria-goal-fat', 58);
  const [goalWeight, setGoalWeight] = usePersistedState('kaloria-goal-weight', '74.0');
  const [activity, setActivity] = usePersistedState('kaloria-activity', 'Moderate');
  const [units, setUnits] = usePersistedState('kaloria-units', 'metric');
  const [notifToggles, setNotifToggles] = usePersistedState<NotifToggles>('kaloria-notif', { meals: true, weekly: true, water: false });
  const [notifTimes, setNotifTimes] = usePersistedState<NotifTimes>('kaloria-notif-times', {
    breakfastTime: '08:00', lunchTime: '13:00', dinnerTime: '19:00',
    weeklyTime: '09:00', waterStart: '08:00', waterEnd: '20:00', waterInterval: 2,
  });
  const [weightLogs, setWeightLogs] = usePersistedState<WeightLog[]>('kaloria-weights', []);
  const [streak, setStreak] = usePersistedState('kaloria-streak', 0);

  const [meals, setMeals] = useState<Meals>(emptyMeals());
  const [water, setWater] = useState(0);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);

  const addItem = useCallback((mealKey: MealKey, item: any, servings: number) => {
    const it: FoodItem = {
      id: 'x' + Date.now() + Math.random(),
      name: item.name,
      qty: servings === 1 ? item.qty : `${servings}× ${item.qty}`,
      kcal: Math.round(item.kcal * servings),
      p: Math.round((item.p || 0) * servings),
      c: Math.round((item.c || 0) * servings),
      f: Math.round((item.f || 0) * servings),
      src: item.cat || 'Custom',
    };
    setMeals(prev => {
      const allEmpty = Object.values(prev).every(m => m.items.length === 0);
      if (allEmpty) setStreak(s => s + 1);
      return {
        ...prev,
        [mealKey]: {
          ...prev[mealKey],
          items: [...prev[mealKey].items, it],
          time: prev[mealKey].time === '—' ? 'Just now' : prev[mealKey].time,
        },
      };
    });
  }, [setStreak]);

  const deleteItem = useCallback((mealKey: MealKey, id: string) => {
    setMeals(prev => ({
      ...prev,
      [mealKey]: { ...prev[mealKey], items: prev[mealKey].items.filter(i => i.id !== id) },
    }));
  }, []);

  const signOut = useCallback(() => {
    setHasOnboarded(false);
    setUserName('');
    setUserEmail('');
    setGoalKcal(2100);
    setGoalProtein(158);
    setGoalCarbs(236);
    setGoalFat(58);
    setGoalWeight('74.0');
    setActivity('Moderate');
    setUnits('metric');
    setNotifToggles({ meals: true, weekly: true, water: false });
    setNotifTimes({ breakfastTime: '08:00', lunchTime: '13:00', dinnerTime: '19:00', weeklyTime: '09:00', waterStart: '08:00', waterEnd: '20:00', waterInterval: 2 });
    setWeightLogs([]);
    setStreak(0);
    setMeals(emptyMeals());
    setWater(0);
    setExercises([]);
  }, [setHasOnboarded, setUserName, setUserEmail, setGoalKcal, setGoalProtein, setGoalCarbs, setGoalFat, setGoalWeight, setActivity, setUnits, setNotifToggles, setNotifTimes, setWeightLogs, setStreak]);

  return (
    <AppContext.Provider value={{
      hasOnboarded, setHasOnboarded,
      userName, setUserName,
      userEmail, setUserEmail,
      goalKcal, setGoalKcal,
      goalProtein, setGoalProtein,
      goalCarbs, setGoalCarbs,
      goalFat, setGoalFat,
      goalWeight, setGoalWeight,
      activity, setActivity,
      units, setUnits,
      notifToggles, setNotifToggles,
      notifTimes, setNotifTimes,
      weightLogs, setWeightLogs,
      streak, setStreak,
      meals, setMeals,
      water, setWater,
      exercises, setExercises,
      addItem, deleteItem, signOut,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
