import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { C } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Icons, getIcon } from '../components/Icons';
import { BottomSheet } from '../components/BottomSheet';
import { MealKey, DashboardStackParamList } from '../types';

type Nav = NativeStackNavigationProp<DashboardStackParamList, 'Dashboard'>;

const TR_DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function CalorieRing({ pct, kcal, target }: { pct: number; kcal: number; target: number }) {
  const size = 128, sw = 12;
  const r = (size - sw) / 2;
  const C_len = 2 * Math.PI * r;
  const animPct = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animPct, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct, animPct]);

  const dashArray = animPct.interpolate({
    inputRange: [0, 1],
    outputRange: [`0 ${C_len}`, `${C_len} ${C_len}`],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.line2} strokeWidth={sw} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={C.ink} strokeWidth={sw} fill="none"
          strokeDasharray={`${Math.min(pct, 1) * C_len} ${C_len}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '600', letterSpacing: -0.4, color: C.ink }}>{kcal.toLocaleString()}</Text>
        <Text style={{ fontSize: 10, color: C.ink3, letterSpacing: 0.4, marginTop: -2 }}>/ {target.toLocaleString()}</Text>
      </View>
    </View>
  );
}

function MacroBar({ label, got, goal, barColor }: { label: string; got: number; goal: number; barColor: string }) {
  const pct = Math.min(got / goal, 1);
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: pct, duration: 700, useNativeDriver: false }).start();
  }, [pct, widthAnim]);

  return (
    <View style={{ flex: 1, paddingRight: 10 }}>
      <Text style={{ fontSize: 11, color: C.ink3, letterSpacing: 0.4, fontWeight: '600', marginBottom: 6 }}>{label.toUpperCase()}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', letterSpacing: -0.2, color: C.ink }}>
        {got}<Text style={{ color: C.ink4, fontWeight: '500' }}>/{goal}g</Text>
      </Text>
      <View style={{ marginTop: 6, height: 4, borderRadius: 2, backgroundColor: C.line2, overflow: 'hidden' }}>
        <Animated.View style={{
          width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          height: '100%', backgroundColor: barColor,
        }} />
      </View>
    </View>
  );
}

function QuickTile({ title, value, sub, iconName, pct, tint, bar, onPress }: {
  title: string; value: string; sub: string; iconName: string;
  pct: number; tint: string; bar: string; onPress: () => void;
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: Math.min(pct, 1), duration: 700, useNativeDriver: false }).start();
  }, [pct, widthAnim]);

  return (
    <TouchableOpacity style={s.tile} onPress={onPress} activeOpacity={0.8}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
          {getIcon(iconName, { size: 18, color: bar, sw: 2 })}
        </View>
        <Icons.chevR size={16} color={C.ink4} sw={1.8} />
      </View>
      <View>
        <Text style={{ fontSize: 11, color: C.ink3, letterSpacing: 0.4, fontWeight: '600' }}>{title.toUpperCase()}</Text>
        <Text style={{ fontSize: 22, fontWeight: '600', letterSpacing: -0.4, color: C.ink, marginTop: 2 }}>
          {value} <Text style={{ fontSize: 11, color: C.ink4, fontWeight: '500' }}>{sub}</Text>
        </Text>
      </View>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: C.line2, overflow: 'hidden' }}>
        <Animated.View style={{
          width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          height: '100%', backgroundColor: bar,
        }} />
      </View>
    </TouchableOpacity>
  );
}

function MealCard({ mealKey, editing, onOpen, onAdd, onClear }: {
  mealKey: MealKey; editing: boolean;
  onOpen: () => void; onAdd: () => void; onClear: () => void;
}) {
  const { meals } = useApp();
  const meal = meals[mealKey];
  const tot = meal.items.reduce((s, i) => s + i.kcal, 0);
  const empty = meal.items.length === 0;

  return (
    <View style={[s.mealCard, editing && s.mealCardEditing]}>
      {editing && (
        <TouchableOpacity style={s.clearBtn} onPress={onClear} activeOpacity={0.8}>
          <Icons.x size={14} color="#fff" sw={2.4} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={s.mealCardInner}
        onPress={editing ? undefined : onOpen}
        activeOpacity={editing ? 1 : 0.7}
      >
        <View style={s.mealIcon}>
          {getIcon(meal.icon, { size: 19, color: C.ink2 })}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={s.mealName}>{meal.name}</Text>
            {!empty && <Text style={s.mealTime}>· {meal.time}</Text>}
          </View>
          <Text style={s.mealItems} numberOfLines={1}>
            {empty ? <Text style={{ color: C.ink4 }}>Henüz eklenmedi</Text>
              : `${meal.items.slice(0, 2).map(i => i.name).join(', ')}${meal.items.length > 2 ? ` +${meal.items.length - 2}` : ''}`}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', flexShrink: 0, paddingLeft: 4 }}>
          <Text style={s.mealKcal}>{tot}</Text>
          <Text style={s.mealKcalLabel}>KCAL</Text>
        </View>
      </TouchableOpacity>
      {!editing && (
        <TouchableOpacity style={s.addBtn} onPress={onAdd} activeOpacity={0.85}>
          <Icons.plus size={15} color={C.accent} sw={2.4} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function DashboardScreen() {
  const { meals, water, exercises, userName, setMeals, goalKcal, goalProtein, goalCarbs, goalFat } = useApp();
  const [bellOpen, setBellOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const totals = useMemo(() => {
    let kcal = 0, p = 0, c = 0, f = 0;
    Object.values(meals).forEach(m => m.items.forEach(it => { kcal += it.kcal; p += it.p; c += it.c; f += it.f; }));
    return { kcal, p, c, f };
  }, [meals]);

  const burned = exercises.reduce((s, e) => s + e.kcal, 0);
  const remaining = Math.max(goalKcal - totals.kcal + burned, 0);
  const pct = Math.min(totals.kcal / goalKcal, 1);

  const now = new Date();
  const dateStr = `${TR_DAYS[now.getDay()].toUpperCase()} · ${TR_MONTHS[now.getMonth()].toUpperCase()} ${now.getDate()}`;
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  const notifs = [
    { icon: 'clock', title: 'Öğle hatırlatıcısı', sub: 'Öğle yemeğini kaydetme zamanı!', time: '13:00', unread: true },
    { icon: 'flame', title: 'Seri kilometre taşı', sub: '12 gün üst üste kaydettiniz 🎯', time: '09:00', unread: true },
    { icon: 'drop', title: 'Su kontrolü', sub: 'Su hedefinizin 600ml gerisindeyiz.', time: '11:30', unread: false },
  ];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={s.greeting}>
          <View>
            <Text style={s.dateLabel}>{dateStr}</Text>
            <Text style={s.greetingText}>{greeting}, {userName.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity style={s.bellBtn} onPress={() => setBellOpen(true)} activeOpacity={0.8}>
            <Icons.bell size={20} color={C.ink} />
            <View style={s.bellDot} />
          </TouchableOpacity>
        </View>

        {/* Hero ring card */}
        <View style={s.heroCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <CalorieRing pct={pct} kcal={totals.kcal} target={goalKcal} />
            <View style={{ flex: 1 }}>
              <Text style={s.remainingLabel}>KALAN</Text>
              <Text style={s.remainingVal}>
                {remaining.toLocaleString()}<Text style={s.remainingUnit}> kcal</Text>
              </Text>
              <View style={{ marginTop: 14, gap: 6 }}>
                {[
                  { label: 'Günlük hedef', val: goalKcal.toLocaleString() },
                  { label: 'Yemek', val: totals.kcal.toLocaleString(), dir: 'down' },
                  { label: 'Egzersiz', val: burned.toLocaleString(), dir: 'up' },
                ].map(row => (
                  <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12.5, color: C.ink3 }}>{row.label}</Text>
                    <Text style={{ fontSize: 12.5, fontWeight: '500', color: C.ink }}>
                      {row.dir === 'down' ? '−' : row.dir === 'up' ? '+' : ''}{row.val}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={s.macroRow}>
            <MacroBar label="Protein" got={totals.p} goal={goalProtein} barColor={C.ink} />
            <MacroBar label="Karb" got={totals.c} goal={goalCarbs} barColor={C.accent} />
            <MacroBar label="Yağ" got={totals.f} goal={goalFat} barColor={C.move} />
          </View>
        </View>

        {/* Meal Planner CTA */}
        <TouchableOpacity
          style={s.plannerCard}
          onPress={() => navigation.navigate('MealPlanner')}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.plannerLabel}>AI ÖĞÜN PLANLAMA</Text>
            <Text style={s.plannerTitle}>Bugün ne yesem?</Text>
            <Text style={s.plannerSub}>Buzdolabındakileri seç, plan gelsin.</Text>
          </View>
          <View style={s.plannerIcon}>
            <Icons.bolt size={22} color={C.accentInk} sw={2} />
          </View>
        </TouchableOpacity>

        {/* Quick tiles */}
        <View style={s.tiles}>
          <QuickTile
            title="Su" value={`${(water / 1000).toFixed(1)}L`} sub="/ 2.5L"
            iconName="drop" pct={water / 2500} tint="#E9F2FB" bar={C.water}
            onPress={() => navigation.navigate('Water')}
          />
          <QuickTile
            title="Hareket" value={`${burned}`} sub="kcal yakıldı"
            iconName="bolt" pct={Math.min(burned / (goalKcal * 0.2), 1)} tint="#FBF1E0" bar={C.move}
            onPress={() => navigation.navigate('Exercise')}
          />
        </View>

        {/* Meals */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Bugünkü öğünler</Text>
          <TouchableOpacity onPress={() => setEditing(e => !e)}>
            <Text style={[s.editBtn, editing && { color: C.danger }]}>{editing ? 'Tamam' : 'Düzenle'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealKey[]).map(key => (
            <MealCard
              key={key}
              mealKey={key}
              editing={editing}
              onOpen={() => navigation.navigate('MealDetail', { mealKey: key })}
              onAdd={() => navigation.navigate('AddFood', { mealKey: key, fromMeal: false })}
              onClear={() => setMeals(prev => ({ ...prev, [key]: { ...prev[key], items: [] } }))}
            />
          ))}
        </View>

        {/* Exercise */}
        <View style={[s.sectionHeader, { marginTop: 16 }]}>
          <Text style={{ fontSize: 15, fontWeight: '600', letterSpacing: -0.2, color: C.ink }}>Egzersiz</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Exercise')}>
            <Text style={s.editBtn}>Tümünü gör</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
          {exercises.map(e => (
            <View key={e.id} style={s.exerciseRow}>
              <View style={s.exerciseIcon}>
                {getIcon(e.icon, { size: 20, color: '#8A5A10' })}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: C.ink }}>{e.name}</Text>
                <Text style={{ fontSize: 12, color: C.ink3 }}>{e.detail}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.ink }}>
                −{e.kcal} <Text style={{ fontSize: 11, color: C.ink4, fontWeight: '500' }}>kcal</Text>
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bell sheet */}
      <BottomSheet open={bellOpen} onClose={() => setBellOpen(false)} title="Bildirimler">
        <View>
          {notifs.map((n, i) => (
            <View key={i} style={[s.notifRow, i < notifs.length - 1 && s.notifBorder]}>
              <View style={[s.notifIcon, { backgroundColor: n.unread ? C.ink : C.line2 }]}>
                {getIcon(n.icon, { size: 18, color: n.unread ? C.accent : C.ink3 })}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: n.unread ? '600' : '500', color: C.ink }}>{n.title}</Text>
                <Text style={{ fontSize: 12, color: C.ink3, marginTop: 2, lineHeight: 16.8 }}>{n.sub}</Text>
              </View>
              <Text style={{ fontSize: 11, color: C.ink4, flexShrink: 0, marginLeft: 8 }}>{n.time}</Text>
            </View>
          ))}
          <TouchableOpacity style={s.markReadBtn} onPress={() => setBellOpen(false)} activeOpacity={0.85}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.accent }}>Tümünü okundu işaretle</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  greeting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 18, paddingBottom: 14 },
  dateLabel: { fontSize: 12, color: C.ink3, letterSpacing: 0.4 },
  greetingText: { fontSize: 22, fontWeight: '600', letterSpacing: -0.4, color: C.ink, marginTop: 2 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent, borderWidth: 1.5, borderColor: C.line2 },
  heroCard: { marginHorizontal: 16, marginBottom: 12, padding: 22, paddingBottom: 22, backgroundColor: C.card, borderRadius: 28, borderWidth: 1, borderColor: '#EEEEE8' },
  macroRow: { flexDirection: 'row', marginTop: 20, paddingTop: 18, borderTopWidth: 1, borderTopColor: C.line2 },
  remainingLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600' },
  remainingVal: { fontSize: 34, fontWeight: '600', letterSpacing: -0.9, lineHeight: 36, marginTop: 2, color: C.ink },
  remainingUnit: { fontSize: 14, color: C.ink3, fontWeight: '500' },
  plannerCard: { marginHorizontal: 16, marginBottom: 12, padding: 20, backgroundColor: C.ink, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  plannerLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, color: C.ink4, marginBottom: 4 },
  plannerTitle: { fontSize: 18, fontWeight: '600', letterSpacing: -0.3, color: C.bg },
  plannerSub: { fontSize: 12, color: C.ink3, marginTop: 3 },
  plannerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  tiles: { marginHorizontal: 16, marginBottom: 18, flexDirection: 'row', gap: 10 },
  tile: { flex: 1, padding: 16, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: '#EEEEE8', gap: 10 },
  sectionHeader: { paddingHorizontal: 22, paddingBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, color: C.ink },
  editBtn: { fontSize: 12, color: C.ink3, fontWeight: '600' },
  mealCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: '#EEEEE8', flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  mealCardEditing: { borderColor: '#F0C0B0' },
  clearBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center', marginLeft: 12, flexShrink: 0 },
  mealCardInner: { flex: 1, minWidth: 0, paddingVertical: 14, paddingLeft: 14, paddingRight: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  mealName: { fontSize: 14.5, fontWeight: '600', color: C.ink },
  mealTime: { fontSize: 10.5, color: C.ink4 },
  mealItems: { fontSize: 11.5, color: C.ink3, marginTop: 2 },
  mealKcal: { fontSize: 14, fontWeight: '600', color: C.ink },
  mealKcalLabel: { fontSize: 9.5, color: C.ink4, letterSpacing: 0.4 },
  addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginLeft: 8, flexShrink: 0 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, paddingHorizontal: 16, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: '#EEEEE8' },
  exerciseIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FBF1E0', alignItems: 'center', justifyContent: 'center' },
  notifRow: { flexDirection: 'row', gap: 14, paddingVertical: 14, alignItems: 'flex-start' },
  notifBorder: { borderBottomWidth: 1, borderBottomColor: C.line2 },
  notifIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  markReadBtn: { height: 50, borderRadius: 25, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
});
