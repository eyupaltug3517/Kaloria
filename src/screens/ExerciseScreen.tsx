import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { C } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { getIcon, Icons } from '../components/Icons';
import { BottomSheet } from '../components/BottomSheet';
import { ExerciseItem } from '../types';

const QUICK_LOG = [
  { name: 'Koşu',                icon: 'bolt',     rate: '10 kcal/dak', kcalPerMin: 10 },
  { name: 'Bisiklet',            icon: 'refresh',  rate: '7 kcal/dak',  kcalPerMin: 7  },
  { name: 'Ağırlık antrenmanı', icon: 'dumbbell', rate: '6 kcal/dak',  kcalPerMin: 6  },
  { name: 'Yürüyüş',            icon: 'leaf',     rate: '4 kcal/dak',  kcalPerMin: 4  },
];

const ICON_OPTIONS = [
  'bolt', 'dumbbell', 'leaf', 'flame', 'drop', 'star',
  'clock', 'sun', 'moon', 'arrowUp', 'refresh', 'mic',
  'bell', 'apple', 'coffee', 'bowl',
];

export function ExerciseScreen() {
  const { exercises, setExercises } = useApp();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName]         = useState('');
  const [mins, setMins]         = useState('');
  const [kcal, setKcal]         = useState('');
  const [icon, setIcon]         = useState('bolt');

  const total    = exercises.reduce((s, e) => s + e.kcal, 0);
  const totalMin = exercises.reduce((s, e) => {
    const m = parseInt(e.detail?.match(/(\d+)\s*dak/)?.[1] || '0');
    return s + m;
  }, 0);
  const totalKm  = exercises.reduce((s, e) => {
    const k = parseFloat(e.detail?.match(/([\d.]+)\s*km/)?.[1] || '0');
    return s + k;
  }, 0);
  const steps = Math.round(totalKm * 1320);

  const addQuick = (q: typeof QUICK_LOG[0]) => {
    const newEx: ExerciseItem = {
      id: 'x' + Date.now() + Math.random(),
      name: q.name,
      detail: '20 dak · orta',
      kcal: q.kcalPerMin * 20,
      icon: q.icon,
    };
    setExercises((prev: ExerciseItem[]) => [...prev, newEx]);
  };

  const handleAdd = () => {
    if (!name.trim()) { Alert.alert('Hata', 'Egzersiz adı giriniz.'); return; }
    const k = parseInt(kcal) || 0;
    const m = parseInt(mins) || 0;
    if (k <= 0 && m <= 0) { Alert.alert('Hata', 'Süre veya kalori giriniz.'); return; }

    const detail = m > 0 ? `${m} dak` : '';
    const newEx: ExerciseItem = {
      id: 'x' + Date.now() + Math.random(),
      name: name.trim(),
      detail,
      kcal: k > 0 ? k : 0,
      icon,
    };
    setExercises((prev: ExerciseItem[]) => [...prev, newEx]);
    setSheetOpen(false);
    setName(''); setMins(''); setKcal(''); setIcon('bolt');
  };

  const deleteExercise = (id: string) => {
    setExercises((prev: ExerciseItem[]) => prev.filter(e => e.id !== id));
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScreenHeader title="Egzersiz" onBack={() => navigation.goBack()} />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Dark hero */}
        <View style={s.heroCard}>
          <View style={s.heroBg} />
          <Text style={s.heroLabel}>BUGÜN YAKILAN</Text>
          <Text style={s.heroVal}>{total}<Text style={s.heroUnit}> kcal</Text></Text>
          <View style={s.heroStats}>
            {[
              { label: 'Süre',   val: totalMin > 0 ? `${totalMin} dak`          : '—' },
              { label: 'Adım',   val: steps    > 0 ? steps.toLocaleString()      : '—' },
              { label: 'Mesafe', val: totalKm  > 0 ? `${totalKm.toFixed(1)} km` : '—' },
            ].map(stat => (
              <View key={stat.label}>
                <Text style={s.heroStatLabel}>{stat.label}</Text>
                <Text style={s.heroStatVal}>{stat.val}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={s.sectionLabel}>BUGÜNKÜ AKTİVİTE</Text>
        <View style={{ gap: 8, marginBottom: 22 }}>
          {exercises.map(e => (
            <View key={e.id} style={s.exerciseRow}>
              <View style={s.exerciseIcon}>
                {getIcon(e.icon, { size: 20, color: '#8A5A10' })}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.exerciseName}>{e.name}</Text>
                {!!e.detail && <Text style={s.exerciseDetail}>{e.detail}</Text>}
              </View>
              <Text style={s.exerciseKcal}>{e.kcal}<Text style={s.exerciseKcalUnit}> kcal</Text></Text>
              <TouchableOpacity onPress={() => deleteExercise(e.id)} style={s.deleteBtn} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icons.trash size={16} color={C.ink4} sw={1.6} />
              </TouchableOpacity>
            </View>
          ))}
          {exercises.length === 0 && (
            <View style={s.emptyBox}>
              <Text style={{ color: C.ink4, fontSize: 13 }}>Henüz aktivite eklenmedi</Text>
            </View>
          )}
        </View>

        <Text style={s.sectionLabel}>HIZLI EKLE</Text>
        <View style={s.quickGrid}>
          {QUICK_LOG.map(q => (
            <TouchableOpacity key={q.name} style={s.quickCard} onPress={() => addQuick(q)} activeOpacity={0.8}>
              <View style={s.quickIcon}>
                {getIcon(q.icon, { size: 18, color: '#8A5A10' })}
              </View>
              <View>
                <Text style={s.quickName}>{q.name}</Text>
                <Text style={s.quickRate}>{q.rate}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Custom add card */}
          <TouchableOpacity style={[s.quickCard, s.addCard]} onPress={() => setSheetOpen(true)} activeOpacity={0.8}>
            <View style={[s.quickIcon, s.addIcon]}>
              <Icons.plus size={18} color={C.ink} sw={2} />
            </View>
            <View>
              <Text style={s.quickName}>Özel ekle</Text>
              <Text style={s.quickRate}>Kendi egzersizin</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Egzersiz Ekle">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
          {/* Name */}
          <Text style={f.label}>EGZERSİZ ADI</Text>
          <TextInput
            style={f.input}
            value={name}
            onChangeText={setName}
            placeholder="ör. Yüzme, Pilates..."
            placeholderTextColor={C.ink4}
          />

          {/* Duration & Kcal */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={f.label}>SÜRE (DAKİKA)</Text>
              <TextInput
                style={f.input}
                value={mins}
                onChangeText={setMins}
                placeholder="30"
                placeholderTextColor={C.ink4}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={f.label}>KALORİ (KCAL)</Text>
              <TextInput
                style={f.input}
                value={kcal}
                onChangeText={setKcal}
                placeholder="200"
                placeholderTextColor={C.ink4}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Icon picker */}
          <Text style={f.label}>İKON SEÇ</Text>
          <View style={f.iconGrid}>
            {ICON_OPTIONS.map(ic => (
              <TouchableOpacity
                key={ic}
                style={[f.iconBtn, icon === ic && f.iconBtnActive]}
                onPress={() => setIcon(ic)}
                activeOpacity={0.7}
              >
                {getIcon(ic, { size: 20, color: icon === ic ? C.accentInk : C.ink2 })}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={f.submitBtn} onPress={handleAdd} activeOpacity={0.85}>
            <Text style={f.submitBtnText}>Ekle</Text>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: C.bg },
  scroll:          { flex: 1 },
  scrollContent:   { paddingHorizontal: 20, paddingBottom: 100 },
  heroCard:        { padding: 24, backgroundColor: C.ink, borderRadius: 26, position: 'relative', overflow: 'hidden', marginBottom: 22 },
  heroBg:          { position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: C.move, opacity: 0.12 },
  heroLabel:       { fontSize: 11, color: C.accent, letterSpacing: 0.6, fontWeight: '600' },
  heroVal:         { fontSize: 44, fontWeight: '600', letterSpacing: -1, marginTop: 6, color: '#FAFAF7' },
  heroUnit:        { fontSize: 15, color: C.ink4, fontWeight: '500' },
  heroStats:       { flexDirection: 'row', gap: 22, marginTop: 16 },
  heroStatLabel:   { fontSize: 11, color: C.ink4 },
  heroStatVal:     { fontSize: 16, fontWeight: '600', marginTop: 2, color: '#FAFAF7' },
  sectionLabel:    { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600', marginBottom: 10, marginLeft: 4 },
  exerciseRow:     { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, paddingHorizontal: 16, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: '#EEEEE8' },
  exerciseIcon:    { width: 42, height: 42, borderRadius: 12, backgroundColor: '#FBF1E0', alignItems: 'center', justifyContent: 'center' },
  exerciseName:    { fontSize: 14, fontWeight: '500', color: C.ink },
  exerciseDetail:  { fontSize: 12, color: C.ink3 },
  exerciseKcal:    { fontSize: 14, fontWeight: '600', color: C.ink },
  exerciseKcalUnit:{ fontSize: 10, color: C.ink4, fontWeight: '500' },
  deleteBtn:       { padding: 4, marginLeft: 4 },
  emptyBox:        { padding: 32, alignItems: 'center', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line },
  quickGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard:       { width: '47%', padding: 16, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: '#EEEEE8', gap: 8 },
  quickIcon:       { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FBF1E0', alignItems: 'center', justifyContent: 'center' },
  quickName:       { fontSize: 14, fontWeight: '600', color: C.ink },
  quickRate:       { fontSize: 11, color: C.ink3, marginTop: 2 },
  addCard:         { borderStyle: 'dashed' },
  addIcon:         { backgroundColor: C.line2 },
});

const f = StyleSheet.create({
  label:       { fontSize: 11, color: C.ink3, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  input:       { width: '100%', padding: 13, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1.5, borderColor: C.line, fontSize: 15, color: C.ink, marginBottom: 14 },
  iconGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  iconBtn:     { width: 44, height: 44, borderRadius: 12, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  iconBtnActive: { backgroundColor: C.ink },
  submitBtn:   { height: 52, borderRadius: 26, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: C.accent },
});
