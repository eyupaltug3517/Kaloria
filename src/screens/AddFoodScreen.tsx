import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { C } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Icons, getIcon } from '../components/Icons';
import { BottomSheet } from '../components/BottomSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { FAVORITES } from '../data/mockData';
import { searchFoodDB } from '../data/foodDatabase';
import { SearchFood, DashboardStackParamList } from '../types';

type Nav = NativeStackNavigationProp<DashboardStackParamList, 'AddFood'>;
type Route = RouteProp<DashboardStackParamList, 'AddFood'>;

const TABS = [
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'barcode', label: 'Scan', icon: 'barcode' },
  { id: 'photo', label: 'Photo', icon: 'camera' },
  { id: 'manual', label: 'Manual', icon: 'edit' },
] as const;

function FoodDetail({ item, onAdd }: { item: SearchFood; onAdd: (servings: number) => void }) {
  const [servings, setServings] = useState(1);
  const total = Math.round(item.kcal * servings);
  return (
    <View style={{ paddingBottom: 10 }}>
      <Text style={fd.name}>{item.name}</Text>
      <Text style={fd.meta}>{item.qty} · {item.cat}</Text>

      <View style={fd.servingsCard}>
        <Text style={fd.servingsLabel}>SERVINGS</Text>
        <View style={fd.servingsRow}>
          <TouchableOpacity style={fd.stepBtn} onPress={() => setServings(v => Math.max(0.5, v - 0.5))} activeOpacity={0.8}>
            <Text style={fd.stepBtnText}>−</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={fd.servingsVal}>{servings}</Text>
            <Text style={fd.servingsUnit}>× serving</Text>
          </View>
          <TouchableOpacity style={fd.stepBtn} onPress={() => setServings(v => v + 0.5)} activeOpacity={0.8}>
            <Text style={fd.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={fd.statsRow}>
        {[{ label: 'kcal', v: total, big: true }, { label: 'P (g)', v: Math.round(item.p * servings) }, { label: 'C (g)', v: Math.round(item.c * servings) }, { label: 'F (g)', v: Math.round(item.f * servings) }].map(stat => (
          <View key={stat.label} style={fd.statCard}>
            <Text style={[fd.statVal, stat.big && fd.statValBig]}>{stat.v}</Text>
            <Text style={fd.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={fd.addBtn} onPress={() => onAdd(servings)} activeOpacity={0.85}>
        <Text style={fd.addBtnText}>Add {total} kcal</Text>
      </TouchableOpacity>
    </View>
  );
}

function SearchPanel({ onPick }: { onPick: (item: SearchFood) => void }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => searchFoodDB(q), [q]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={sp.searchRow}>
          <Icons.search size={18} color={C.ink3} />
          <TextInput
            value={q} onChangeText={setQ}
            placeholder="Search foods, brands…"
            placeholderTextColor={C.ink4}
            style={sp.searchInput}
            autoFocus
          />
          <Icons.mic size={18} color={C.ink4} />
        </View>

        {!q && (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={sp.sectionLabel}>FAVORITES</Text>
            <View style={sp.favGrid}>
              {FAVORITES.map(f => (
                <TouchableOpacity
                  key={f.name}
                  style={sp.favCard}
                  onPress={() => onPick({ name: f.name, qty: f.qty, kcal: f.kcal, p: f.p, c: f.c, f: f.f, cat: 'Favorite' })}
                  activeOpacity={0.8}
                >
                  <Icons.star size={16} color="#C9A600" />
                  <Text style={sp.favName}>{f.name}</Text>
                  <Text style={sp.favMeta}>{f.kcal} kcal · {f.qty}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ paddingHorizontal: 20 }}>
          <Text style={sp.sectionLabel}>{q ? `${results.length} SONUÇ` : 'ÖNERİLEN'}</Text>
          <View style={{ gap: 8 }}>
            {results.map(r => (
              <TouchableOpacity key={r.name} style={sp.resultRow} onPress={() => onPick(r)} activeOpacity={0.8}>
                <View style={sp.catBadge}>
                  <Text style={sp.catBadgeText}>{r.cat.slice(0, 3).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={sp.resultName}>{r.name}</Text>
                  <Text style={sp.resultQty}>{r.qty}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={sp.resultKcal}>{r.kcal}</Text>
                  <Text style={sp.resultKcalLabel}>KCAL</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BarcodePanel({ onPick }: { onPick: (item: SearchFood) => void }) {
  const [scanning, setScanning] = useState(true);
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(lineAnim, { toValue: 1, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(lineAnim, { toValue: 0, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    anim.start();
    const t = setTimeout(() => {
      anim.stop();
      setScanning(false);
      setTimeout(() => onPick({ name: 'Kind Protein Bar', qty: '1 bar (50 g)', kcal: 190, p: 12, c: 17, f: 8, cat: 'Snack' }), 600);
    }, 2800);
    return () => { anim.stop(); clearTimeout(t); };
  }, [lineAnim, onPick]);

  const translateY = lineAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 130] });

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <View style={bp.frame}>
        <View style={bp.frameInner}>
          {/* Corners */}
          {[{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }, { bottom: 0, right: 0 }].map((pos, i) => (
            <View key={i} style={[bp.corner, pos as any]} />
          ))}
          {scanning && (
            <Animated.View style={[bp.scanLine, { transform: [{ translateY }] }]} />
          )}
        </View>
        <Text style={bp.statusText}>{scanning ? 'Looking for barcode…' : '✓ Found!'}</Text>
        <Text style={bp.hintText}>Align the barcode within the frame</Text>
      </View>
    </View>
  );
}

function PhotoPanel({ onPick }: { onPick: (item: SearchFood) => void }) {
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'result'>('idle');
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === 'analyzing') {
      const anim = Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 900, useNativeDriver: true }));
      anim.start();
      return () => anim.stop();
    }
  }, [phase, spinAnim]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const detected = [
    { name: 'Avocado toast', qty: '1 slice', kcal: 290, p: 8, c: 28, f: 16, cat: 'Breakfast' },
    { name: 'Fried egg', qty: '1 large', kcal: 92, p: 6, c: 0, f: 7, cat: 'Protein' },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={pp.imgPlaceholder}>
        <View style={{ alignItems: 'center' }}>
          <Icons.camera size={32} color={C.ink4} />
          <Text style={pp.imgLabel}>food photo</Text>
        </View>
        {phase === 'analyzing' && (
          <View style={pp.overlay}>
            <Animated.View style={[pp.spinner, { transform: [{ rotate: spin }] }]} />
            <Text style={pp.analysingText}>Analysing…</Text>
          </View>
        )}
      </View>

      {phase === 'result' && (
        <View style={{ marginTop: 16 }}>
          <Text style={pp.detectedLabel}>AI DETECTED</Text>
          {detected.map(r => (
            <TouchableOpacity key={r.name} style={pp.detectedRow} onPress={() => onPick(r)} activeOpacity={0.8}>
              <View style={pp.checkIcon}>
                <Icons.check size={16} color="#4A6B1A" sw={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={pp.detectedName}>{r.name}</Text>
                <Text style={pp.detectedMeta}>{r.qty} · 96% match</Text>
              </View>
              <Text style={pp.detectedKcal}>{r.kcal}<Text style={pp.detectedKcalUnit}> kcal</Text></Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={pp.photoBtn}
        onPress={() => {
          if (phase === 'idle') { setPhase('analyzing'); setTimeout(() => setPhase('result'), 1800); }
          else if (phase === 'result') { setPhase('idle'); }
        }}
        activeOpacity={0.85}
      >
        <Icons.camera size={18} color={C.accent} />
        <Text style={pp.photoBtnText}>{phase === 'idle' ? 'Take a photo' : phase === 'analyzing' ? 'Analysing…' : 'Retake'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ManualPanel({ onAdd }: { onAdd: (item: SearchFood) => void }) {
  const [form, setForm] = useState({ name: '', kcal: '', p: '', c: '', f: '', qty: '1 serving' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim().length > 0 && parseInt(form.kcal) > 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={mp.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={mp.hint}>Can't find it? Enter the nutrition info from the label.</Text>
        {[
          { label: 'FOOD NAME *', key: 'name', placeholder: 'e.g. Homemade pasta', numeric: false },
          { label: 'SERVING SIZE', key: 'qty', placeholder: 'e.g. 1 cup, 100 g', numeric: false },
        ].map(f => (
          <View key={f.key} style={mp.field}>
            <Text style={mp.fieldLabel}>{f.label}</Text>
            <TextInput
              value={form[f.key as keyof typeof form]}
              onChangeText={v => set(f.key, v)}
              placeholder={f.placeholder}
              placeholderTextColor={C.ink4}
              style={[mp.input, form[f.key as keyof typeof form] ? mp.inputFilled : {}]}
            />
          </View>
        ))}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {[
            { label: 'CALORIES (KCAL) *', key: 'kcal', placeholder: '0' },
            { label: 'PROTEIN (G)', key: 'p', placeholder: '0' },
            { label: 'CARBS (G)', key: 'c', placeholder: '0' },
            { label: 'FAT (G)', key: 'f', placeholder: '0' },
          ].map(f => (
            <View key={f.key} style={{ width: '47%' }}>
              <Text style={mp.fieldLabel}>{f.label}</Text>
              <TextInput
                value={form[f.key as keyof typeof form]}
                onChangeText={v => set(f.key, v)}
                placeholder={f.placeholder}
                placeholderTextColor={C.ink4}
                keyboardType="decimal-pad"
                style={[mp.input, form[f.key as keyof typeof form] ? mp.inputFilled : {}]}
              />
            </View>
          ))}
        </View>

        {valid && (
          <View style={mp.preview}>
            <Text><Text style={mp.previewBig}>{form.kcal}</Text> kcal  </Text>
            {form.p ? <Text><Text style={{ fontWeight: '700' }}>{form.p}g</Text> P  </Text> : null}
            {form.c ? <Text><Text style={{ fontWeight: '700' }}>{form.c}g</Text> C  </Text> : null}
            {form.f ? <Text><Text style={{ fontWeight: '700' }}>{form.f}g</Text> F</Text> : null}
          </View>
        )}

        <TouchableOpacity
          style={[mp.addBtn, !valid && mp.addBtnDisabled]}
          onPress={() => {
            if (!valid) return;
            onAdd({
              name: form.name.trim(), qty: form.qty || '1 serving',
              kcal: parseInt(form.kcal) || 0, p: parseInt(form.p) || 0,
              c: parseInt(form.c) || 0, f: parseInt(form.f) || 0, cat: 'Custom',
            });
          }}
          activeOpacity={valid ? 0.85 : 1}
        >
          <Text style={[mp.addBtnText, !valid && mp.addBtnTextDisabled]}>
            Add {valid ? `${form.kcal} kcal` : 'food'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function AddFoodScreen() {
  const [tab, setTab] = useState<'search' | 'barcode' | 'photo' | 'manual'>('search');
  const [selected, setSelected] = useState<SearchFood | null>(null);
  const { addItem } = useApp();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { mealKey, fromMeal } = route.params;

  const handleAdd = (item: SearchFood, servings: number) => {
    addItem(mealKey, item, servings);
    navigation.goBack();
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScreenHeader title={`Add to ${mealKey}`} onBack={() => navigation.goBack()} />

      <View style={s.tabBarWrap}>
        <View style={s.tabBar}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[s.tabBtn, tab === t.id && s.tabBtnActive]}
              onPress={() => setTab(t.id)}
              activeOpacity={0.8}
            >
              {getIcon(t.icon, { size: 15, color: tab === t.id ? C.ink : C.ink3, sw: 1.8 })}
              <Text style={[s.tabLabel, tab === t.id && s.tabLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'search' && <SearchPanel onPick={setSelected} />}
        {tab === 'barcode' && <BarcodePanel onPick={setSelected} />}
        {tab === 'photo' && <PhotoPanel onPick={setSelected} />}
        {tab === 'manual' && <ManualPanel onAdd={item => handleAdd(item, 1)} />}
      </View>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title="Add food">
        {selected && <FoodDetail item={selected} onAdd={servings => handleAdd(selected, servings)} />}
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  tabBarWrap: { paddingHorizontal: 20, paddingBottom: 14 },
  tabBar: { backgroundColor: C.line2, borderRadius: 14, padding: 4, flexDirection: 'row', gap: 2 },
  tabBtn: { flex: 1, height: 40, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabBtnActive: { backgroundColor: C.card, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  tabLabel: { fontSize: 13, fontWeight: '500', color: C.ink3 },
  tabLabelActive: { color: C.ink },
});

const sp = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingHorizontal: 16, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line, marginHorizontal: 20, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14, color: C.ink },
  sectionLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600', marginTop: 8, marginBottom: 10, marginLeft: 2 },
  favGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  favCard: { width: '47%', padding: 14, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: '#EEEEE8' },
  favName: { fontSize: 13, fontWeight: '500', marginTop: 8, lineHeight: 16.25, color: C.ink },
  favMeta: { fontSize: 11, color: C.ink3, marginTop: 2 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 14, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: '#EEEEE8' },
  catBadge: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  catBadgeText: { fontSize: 10, fontWeight: '600', color: C.ink3 },
  resultName: { fontSize: 14, fontWeight: '500', color: C.ink },
  resultQty: { fontSize: 12, color: C.ink3 },
  resultKcal: { fontSize: 14, fontWeight: '600', color: C.ink },
  resultKcalLabel: { fontSize: 10, color: C.ink4, letterSpacing: 0.4 },
});

const bp = StyleSheet.create({
  frame: { flex: 1, backgroundColor: '#0E0E0C', borderRadius: 22, overflow: 'hidden', minHeight: 340, alignItems: 'center', justifyContent: 'center', padding: 20 },
  frameInner: { width: 260, height: 150, borderWidth: 2, borderColor: C.accent, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  corner: { position: 'absolute', width: 22, height: 22, borderWidth: 3, borderColor: C.accent },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: C.accent },
  statusText: { fontSize: 13, color: C.accent, fontWeight: '500', letterSpacing: 0.4, marginTop: 20 },
  hintText: { fontSize: 11, color: C.ink4, marginTop: 4 },
});

const pp = StyleSheet.create({
  imgPlaceholder: { aspectRatio: 4 / 3, backgroundColor: C.line2, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  imgLabel: { fontSize: 11, color: C.ink3, marginTop: 6 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,14,12,0.55)', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 44, height: 44, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)', borderTopColor: C.accent, borderRadius: 22 },
  analysingText: { color: '#fff', fontSize: 13, fontWeight: '500', marginTop: 16 },
  detectedLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600', marginBottom: 10 },
  detectedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 14, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: '#EEEEE8', marginBottom: 8 },
  checkIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#ECF7D9', alignItems: 'center', justifyContent: 'center' },
  detectedName: { fontSize: 14, fontWeight: '500', color: C.ink },
  detectedMeta: { fontSize: 12, color: C.ink3 },
  detectedKcal: { fontSize: 14, fontWeight: '600', color: C.ink },
  detectedKcalUnit: { fontSize: 10, color: C.ink4, fontWeight: '500' },
  photoBtn: { height: 52, borderRadius: 26, backgroundColor: C.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: C.accent },
});

const mp = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  hint: { fontSize: 13, color: C.ink3, lineHeight: 19.5, marginBottom: 18 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: C.ink3, letterSpacing: 0.5, marginBottom: 5 },
  input: { width: '100%', padding: 12, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1.5, borderColor: C.line, fontSize: 15, color: C.ink },
  inputFilled: { borderColor: C.ink },
  preview: { flexDirection: 'row', padding: 14, paddingHorizontal: 16, backgroundColor: C.surface, borderRadius: 14, marginBottom: 16, fontSize: 12 },
  previewBig: { fontSize: 15, fontWeight: '700', color: C.ink },
  addBtn: { height: 54, borderRadius: 27, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { backgroundColor: C.line },
  addBtnText: { fontSize: 15, fontWeight: '600', color: C.accentInk },
  addBtnTextDisabled: { color: C.ink4 },
});

const fd = StyleSheet.create({
  name: { fontSize: 19, fontWeight: '600', letterSpacing: -0.3, color: C.ink, marginTop: 6 },
  meta: { fontSize: 13, color: C.ink3, marginTop: 2, marginBottom: 14 },
  servingsCard: { padding: 16, paddingHorizontal: 18, backgroundColor: C.surface, borderRadius: 16, marginBottom: 14 },
  servingsLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600', marginBottom: 8 },
  servingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 22, color: C.ink },
  servingsVal: { fontSize: 28, fontWeight: '600', letterSpacing: -0.4, color: C.ink },
  servingsUnit: { fontSize: 11, color: C.ink3 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  statCard: { flex: 1, padding: 12, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: '#EEEEE8', alignItems: 'center' },
  statVal: { fontSize: 17, fontWeight: '600', letterSpacing: -0.3, color: C.ink },
  statValBig: { fontSize: 20 },
  statLabel: { fontSize: 10, color: C.ink3, letterSpacing: 0.4, marginTop: 2 },
  addBtn: { height: 54, borderRadius: 27, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 15, fontWeight: '600', color: C.accentInk },
});
