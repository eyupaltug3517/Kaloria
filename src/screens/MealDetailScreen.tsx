import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { C } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Icons, getIcon } from '../components/Icons';
import { BottomSheet } from '../components/BottomSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { FoodItem, MealKey, DashboardStackParamList } from '../types';

type Nav = NativeStackNavigationProp<DashboardStackParamList, 'MealDetail'>;
type Route = RouteProp<DashboardStackParamList, 'MealDetail'>;

function SwipeItem({ item, onDelete }: { item: FoodItem; onDelete: () => void }) {
  const offset = useRef(new Animated.Value(0)).current;
  const startX = useRef(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5,
    onPanResponderGrant: (_, gs) => {
      startX.current = 0;
      offset.setOffset(0);
    },
    onPanResponderMove: (_, gs) => {
      const dx = Math.max(Math.min(gs.dx, 0), -110);
      offset.setValue(dx);
    },
    onPanResponderRelease: (_, gs) => {
      offset.flattenOffset();
      const cur = (offset as any)._value;
      Animated.timing(offset, {
        toValue: cur < -60 ? -96 : 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    },
  });

  const initials = item.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <View style={si.container}>
      <TouchableOpacity style={si.deleteAction} onPress={onDelete} activeOpacity={0.9}>
        <Icons.trash size={18} color="#fff" />
        <Text style={si.deleteText}>Delete</Text>
      </TouchableOpacity>
      <Animated.View style={[si.row, { transform: [{ translateX: offset }] }]} {...panResponder.panHandlers}>
        <View style={si.initials}>
          <Text style={si.initialsText}>{initials}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={si.name} numberOfLines={1}>{item.name}</Text>
          <Text style={si.qty}>{item.qty} · {item.src}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={si.kcal}>{item.kcal}</Text>
          <Text style={si.kcalLabel}>KCAL</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export function MealDetailScreen() {
  const { meals, deleteItem } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { mealKey } = route.params;
  const meal = meals[mealKey];

  const tot = meal.items.reduce(
    (s, i) => ({ kcal: s.kcal + i.kcal, p: s.p + i.p, c: s.c + i.c, f: s.f + i.f }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );

  const options = [
    { icon: 'edit', label: 'Rename meal', sub: 'Change display name', action: () => setMoreOpen(false), danger: false },
    { icon: 'clock', label: 'Set meal time', sub: 'Update time stamp', action: () => setMoreOpen(false), danger: false },
    { icon: 'trash', label: 'Clear all items', sub: `Remove all ${meal.items.length} item${meal.items.length !== 1 ? 's' : ''}`, action: () => { meal.items.forEach(it => deleteItem(mealKey as MealKey, it.id)); setMoreOpen(false); }, danger: true },
  ];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={meal.name}
        sub={meal.time}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity style={s.moreBtn} onPress={() => setMoreOpen(true)} activeOpacity={0.8}>
            <Icons.more size={20} color={C.ink} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Meal total */}
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>MEAL TOTAL</Text>
          <Text style={s.totalKcal}>{tot.kcal.toLocaleString()} <Text style={s.totalUnit}>kcal</Text></Text>
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 14 }}>
            <Text style={s.macroText}><Text style={s.macroVal}>{tot.p}g</Text> <Text style={s.macroName}>protein</Text></Text>
            <Text style={s.macroText}><Text style={s.macroVal}>{tot.c}g</Text> <Text style={s.macroName}>carbs</Text></Text>
            <Text style={s.macroText}><Text style={s.macroVal}>{tot.f}g</Text> <Text style={s.macroName}>fat</Text></Text>
          </View>
        </View>

        <Text style={s.itemsLabel}>ITEMS</Text>
        <View style={{ gap: 8 }}>
          {meal.items.map(it => (
            <SwipeItem key={it.id} item={it} onDelete={() => deleteItem(mealKey as MealKey, it.id)} />
          ))}
          {meal.items.length === 0 && (
            <View style={s.emptyBox}>
              <Text style={{ color: C.ink4, fontSize: 14 }}>No items yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add button */}
      <View style={[s.addWrap, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate('AddFood', { mealKey: mealKey as MealKey, fromMeal: true })}
          activeOpacity={0.85}
        >
          <Icons.plus size={18} color={C.accent} sw={2.4} />
          <Text style={s.addBtnText}>Add to {meal.name.toLowerCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* More sheet */}
      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title={meal.name}>
        <View>
          {options.map((o, i) => (
            <TouchableOpacity key={o.label} style={[s.optionRow, i < options.length - 1 && s.optionBorder]} onPress={o.action} activeOpacity={0.8}>
              <View style={[s.optionIcon, o.danger && s.optionIconDanger]}>
                {getIcon(o.icon, { size: 18, color: o.danger ? C.danger : C.ink2 })}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.optionLabel, o.danger && { color: C.danger }]}>{o.label}</Text>
                <Text style={s.optionSub}>{o.sub}</Text>
              </View>
              <Icons.chevR size={16} color={C.ink4} sw={1.8} />
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

const si = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden', backgroundColor: C.danger },
  deleteAction: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  deleteText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  row: { padding: 14, paddingHorizontal: 16, backgroundColor: C.card, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#EEEEE8' },
  initials: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 11, fontWeight: '600', color: C.ink3 },
  name: { fontSize: 14, fontWeight: '500', color: C.ink },
  qty: { fontSize: 12, color: C.ink3, marginTop: 2 },
  kcal: { fontSize: 14, fontWeight: '600', color: C.ink },
  kcalLabel: { fontSize: 10, color: C.ink4, letterSpacing: 0.4 },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  moreBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  totalCard: { padding: 20, backgroundColor: C.card, borderRadius: 22, borderWidth: 1, borderColor: '#EEEEE8', marginBottom: 16 },
  totalLabel: { fontSize: 11, color: C.ink3, fontWeight: '600', letterSpacing: 0.6 },
  totalKcal: { fontSize: 38, fontWeight: '600', letterSpacing: -1, marginTop: 4, color: C.ink },
  totalUnit: { fontSize: 14, color: C.ink3, fontWeight: '500' },
  macroText: { fontSize: 12.5 },
  macroVal: { fontWeight: '700', color: C.ink },
  macroName: { color: C.ink3 },
  itemsLabel: { fontSize: 12, color: C.ink3, letterSpacing: 0.5, fontWeight: '600', paddingVertical: 6, marginBottom: 4, marginTop: 4 },
  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, borderStyle: 'dashed' },
  addWrap: { position: 'absolute', bottom: 0, left: 20, right: 20 },
  addBtn: { height: 54, borderRadius: 27, backgroundColor: C.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: C.ink, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  addBtnText: { fontSize: 15, fontWeight: '600', color: C.accent },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: C.line2 },
  optionIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optionIconDanger: { backgroundColor: '#FDF0EC' },
  optionLabel: { fontSize: 15, fontWeight: '500', color: C.ink },
  optionSub: { fontSize: 12, color: C.ink3, marginTop: 2 },
});
