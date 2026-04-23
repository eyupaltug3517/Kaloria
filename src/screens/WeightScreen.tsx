import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

import { C } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Icons } from '../components/Icons';
import { BottomSheet } from '../components/BottomSheet';
import { ScreenHeader } from '../components/ScreenHeader';

const { width: SW } = Dimensions.get('window');
const W = SW - 80, H = 160, PAD = 12;

function WeightChart({ data }: { data: { d: string; kg: number }[] }) {
  if (data.length < 2) return null;
  const minKg = Math.min(...data.map(d => d.kg)) - 0.3;
  const maxKg = Math.max(...data.map(d => d.kg)) + 0.3;
  const xFor = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const yFor = (kg: number) => H - PAD - ((kg - minKg) / (maxKg - minKg)) * (H - PAD * 2);

  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d.kg)}`).join(' ');
  const areaD = pathD + ` L ${xFor(data.length - 1)} ${H} L ${xFor(0)} ${H} Z`;

  return (
    <View>
      <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <Path d={areaD} fill={C.accent} opacity={0.18} />
        <Path d={pathD} stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <Circle key={i}
            cx={xFor(i)} cy={yFor(d.kg)}
            r={i === data.length - 1 ? 5 : 3}
            fill={i === data.length - 1 ? C.ink : C.card}
            stroke={C.ink} strokeWidth="2"
          />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        {data.map((d, i) => (
          <Text key={i} style={[wc.axisLabel, i === data.length - 1 && wc.axisLabelToday]}>
            {d.d.split(' ')[1] || d.d}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function WeightScreen() {
  const { weightLogs, setWeightLogs, goalWeight } = useApp();
  const [range, setRange] = useState('1H');
  const [logging, setLogging] = useState(false);
  const [inputKg, setInputKg] = useState('');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const hasData = weightLogs.length > 0;
  const current = hasData ? weightLogs[weightLogs.length - 1].kg : null;
  const start = hasData ? weightLogs[0].kg : null;
  const diff = hasData && current !== null && start !== null ? (current - start).toFixed(1) : null;
  const chartData = hasData ? weightLogs.slice(-7) : [];
  const goalKg = parseFloat(goalWeight);

  const saveEntry = () => {
    const raw = String(inputKg).trim().replace(',', '.');
    const kg = parseFloat(raw);
    if (!raw || isNaN(kg) || kg <= 0 || kg > 500) return;
    const now = new Date();
    const label = now.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
    setWeightLogs((prev: { d: string; kg: number }[]) => [...prev, { d: label, kg: Math.round(kg * 10) / 10 }]);
    setInputKg('');
    setLogging(false);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Kilo"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => { setInputKg(current ? String(current) : ''); setLogging(true); }}
            activeOpacity={0.8}
          >
            <Icons.plus size={18} color={C.accent} sw={2.4} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          {hasData && current !== null ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <View>
                  <Text style={s.currentLabel}>MEVCUT</Text>
                  <Text style={s.currentVal}>{current}<Text style={s.currentUnit}> kg</Text></Text>
                </View>
                {diff !== null && (
                  <View style={[s.diffChip, parseFloat(diff) < 0 ? s.diffChipGood : s.diffChipBad]}>
                    {parseFloat(diff) < 0
                      ? <Icons.arrowDown size={14} color="#4A6B1A" sw={2.4} />
                      : <Icons.arrowUp size={14} color={C.danger} sw={2.4} />}
                    <Text style={[s.diffText, parseFloat(diff) < 0 ? { color: '#4A6B1A' } : { color: C.danger }]}>
                      {Math.abs(parseFloat(diff))} kg
                    </Text>
                  </View>
                )}
              </View>

              {chartData.length > 1 && (
                <View style={{ marginTop: 16 }}>
                  <WeightChart data={chartData} />
                </View>
              )}
              {chartData.length === 1 && (
                <View style={s.oneEntryHint}>
                  <Text style={{ fontSize: 13, color: C.ink3 }}>Trend grafiği için en az 2 kayıt girin.</Text>
                </View>
              )}

              <View style={s.rangeRow}>
                {['1H', '1A', '3A', '6A', '1Y', 'Tümü'].map(r => (
                  <TouchableOpacity key={r} style={[s.rangeBtn, range === r && s.rangeBtnActive]} onPress={() => setRange(r)} activeOpacity={0.8}>
                    <Text style={[s.rangeBtnText, range === r && s.rangeBtnTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={s.emptyState}>
              <View style={s.emptyIcon}>
                <Icons.scale size={24} color={C.ink4} />
              </View>
              <Text style={s.emptyTitle}>Henüz kilo girilmedi</Text>
              <Text style={s.emptySub}>İlk kaydı girmek için + tuşuna bas</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => { setInputKg(''); setLogging(true); }} activeOpacity={0.85}>
                <Text style={s.emptyBtnText}>Kilo kaydet</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {hasData && current !== null && start !== null && (
          <View style={s.statRow}>
            <View style={s.statCard}>
              <Text style={s.statLabel}>BAŞLANGIÇ</Text>
              <Text style={s.statVal}>{start}kg</Text>
              <Text style={s.statSub}>{weightLogs[0].d}</Text>
            </View>
            <View style={[s.statCard, s.statCardAccent]}>
              <Text style={[s.statLabel, { color: C.ink4 }]}>HEDEF</Text>
              <Text style={[s.statVal, { color: C.bg }]}>{goalKg}kg</Text>
              <Text style={[s.statSub, { color: C.accent }]}>
                {current > goalKg ? `−${(current - goalKg).toFixed(1)}kg kaldı` : '✓ Ulaşıldı!'}
              </Text>
            </View>
          </View>
        )}

        <Text style={s.sectionLabel}>SON KAYITLAR</Text>
        {weightLogs.length === 0 ? (
          <View style={s.noEntries}>
            <Text style={{ color: C.ink4, fontSize: 13 }}>Henüz kayıt yok — başlamak için kilonuzu girin.</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {[...weightLogs].reverse().slice(0, 7).map((d, i, arr) => {
              const prev = arr[i + 1]?.kg;
              const delta = prev ? (d.kg - prev).toFixed(1) : null;
              return (
                <View key={i} style={s.entryRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.entryDate}>{d.d}</Text>
                    <Text style={s.entryTime}>08:30</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.entryKg}>{d.kg} <Text style={s.entryKgUnit}>kg</Text></Text>
                    {delta && (
                      <Text style={{ fontSize: 11, color: parseFloat(delta) < 0 ? '#4A6B1A' : C.ink4 }}>
                        {parseFloat(delta) > 0 ? '+' : ''}{delta} kg
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BottomSheet open={logging} onClose={() => setLogging(false)} title="Kilo kaydet">
        <View style={{ paddingBottom: 10 }}>
          <Text style={s.logLabel}>KİLO (KG)</Text>
          <TextInput
            value={inputKg}
            onChangeText={setInputKg}
            placeholder="örn. 77.5"
            placeholderTextColor={C.ink4}
            keyboardType="decimal-pad"
            style={s.logInput}
            onSubmitEditing={saveEntry}
          />
          <TouchableOpacity style={s.saveBtn} onPress={saveEntry} activeOpacity={0.85}>
            <Text style={s.saveBtnText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const wc = StyleSheet.create({
  axisLabel: { fontSize: 10, color: C.ink4, fontWeight: '400' },
  axisLabelToday: { color: C.ink, fontWeight: '600' },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  card: { padding: 22, backgroundColor: C.card, borderRadius: 24, borderWidth: 1, borderColor: '#EEEEE8', marginBottom: 14 },
  currentLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600' },
  currentVal: { fontSize: 44, fontWeight: '600', letterSpacing: -1.1, lineHeight: 46, color: C.ink },
  currentUnit: { fontSize: 16, color: C.ink3, fontWeight: '500' },
  diffChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100 },
  diffChipGood: { backgroundColor: '#ECF7D9' },
  diffChipBad: { backgroundColor: '#FDF0EC' },
  diffText: { fontSize: 12, fontWeight: '600' },
  oneEntryHint: { marginTop: 14, padding: 14, paddingHorizontal: 16, backgroundColor: C.surface, borderRadius: 14 },
  rangeRow: { flexDirection: 'row', gap: 6, marginTop: 16 },
  rangeBtn: { flex: 1, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: C.line2 },
  rangeBtnActive: { backgroundColor: C.ink },
  rangeBtnText: { fontSize: 12, fontWeight: '500', color: C.ink2 },
  rangeBtnTextActive: { color: C.bg },
  emptyState: { alignItems: 'center', paddingVertical: 28 },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: C.ink, marginBottom: 6 },
  emptySub: { fontSize: 13, color: C.ink3, marginBottom: 18 },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: C.ink },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: C.accent },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, padding: 16, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: '#EEEEE8' },
  statCardAccent: { backgroundColor: C.ink, borderWidth: 0 },
  statLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600' },
  statVal: { fontSize: 22, fontWeight: '600', letterSpacing: -0.4, marginTop: 4, color: C.ink },
  statSub: { fontSize: 12, color: C.ink3, marginTop: 2 },
  sectionLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600', marginBottom: 10, marginLeft: 4 },
  noEntries: { padding: 32, alignItems: 'center', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line, borderStyle: 'dashed' },
  entryRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: '#EEEEE8' },
  entryDate: { fontSize: 14, fontWeight: '500', color: C.ink },
  entryTime: { fontSize: 11, color: C.ink3 },
  entryKg: { fontSize: 15, fontWeight: '600', color: C.ink },
  entryKgUnit: { fontSize: 11, color: C.ink3, fontWeight: '500' },
  logLabel: { fontSize: 11, color: C.ink3, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  logInput: { width: '100%', paddingVertical: 16, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1.5, borderColor: C.line, fontSize: 28, fontWeight: '600', textAlign: 'center', color: C.ink, letterSpacing: -0.5, marginBottom: 18 },
  saveBtn: { height: 54, borderRadius: 27, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: C.accent },
});
