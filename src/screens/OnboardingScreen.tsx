import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { C } from '../theme/colors';
import { useApp } from '../context/AppContext';

function calcTargets(goal: string, activity: string) {
  let kcal = 2000;
  if (goal === 'Kilo ver') kcal -= 300;
  else if (goal === 'Kas kazan') kcal += 200;
  if (activity === 'Düşük') kcal -= 200;
  else if (activity === 'Yüksek') kcal += 300;
  return {
    kcal,
    protein: Math.round(kcal * 0.30 / 4),
    carbs: Math.round(kcal * 0.45 / 4),
    fat: Math.round(kcal * 0.25 / 9),
  };
}
import { Icons } from '../components/Icons';
import { RootStackParamList } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

function RingArt() {
  return (
    <View style={{ width: 260, height: 260, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={260} height={260} viewBox="0 0 260 260">
        <Circle cx="130" cy="130" r="100" stroke={C.line2} strokeWidth="14" fill="none" />
        <Circle cx="130" cy="130" r="100" stroke={C.accent} strokeWidth="14" fill="none"
          strokeDasharray="440 628" strokeLinecap="round" transform="rotate(-90 130 130)" />
        <Circle cx="130" cy="130" r="72" stroke={C.line2} strokeWidth="10" fill="none" />
        <Circle cx="130" cy="130" r="72" stroke={C.ink} strokeWidth="10" fill="none"
          strokeDasharray="280 452" strokeLinecap="round" transform="rotate(-90 130 130)" />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: '600', letterSpacing: -1, color: C.ink }}>1,104</Text>
        <Text style={{ fontSize: 11, color: C.ink3, letterSpacing: 0.6 }}>KCAL KALDI</Text>
      </View>
    </View>
  );
}

function ScanArt() {
  return (
    <View style={{ width: 280, height: 260, backgroundColor: C.line2, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 180, height: 120, backgroundColor: C.card, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 5 }}>
        <Icons.barcode size={80} color={C.ink3} sw={1.4} />
      </View>
      <View style={{ position: 'absolute', top: 40, left: 30, width: 40, height: 40, borderRadius: 20, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Icons.camera size={20} color={C.accentInk} />
      </View>
      <View style={{ position: 'absolute', bottom: 36, right: 30, backgroundColor: C.ink, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: '500', color: C.bg }}>142 kcal</Text>
      </View>
    </View>
  );
}

function TrendArt() {
  return (
    <View style={{ width: 280, height: 220, padding: 20 }}>
      <Svg viewBox="0 0 280 180" width="100%" height="100%">
        <Path d="M10 140 Q 60 100, 90 110 T 170 70 T 270 40 L 270 180 L 10 180 Z" fill={C.accent} opacity="0.18" />
        <Path d="M10 140 Q 60 100, 90 110 T 170 70 T 270 40" stroke={C.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {([[10, 140], [90, 110], [170, 70], [270, 40]] as [number, number][]).map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r="4" fill={C.ink} />
        ))}
      </Svg>
    </View>
  );
}

const slides = [
  { eyebrow: 'KALORIA', title: 'Beslenme verisi,\nsessizce akıllı.', body: 'Yediklerini gürültüsüzce takip et. Seri yok, utanç yok — sadece dürüst rakamlar.', art: 'ring' },
  { eyebrow: '01', title: 'Saniyeler içinde kaydet.', body: 'Barkod tara, 900 bin+ yiyecek ara ya da fotoğraf çek. Gerisini uygulama halleder.', art: 'scan' },
  { eyebrow: '02', title: 'Trendi gör.', body: 'Haftalık trendler, makro dengesi ve kilo — görselleştirilmiş, oyunlaştırılmamış.', art: 'trend' },
];

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [goal, setGoal] = useState('Kilonu koru');
  const [activityLevel, setActivityLevel] = useState('Orta');
  const { setHasOnboarded, setActivity, setGoalKcal, setGoalProtein, setGoalCarbs, setGoalFat, setUserName, setUserEmail } = useApp();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const initial = calcTargets('Kilonu koru', 'Orta');
  const [kcalInput, setKcalInput] = useState(String(initial.kcal));
  const [proteinInput, setProteinInput] = useState(String(initial.protein));
  const [carbsInput, setCarbsInput] = useState(String(initial.carbs));
  const [fatInput, setFatInput] = useState(String(initial.fat));

  useEffect(() => {
    const t = calcTargets(goal, activityLevel);
    setKcalInput(String(t.kcal));
    setProteinInput(String(t.protein));
    setCarbsInput(String(t.carbs));
    setFatInput(String(t.fat));
  }, [goal, activityLevel]);

  const finish = () => {
    if (nameInput.trim()) setUserName(nameInput.trim());
    if (emailInput.trim()) setUserEmail(emailInput.trim());
    setActivity(activityLevel);
    setGoalKcal(Number(kcalInput) || 2000);
    setGoalProtein(Number(proteinInput) || 150);
    setGoalCarbs(Number(carbsInput) || 230);
    setGoalFat(Number(fatInput) || 65);
    setHasOnboarded(true);
  };

  if (step < 3) {
    const s = slides[step];
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
        {/* Dots + skip */}
        <View style={styles.topRow}>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>
          <TouchableOpacity onPress={() => setStep(4)}>
            <Text style={styles.skipText}>Atla</Text>
          </TouchableOpacity>
        </View>

        {/* Art */}
        <View style={styles.artWrap}>
          {s.art === 'ring' && <RingArt />}
          {s.art === 'scan' && <ScanArt />}
          {s.art === 'trend' && <TrendArt />}
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.eyebrow}>{s.eyebrow}</Text>
          <Text style={styles.slideTitle}>{s.title}</Text>
          <Text style={styles.slideBody}>{s.body}</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(step + 1)} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{step === 2 ? 'Devam' : 'Devam'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Profile info
  if (step === 3) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
          <Icons.chevL size={20} color={C.ink} sw={1.8} />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.eyebrow}>PROFİL</Text>
          <Text style={styles.slideTitle}>Seni tanıyalım.</Text>
          <Text style={[styles.slideBody, { marginBottom: 32 }]}>İstersen daha sonra da değiştirebilirsin.</Text>

          <Text style={styles.sectionLabel}>ADINIZ</Text>
          <TextInput
            style={styles.profileInput}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Adınızı girin"
            placeholderTextColor={C.ink4}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>E-POSTA (opsiyonel)</Text>
          <TextInput
            style={styles.profileInput}
            value={emailInput}
            onChangeText={setEmailInput}
            placeholder="ornek@email.com"
            placeholderTextColor={C.ink4}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(4)} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Devam</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Goal setup
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={[styles.goalContainer, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => setStep(3)}>
        <Icons.chevL size={20} color={C.ink} sw={1.8} />
      </TouchableOpacity>

      <Text style={styles.goalEyebrow}>HEDEFİNİ BELİRLE</Text>
      <Text style={styles.goalTitle}>Plan ne?</Text>

      <Text style={styles.sectionLabel}>HEDEF</Text>
      <View style={{ gap: 8, marginBottom: 26 }}>
        {['Kilo ver', 'Kilonu koru', 'Kas kazan'].map(g => (
          <TouchableOpacity
            key={g}
            onPress={() => setGoal(g)}
            activeOpacity={0.8}
            style={[styles.goalOption, goal === g && styles.goalOptionActive]}
          >
            <Text style={[styles.goalOptionText, goal === g && styles.goalOptionTextActive]}>{g}</Text>
            {goal === g && (
              <View style={styles.checkCircle}>
                <Icons.check size={14} color={C.ink} sw={2.4} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>AKTİVİTE SEVİYESİ</Text>
      <View style={styles.activityRow}>
        {['Düşük', 'Orta', 'Yüksek'].map(a => (
          <TouchableOpacity
            key={a}
            onPress={() => setActivityLevel(a)}
            activeOpacity={0.8}
            style={[styles.activityBtn, activityLevel === a && styles.activityBtnActive]}
          >
            <Text style={[styles.activityBtnText, activityLevel === a && styles.activityBtnTextActive]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.targetCard}>
        <Text style={styles.targetLabel}>GÜNLÜK HEDEFİN</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 14 }}>
          <TextInput
            style={styles.targetKcalInput}
            value={kcalInput}
            onChangeText={setKcalInput}
            keyboardType="number-pad"
            selectTextOnFocus
          />
          <Text style={styles.targetUnit}>kcal / gün</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {([
            { label: 'protein', value: proteinInput, set: setProteinInput },
            { label: 'karb',    value: carbsInput,   set: setCarbsInput },
            { label: 'yağ',     value: fatInput,     set: setFatInput },
          ] as const).map(({ label, value, set }) => (
            <View key={label} style={styles.macroField}>
              <TextInput
                style={styles.macroInput}
                value={value}
                onChangeText={set}
                keyboardType="number-pad"
                selectTextOnFocus
              />
              <Text style={styles.macroLabel}>g {label}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.accentBtn} onPress={finish} activeOpacity={0.85}>
        <Text style={styles.accentBtnText}>Takibe başla</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 28,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D8D8D0',
  },
  dotActive: {
    width: 22,
    backgroundColor: C.ink,
  },
  skipText: {
    fontSize: 13,
    color: C.ink3,
    fontWeight: '500',
  },
  artWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: C.ink3,
    marginBottom: 14,
  },
  slideTitle: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: -0.8,
    color: C.ink,
    marginBottom: 14,
  },
  slideBody: {
    fontSize: 15,
    lineHeight: 22.5,
    color: C.ink2,
    maxWidth: 300,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.bg,
    letterSpacing: -0.1,
  },
  goalContainer: {
    paddingHorizontal: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.line2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  goalEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: C.ink3,
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 28,
    lineHeight: 30.8,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: C.ink,
    marginBottom: 26,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.ink3,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  goalOption: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalOptionActive: {
    backgroundColor: C.ink,
    borderWidth: 0,
  },
  goalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: C.ink,
  },
  goalOptionTextActive: {
    color: C.bg,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  activityBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
  },
  activityBtnActive: {
    backgroundColor: C.ink,
    borderWidth: 0,
  },
  activityBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.ink,
  },
  activityBtnTextActive: {
    color: C.bg,
  },
  targetCard: {
    padding: 18,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 22,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.ink3,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  targetKcalInput: {
    fontSize: 40,
    fontWeight: '600',
    letterSpacing: -1.2,
    color: C.ink,
    minWidth: 80,
    padding: 0,
  },
  targetUnit: {
    fontSize: 14,
    color: C.ink3,
    marginBottom: 4,
  },
  macroField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: C.bg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  macroInput: {
    fontSize: 13,
    fontWeight: '700',
    color: C.ink,
    minWidth: 28,
    padding: 0,
  },
  macroLabel: {
    fontSize: 12,
    color: C.ink2,
  },
  accentBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.accentInk,
  },
  profileInput: {
    width: '100%',
    padding: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.line,
    fontSize: 16,
    color: C.ink,
    backgroundColor: C.card,
  },
});
