import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Defs, ClipPath, G } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

import { C } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Icons } from '../components/Icons';
import { ScreenHeader } from '../components/ScreenHeader';
import { TARGET } from '../data/mockData';

function WaterBottle({ pct }: { pct: number }) {
  const fillY = 140 - pct * 130;
  const fillH = pct * 130;
  return (
    <View style={{ width: 72, height: 140, flexShrink: 0 }}>
      <Svg viewBox="0 0 72 140" width={72} height={140}>
        <Defs>
          <ClipPath id="bottle">
            <Path d="M26 10 h20 a2 2 0 0 1 2 2 v8 c0 4 8 10 8 22 v82 a14 14 0 0 1-14 14 h-12 a14 14 0 0 1-14-14 v-82 c0-12 8-18 8-22 v-8 a2 2 0 0 1 2-2z" />
          </ClipPath>
        </Defs>
        <Path d="M26 10 h20 a2 2 0 0 1 2 2 v8 c0 4 8 10 8 22 v82 a14 14 0 0 1-14 14 h-12 a14 14 0 0 1-14-14 v-82 c0-12 8-18 8-22 v-8 a2 2 0 0 1 2-2z" fill={C.line2} />
        <G clipPath="url(#bottle)">
          <Rect x="0" y={fillY} width="72" height={fillH} fill={C.water} />
          <Rect x="0" y={fillY - 4} width="72" height="8" fill="#8CC2E8" />
        </G>
        <Path d="M26 10 h20 a2 2 0 0 1 2 2 v8 c0 4 8 10 8 22 v82 a14 14 0 0 1-14 14 h-12 a14 14 0 0 1-14-14 v-82 c0-12 8-18 8-22 v-8 a2 2 0 0 1 2-2z" stroke="#D4D4CC" strokeWidth="1.5" fill="none" />
      </Svg>
    </View>
  );
}

const WEEK_WATER = [1800, 2400, 2100, 2600, 2200, 1900];
const DAY_LABELS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

export function WaterScreen() {
  const { water, setWater } = useApp();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const target = TARGET.water;
  const pct = Math.min(water / target, 1);
  const cups = Math.round(water / 250);
  const targetCups = Math.round(target / 250);
  const add = (ml: number) => setWater((v: number) => Math.max(0, v + ml));

  const weekData = [...WEEK_WATER, water];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScreenHeader title="Su" onBack={() => navigation.goBack()} />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={s.heroCard}>
          <WaterBottle pct={pct} />
          <View style={{ flex: 1 }}>
            <Text style={s.heroLabel}>BUGÜN</Text>
            <Text style={s.heroVal}>
              {(water / 1000).toFixed(1)}<Text style={s.heroUnit}>L</Text>
            </Text>
            <Text style={s.heroSub}>/ {(target / 1000).toFixed(1)}L · %{Math.round(pct * 100)}</Text>
            <View style={s.cupsRow}>
              {Array.from({ length: targetCups }).map((_, i) => (
                <View key={i} style={[s.cup, i < cups && s.cupFilled]} />
              ))}
            </View>
          </View>
        </View>

        {/* Quick add */}
        <Text style={s.sectionLabel}>HIZLI EKLE</Text>
        <View style={s.quickGrid}>
          {[{ ml: 200, label: 'Bardak' }, { ml: 330, label: 'Kutu' }, { ml: 500, label: 'Şişe' }].map(q => (
            <TouchableOpacity key={q.ml} style={s.quickCard} onPress={() => add(q.ml)} activeOpacity={0.8}>
              <Icons.drop size={22} color={C.water} />
              <Text style={s.quickMl}>+{q.ml}ml</Text>
              <Text style={s.quickCardLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.undoBtn} onPress={() => add(-250)} activeOpacity={0.8}>
          <Text style={s.undoBtnText}>Geri al (−250ml)</Text>
        </TouchableOpacity>

        {/* Weekly chart */}
        <Text style={s.sectionLabel}>BU HAFTA</Text>
        <View style={s.chartCard}>
          <View style={s.chartBars}>
            {weekData.map((v, i) => {
              const h = Math.min(v / 3000, 1) * 100;
              const isToday = i === 6;
              return (
                <View key={i} style={s.barCol}>
                  <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={[s.bar, { height: `${h}%` as any, backgroundColor: isToday ? C.water : '#D5E8F5' }]} />
                  </View>
                  <Text style={[s.barLabel, isToday && s.barLabelToday]}>{DAY_LABELS[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  heroCard: { padding: 24, paddingHorizontal: 24, backgroundColor: C.card, borderRadius: 26, borderWidth: 1, borderColor: '#EEEEE8', flexDirection: 'row', alignItems: 'center', gap: 22, marginBottom: 22 },
  heroLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600' },
  heroVal: { fontSize: 36, fontWeight: '600', letterSpacing: -0.9, lineHeight: 38, marginTop: 2, color: C.ink },
  heroUnit: { fontSize: 14, color: C.ink3, fontWeight: '500' },
  heroSub: { fontSize: 13, color: C.ink3, marginTop: 4 },
  cupsRow: { flexDirection: 'row', gap: 4, marginTop: 12 },
  cup: { flex: 1, height: 6, borderRadius: 3, backgroundColor: C.line2 },
  cupFilled: { backgroundColor: C.water },
  sectionLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600', marginBottom: 10, marginLeft: 4 },
  quickGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  quickCard: { flex: 1, paddingVertical: 18, paddingHorizontal: 10, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: '#EEEEE8', alignItems: 'center', gap: 6 },
  quickMl: { fontSize: 15, fontWeight: '600', color: C.ink },
  quickCardLabel: { fontSize: 11, color: C.ink3 },
  undoBtn: { height: 46, borderRadius: 23, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  undoBtnText: { fontSize: 13, fontWeight: '500', color: C.ink2 },
  chartCard: { padding: 18, backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: '#EEEEE8', marginBottom: 10 },
  chartBars: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 110 },
  barCol: { flex: 1, alignItems: 'center', gap: 6, height: '100%' },
  bar: { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, color: C.ink4, fontWeight: '500' },
  barLabelToday: { color: C.ink, fontWeight: '600' },
});
