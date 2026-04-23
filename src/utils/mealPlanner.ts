export interface PlanFood {
  name: string;
  qty: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  category: string;
  score?: number;
}

export interface SlotPlan {
  key: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  label: string;
  icon: string;
  targetKcal: number;
  foods: PlanFood[];
  totals: { kcal: number; p: number; c: number; f: number };
}

export interface DayPlan {
  slots: SlotPlan[];
  totals: { kcal: number; p: number; c: number; f: number };
  qualityScore: number; // 0-1
  kcalCoverage: number; // total / goal
}

// Slot definitions: kcal % of daily goal
const SLOT_DEFS: Array<{ key: SlotPlan['key']; label: string; icon: string; kcalPct: number }> = [
  { key: 'breakfast', label: 'Breakfast', icon: 'coffee', kcalPct: 0.25 },
  { key: 'lunch',     label: 'Lunch',     icon: 'sun',    kcalPct: 0.35 },
  { key: 'dinner',    label: 'Dinner',    icon: 'moon',   kcalPct: 0.30 },
  { key: 'snack',     label: 'Snack',     icon: 'apple',  kcalPct: 0.10 },
];

// Meal timing scores: category → [breakfast, lunch, dinner, snack]
// Reflects nutritional appropriateness of food category per meal time
const TIMING: Record<string, [number, number, number, number]> = {
  Grain:     [0.90, 0.75, 0.45, 0.50],
  Protein:   [0.55, 0.90, 0.95, 0.40],
  Fruit:     [0.90, 0.55, 0.30, 0.95],
  'Dairy alt':[0.85, 0.50, 0.40, 0.75],
  Fats:      [0.40, 0.65, 0.75, 0.45],
  Vegetable: [0.45, 0.90, 0.90, 0.50],
  Favorite:  [0.70, 0.80, 0.80, 0.60],
  Custom:    [0.70, 0.70, 0.70, 0.70],
};

function timingScore(category: string, slotIdx: number): number {
  return (TIMING[category] ?? TIMING.Custom)[slotIdx];
}

/**
 * Compute MCDM utility score for a food item in a given slot.
 * U = 0.30·C_kcal + 0.30·C_protein + 0.25·C_timing + 0.15·C_macro
 */
function utility(
  food: PlanFood,
  slotIdx: number,
  slotTargetKcal: number,
  goalRatios: { p: number; c: number; f: number },
): number {
  const safeKcal = food.kcal || 1;
  const idealPerItem = slotTargetKcal / 2.5;

  // C1: Kcal fit – how close is the food's calorie to the ideal per-item portion
  const C_kcal = Math.max(0, 1 - Math.abs(food.kcal - idealPerItem) / (idealPerItem + 1));

  // C2: Protein density – protein calories as fraction of total (ideal ~30%)
  const proteinRatio = (food.p * 4) / safeKcal;
  const C_protein = Math.min(proteinRatio / 0.30, 1);

  // C3: Meal timing appropriateness (lookup table)
  const C_timing = timingScore(food.category, slotIdx);

  // C4: Macro balance – Euclidean distance from goal macro ratios (lower = better)
  const fp = (food.p * 4) / safeKcal;
  const fc = (food.c * 4) / safeKcal;
  const ff = (food.f * 9) / safeKcal;
  const macroDist = Math.sqrt(
    (fp - goalRatios.p) ** 2 +
    (fc - goalRatios.c) ** 2 +
    (ff - goalRatios.f) ** 2,
  );
  const C_macro = Math.max(0, 1 - macroDist);

  return 0.30 * C_kcal + 0.30 * C_protein + 0.25 * C_timing + 0.15 * C_macro;
}

export function generateMealPlan(
  available: PlanFood[],
  goals: { kcal: number; protein: number; carbs: number; fat: number },
): DayPlan {
  const goalRatios = {
    p: goals.kcal > 0 ? (goals.protein * 4) / goals.kcal : 0.30,
    c: goals.kcal > 0 ? (goals.carbs * 4) / goals.kcal : 0.45,
    f: goals.kcal > 0 ? (goals.fat * 9) / goals.kcal : 0.25,
  };

  const pool = [...available]; // shrinks as foods are assigned
  const slots: SlotPlan[] = [];

  SLOT_DEFS.forEach((def, slotIdx) => {
    const targetKcal = goals.kcal * def.kcalPct;

    // Score all remaining foods for this slot
    const scored = pool
      .map(food => ({ ...food, score: utility(food, slotIdx, targetKcal, goalRatios) }))
      .sort((a, b) => b.score - a.score);

    const selected: PlanFood[] = [];
    let running = 0;

    for (const food of scored) {
      if (selected.length >= 3) break;
      if (running >= targetKcal * 0.85) break;
      selected.push(food);
      running += food.kcal;
      const idx = pool.findIndex(f => f.name === food.name);
      if (idx >= 0) pool.splice(idx, 1);
    }

    const totals = selected.reduce(
      (acc, f) => ({ kcal: acc.kcal + f.kcal, p: acc.p + f.p, c: acc.c + f.c, f: acc.f + f.f }),
      { kcal: 0, p: 0, c: 0, f: 0 },
    );

    slots.push({ key: def.key, label: def.label, icon: def.icon, targetKcal, foods: selected, totals });
  });

  const totals = slots.reduce(
    (acc, s) => ({ kcal: acc.kcal + s.totals.kcal, p: acc.p + s.totals.p, c: acc.c + s.totals.c, f: acc.f + s.totals.f }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  );

  // Quality score: kcal accuracy (40%) + macro balance (40%) + variety (20%)
  const kcalAcc = Math.max(0, 1 - Math.abs(totals.kcal - goals.kcal) / (goals.kcal || 1));
  const macroDistDay = Math.sqrt(
    ((totals.p * 4) / (totals.kcal || 1) - goalRatios.p) ** 2 +
    ((totals.c * 4) / (totals.kcal || 1) - goalRatios.c) ** 2 +
    ((totals.f * 9) / (totals.kcal || 1) - goalRatios.f) ** 2,
  );
  const macroAcc = Math.max(0, 1 - macroDistDay);
  const categories = new Set(slots.flatMap(s => s.foods.map(f => f.category)));
  const varietyScore = Math.min(categories.size / 4, 1);

  const qualityScore = 0.40 * kcalAcc + 0.40 * macroAcc + 0.20 * varietyScore;
  const kcalCoverage = totals.kcal / (goals.kcal || 1);

  return { slots, totals, qualityScore, kcalCoverage };
}
