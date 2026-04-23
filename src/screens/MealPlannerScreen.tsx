import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, TextInput, Alert, Modal, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { C } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Icons } from '../components/Icons';
import { FOOD_DB, toSearchFood } from '../data/foodDatabase';
import { generateMealPlan, PlanFood, DayPlan, SlotPlan } from '../utils/mealPlanner';
import { MealKey } from '../types';

const ALL_FOODS: PlanFood[] = FOOD_DB.map(item => {
  const sf = toSearchFood(item);
  return { name: sf.name, qty: sf.qty, kcal: sf.kcal, p: sf.p, c: sf.c, f: sf.f, category: sf.cat };
});

const CATEGORIES = [
  'Tümü', 'Tahıl', 'Ekmek', 'Et & Tavuk', 'Balık',
  'Süt & Yumurta', 'Sebze', 'Meyve', 'Baklagil',
  'Kuruyemiş', 'Yağ', 'Türk Mutfağı', 'Atıştırmalık', 'İçecek', 'Fitness',
];

// ── Sub-components ───────────────────────────────────────────────────────────

function QualityBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 75 ? '#4A6B1A' : pct >= 50 ? C.move : C.danger;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ fontSize: 13, fontWeight: '600', color }}>Plan kalitesi: %{pct}</Text>
    </View>
  );
}

function MacroPill({ label, val, goal, color }: { label: string; val: number; goal: number; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: C.ink }}>{val}g</Text>
      <Text style={{ fontSize: 10, color: C.ink4 }}>/{goal}g {label}</Text>
      <View style={{ width: 36, height: 3, borderRadius: 2, backgroundColor: C.line2 }}>
        <View style={{ width: `${Math.min(val / goal, 1) * 100}%` as any, height: '100%', borderRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

function SlotCard({ slot }: { slot: SlotPlan }) {
  const pct = slot.targetKcal > 0 ? Math.min(slot.totals.kcal / slot.targetKcal, 1) : 0;
  const slotIcons: Record<string, string> = { breakfast: '☀️', lunch: '🕛', dinner: '🌙', snack: '🍎' };
  return (
    <View style={sc.card}>
      <View style={sc.cardHeader}>
        <Text style={sc.slotEmoji}>{slotIcons[slot.key]}</Text>
        <View style={{ flex: 1 }}>
          <Text style={sc.slotLabel}>{slot.label.toUpperCase()}</Text>
          <Text style={sc.slotTarget}>Hedef: {Math.round(slot.targetKcal)} kcal</Text>
        </View>
        <Text style={sc.slotKcal}>{slot.totals.kcal} kcal</Text>
      </View>
      <View style={sc.progressTrack}>
        <View style={[sc.progressFill, { width: `${pct * 100}%` as any }]} />
      </View>
      {slot.foods.length === 0 ? (
        <Text style={{ fontSize: 13, color: C.ink4, marginTop: 8, fontStyle: 'italic' }}>
          Yeterli malzeme yok
        </Text>
      ) : (
        <View style={{ gap: 6, marginTop: 10 }}>
          {slot.foods.map((food, i) => (
            <View key={i} style={sc.foodRow}>
              <View style={{ flex: 1 }}>
                <Text style={sc.foodName}>{food.name}</Text>
                <Text style={sc.foodQty}>{food.qty}</Text>
              </View>
              <Text style={sc.foodKcal}>{food.kcal} kcal</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Food Picker Modal ────────────────────────────────────────────────────────

function FoodPickerModal({
  visible, onClose, selected, onToggle, customFoods,
}: {
  visible: boolean; onClose: () => void;
  selected: Set<string>; onToggle: (name: string) => void;
  customFoods: PlanFood[];
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('Tümü');
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(true);
  const catRef = useRef<ScrollView>(null);
  const scrollXRef = useRef(0);

  const allPickerFoods = useMemo(() => [...ALL_FOODS, ...customFoods], [customFoods]);

  const onCatScroll = (e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    scrollXRef.current = contentOffset.x;
    setFadeLeft(contentOffset.x > 4);
    setFadeRight(contentOffset.x + layoutMeasurement.width < contentSize.width - 4);
  };

  const scrollCatRight = () => catRef.current?.scrollTo({ x: scrollXRef.current + 160, animated: true });
  const scrollCatLeft = () => catRef.current?.scrollTo({ x: Math.max(0, scrollXRef.current - 160), animated: true });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPickerFoods.filter(food => {
      const matchQ = !q || food.name.toLowerCase().includes(q);
      const matchC = activeCat === 'Tümü' || food.category === activeCat;
      return matchQ && matchC;
    });
  }, [query, activeCat, allPickerFoods]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[fp.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={fp.header}>
          <TouchableOpacity style={fp.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Icons.x size={18} color={C.ink} sw={2} />
          </TouchableOpacity>
          <Text style={fp.title}>Malzeme Seç</Text>
          {selected.size > 0 ? (
            <View style={fp.badge}><Text style={fp.badgeText}>{selected.size}</Text></View>
          ) : <View style={{ width: 32 }} />}
        </View>

        {/* Search */}
        <View style={fp.searchWrap}>
          <Icons.search size={16} color={C.ink3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ara…"
            placeholderTextColor={C.ink4}
            style={fp.searchInput}
            autoCorrect={false}
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icons.x size={14} color={C.ink3} sw={1.8} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category pills with fade edges */}
        <View style={{ position: 'relative' }}>
          <ScrollView
            ref={catRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={fp.catScroll}
            contentContainerStyle={fp.catContent}
            onScroll={onCatScroll}
            scrollEventThrottle={16}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[fp.catPill, activeCat === cat && fp.catPillActive]}
                onPress={() => setActiveCat(cat)}
                activeOpacity={0.75}
              >
                <Text style={[fp.catText, activeCat === cat && fp.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Left fade */}
          {fadeLeft && Platform.OS === 'web' && (
            <TouchableOpacity
              onPress={scrollCatLeft}
              activeOpacity={0.8}
              style={[fp.catFade, { left: 0, backgroundImage: 'linear-gradient(to right, #FAFAF7 60%, rgba(250,250,247,0))' } as any]}
            >
              <View style={fp.catFadeChevronLeft}>
                <Icons.chevL size={14} color={C.ink3} sw={2} />
              </View>
            </TouchableOpacity>
          )}
          {/* Right fade + chevron hint */}
          {fadeRight && Platform.OS === 'web' && (
            <TouchableOpacity
              onPress={scrollCatRight}
              activeOpacity={0.8}
              style={[fp.catFade, { right: 0, backgroundImage: 'linear-gradient(to left, #FAFAF7 60%, rgba(250,250,247,0))' } as any]}
            >
              <View style={fp.catFadeChevron}>
                <Icons.chevR size={14} color={C.ink3} sw={2} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Result count */}
        <Text style={fp.resultCount}>{filtered.length} yiyecek</Text>

        {/* Food list */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.name}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 110 }}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: C.line2, marginLeft: 64 }} />
          )}
          renderItem={({ item }) => {
            const on = selected.has(item.name);
            return (
              <TouchableOpacity
                style={[fp.row, on && fp.rowOn]}
                onPress={() => onToggle(item.name)}
                activeOpacity={0.7}
              >
                <View style={[fp.check, on && fp.checkOn]}>
                  {on && <Icons.check size={12} color="#fff" sw={2.8} />}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={fp.rowName} numberOfLines={1}>{item.name}</Text>
                  <Text style={fp.rowQty}>{item.qty}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 3 }}>
                    <Text style={fp.rowMacro}>P {item.p}g</Text>
                    <Text style={fp.rowMacro}>K {item.c}g</Text>
                    <Text style={fp.rowMacro}>Y {item.f}g</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                  <Text style={fp.rowKcal}>{item.kcal}</Text>
                  <Text style={fp.rowKcalLabel}>kcal</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* Done button */}
        <View style={[fp.doneWrap, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity style={fp.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Icons.check size={17} color={C.accentInk} sw={2.4} />
            <Text style={fp.doneBtnText}>
              {selected.size > 0 ? `${selected.size} seçildi · Tamam` : 'Tamam'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export function MealPlannerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { goalKcal, goalProtein, goalCarbs, goalFat, addItem } = useApp();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFoods, setCustomFoods] = useState<PlanFood[]>([]);

  const toggleFood = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
    setPlan(null);
  };

  const addCustomFood = () => {
    const kcal = parseInt(customKcal);
    if (!customName.trim() || !kcal) {
      Alert.alert('Hata', 'İsim ve kalori gereklidir.');
      return;
    }
    const food: PlanFood = {
      name: customName.trim(), qty: '1 porsiyon', kcal,
      p: parseInt(customProtein) || 0,
      c: parseInt(customCarbs) || 0,
      f: parseInt(customFat) || 0,
      category: 'Custom',
    };
    setCustomFoods(prev => [...prev, food]);
    setSelected(prev => new Set([...prev, food.name]));
    setCustomName(''); setCustomKcal(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat('');
    setShowCustom(false);
    setPlan(null);
  };

  const deleteCustomFood = (name: string) => {
    setCustomFoods(prev => prev.filter(f => f.name !== name));
    setSelected(prev => { const next = new Set(prev); next.delete(name); return next; });
    setPlan(null);
  };

  const handleGenerate = () => {
    const foods = [
      ...ALL_FOODS.filter(f => selected.has(f.name)),
      ...customFoods.filter(f => selected.has(f.name)),
    ];
    if (foods.length < 2) {
      Alert.alert('Yetersiz malzeme', 'Lütfen en az 2 malzeme seçin.');
      return;
    }
    setPlan(generateMealPlan(foods, { kcal: goalKcal, protein: goalProtein, carbs: goalCarbs, fat: goalFat }));
  };

  const handleApply = () => {
    if (!plan) return;
    plan.slots.forEach(slot => {
      slot.foods.forEach(food => {
        addItem(slot.key as MealKey, { name: food.name, qty: food.qty, kcal: food.kcal, p: food.p, c: food.c, f: food.f, cat: food.category }, 1);
      });
    });
    Alert.alert('Hazır!', "Öğün planı bugünün log'una eklendi.", [
      { text: 'Tamam', onPress: () => navigation.goBack() },
    ]);
  };

  const selectedNames = useMemo(() => [...selected], [selected]);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Icons.chevL size={20} color={C.ink} sw={1.8} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>AI ÖĞÜN PLANLAMA</Text>
          <Text style={s.title}>Ne yiyebilirim?</Text>
        </View>
        {plan && (
          <TouchableOpacity style={s.iconBtn} onPress={handleGenerate} activeOpacity={0.8}>
            <Icons.refresh size={18} color={C.ink} sw={1.8} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Malzeme kartı ── */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.sectionLabel}>MALZEMELER</Text>
            <TouchableOpacity style={s.selectBtn} onPress={() => setPickerVisible(true)} activeOpacity={0.8}>
              <Icons.plus size={13} color={C.ink} sw={2.2} />
              <Text style={s.selectBtnText}>Seç</Text>
            </TouchableOpacity>
          </View>

          {selected.size === 0 ? (
            <TouchableOpacity style={s.emptyState} onPress={() => setPickerVisible(true)} activeOpacity={0.8}>
              <Icons.bowl size={28} color={C.ink4} />
              <Text style={s.emptyTitle}>Buzdolabındakileri seç</Text>
              <Text style={s.emptySub}>Elimizdekilerle günlük plan oluşturalım</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.chipWrap}>
              {selectedNames.map(name => (
                <TouchableOpacity key={name} style={s.chip} onPress={() => toggleFood(name)} activeOpacity={0.75}>
                  <Text style={s.chipText} numberOfLines={1}>{name}</Text>
                  <Icons.x size={10} color={C.ink3} sw={2.2} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={s.chipAdd} onPress={() => setPickerVisible(true)} activeOpacity={0.75}>
                <Icons.plus size={12} color={C.ink3} sw={2} />
                <Text style={[s.chipText, { color: C.ink3 }]}>Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Özel malzeme ── */}
        <View style={s.card}>
          <TouchableOpacity style={s.cardHeaderRow} onPress={() => setShowCustom(v => !v)} activeOpacity={0.8}>
            <Text style={s.sectionLabel}>ÖZEL MALZEME EKLE</Text>
            <Icons.chevR size={16} color={C.ink3} sw={1.8} />
          </TouchableOpacity>

          {customFoods.length > 0 && (
            <View style={{ gap: 6, marginTop: 8 }}>
              {customFoods.map(food => (
                <View key={food.name} style={s.customRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.customName}>{food.name}</Text>
                    <Text style={s.customMeta}>{food.kcal} kcal · P{food.p} C{food.c} F{food.f}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteCustomFood(food.name)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                    <Icons.trash size={16} color={C.ink4} sw={1.6} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {showCustom && (
            <View style={{ gap: 10, marginTop: 12 }}>
              <TextInput
                style={s.input}
                placeholder="Yiyecek adı (örn: Ev yapımı köfte)"
                placeholderTextColor={C.ink4}
                value={customName}
                onChangeText={setCustomName}
              />
              <View style={s.macroGrid}>
                {[
                  { label: 'Kalori (kcal) *', val: customKcal, set: setCustomKcal },
                  { label: 'Protein (g)', val: customProtein, set: setCustomProtein },
                  { label: 'Karbonhidrat (g)', val: customCarbs, set: setCustomCarbs },
                  { label: 'Yağ (g)', val: customFat, set: setCustomFat },
                ].map(({ label, val, set }) => (
                  <View key={label} style={s.macroGridItem}>
                    <Text style={s.macroGridLabel}>{label}</Text>
                    <TextInput
                      style={s.macroGridInput}
                      placeholder="0"
                      placeholderTextColor={C.ink4}
                      value={val}
                      onChangeText={set}
                      keyboardType="number-pad"
                    />
                  </View>
                ))}
              </View>
              <TouchableOpacity style={s.addCustomBtn} onPress={addCustomFood} activeOpacity={0.85}>
                <Icons.plus size={16} color={C.accent} sw={2.2} />
                <Text style={s.addCustomBtnText}>Listeme ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Özet + Generate ── */}
        <View style={s.summaryRow}>
          <Text style={s.summaryText}>{selected.size} malzeme seçili</Text>
          <Text style={s.summaryText}>Hedef: {goalKcal.toLocaleString()} kcal/gün</Text>
        </View>

        <TouchableOpacity
          style={[s.generateBtn, selected.size < 2 && s.generateBtnOff]}
          onPress={handleGenerate}
          activeOpacity={0.85}
        >
          <Icons.bolt size={18} color={selected.size < 2 ? C.ink4 : C.accentInk} sw={2} />
          <Text style={[s.generateBtnText, selected.size < 2 && { color: C.ink4 }]}>Plan Oluştur</Text>
        </TouchableOpacity>

        {/* ── Plan sonucu ── */}
        {plan && (
          <View style={{ gap: 10 }}>
            <View style={s.planHeaderRow}>
              <QualityBadge score={plan.qualityScore} />
              <Text style={s.summaryText}>Toplam: {plan.totals.kcal} / {goalKcal} kcal</Text>
            </View>
            <View style={s.macroSummary}>
              <MacroPill label="Protein" val={plan.totals.p} goal={goalProtein} color={C.ink} />
              <View style={s.divider} />
              <MacroPill label="Carbs" val={plan.totals.c} goal={goalCarbs} color={C.accent} />
              <View style={s.divider} />
              <MacroPill label="Fat" val={plan.totals.f} goal={goalFat} color={C.move} />
            </View>
            {plan.slots.map(slot => <SlotCard key={slot.key} slot={slot} />)}
            <TouchableOpacity style={s.applyBtn} onPress={handleApply} activeOpacity={0.85}>
              <Icons.check size={18} color={C.accentInk} sw={2.4} />
              <Text style={s.applyBtnText}>Bugünün log'una uygula</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <FoodPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        selected={selected}
        onToggle={toggleFood}
        customFoods={customFoods}
      />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, color: C.ink3 },
  title: { fontSize: 20, fontWeight: '600', letterSpacing: -0.4, color: C.ink, marginTop: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, color: C.ink3 },

  card: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 16, gap: 0 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: C.ink },
  selectBtnText: { fontSize: 13, fontWeight: '600', color: C.accent },

  emptyState: { alignItems: 'center', paddingVertical: 22, gap: 6 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: C.ink },
  emptySub: { fontSize: 12, color: C.ink3, textAlign: 'center' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, backgroundColor: C.ink, maxWidth: 160 },
  chipText: { fontSize: 12, fontWeight: '500', color: C.accent, flexShrink: 1 },
  chipAdd: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, backgroundColor: C.line2, borderWidth: 1, borderColor: C.line, borderStyle: 'dashed' },

  customRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.line2, gap: 10 },
  customName: { fontSize: 13, fontWeight: '500', color: C.ink },
  customMeta: { fontSize: 11, color: C.ink3, marginTop: 1 },

  input: { padding: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.line, fontSize: 14, color: C.ink },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  macroGridItem: { width: '47%' },
  macroGridLabel: { fontSize: 11, fontWeight: '600', color: C.ink3, marginBottom: 4 },
  macroGridInput: { padding: 11, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1.5, borderColor: C.line, fontSize: 15, color: C.ink, fontWeight: '600' },
  addCustomBtn: { height: 46, borderRadius: 23, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  addCustomBtnText: { fontSize: 14, fontWeight: '600', color: C.accent },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryText: { fontSize: 12, color: C.ink3 },
  generateBtn: { height: 56, borderRadius: 28, backgroundColor: C.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  generateBtnOff: { backgroundColor: C.line2 },
  generateBtnText: { fontSize: 15, fontWeight: '700', color: C.accentInk, letterSpacing: -0.1 },

  planHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  macroSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 16 },
  divider: { width: 1, height: 32, backgroundColor: C.line2, marginHorizontal: 12 },
  applyBtn: { height: 56, borderRadius: 28, backgroundColor: C.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  applyBtnText: { fontSize: 15, fontWeight: '600', color: C.accent },
});

const sc = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  slotEmoji: { fontSize: 22 },
  slotLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, color: C.ink3 },
  slotTarget: { fontSize: 12, color: C.ink4, marginTop: 1 },
  slotKcal: { fontSize: 16, fontWeight: '600', color: C.ink },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: C.line2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: C.accent },
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: C.line2 },
  foodName: { fontSize: 13, fontWeight: '500', color: C.ink },
  foodQty: { fontSize: 11, color: C.ink4, marginTop: 1 },
  foodKcal: { fontSize: 13, fontWeight: '600', color: C.ink3 },
});

const fp = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '600', color: C.ink, letterSpacing: -0.2 },
  badge: { minWidth: 32, height: 26, borderRadius: 13, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  badgeText: { fontSize: 13, fontWeight: '700', color: C.accent },

  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 10, padding: 12, paddingHorizontal: 14, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.line },
  searchInput: { flex: 1, fontSize: 14, color: C.ink },

  catScroll: { flexGrow: 0 },
  catContent: { paddingHorizontal: 20, gap: 7, paddingBottom: 8 },
  catPill: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  catPillActive: { backgroundColor: C.ink, borderColor: C.ink },
  catText: { fontSize: 13, fontWeight: '500', color: C.ink2 },
  catTextActive: { color: C.accent },
  catFade: { position: 'absolute', top: 0, bottom: 0, width: 72, zIndex: 10 },
  catFadeChevron: { position: 'absolute', right: 4, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  catFadeChevronLeft: { position: 'absolute', left: 4, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },

  resultCount: { fontSize: 11, fontWeight: '600', color: C.ink3, letterSpacing: 0.4, paddingHorizontal: 20, paddingBottom: 4 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 13 },
  rowOn: { backgroundColor: '#F5FAF0' },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: C.ink, borderColor: C.ink },
  rowName: { fontSize: 14, fontWeight: '500', color: C.ink },
  rowQty: { fontSize: 11, color: C.ink3, marginTop: 1 },
  rowKcal: { fontSize: 14, fontWeight: '600', color: C.ink },
  rowKcalLabel: { fontSize: 10, color: C.ink4, letterSpacing: 0.3 },
  rowMacro: { fontSize: 10, color: C.ink4 },

  doneWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: 'rgba(250,250,247,0.96)', borderTopWidth: 1, borderTopColor: C.line },
  doneBtn: { height: 54, borderRadius: 27, backgroundColor: C.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  doneBtnText: { fontSize: 15, fontWeight: '600', color: C.accent },
});
