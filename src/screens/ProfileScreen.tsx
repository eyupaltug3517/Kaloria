import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, TextInput, Alert, Platform,
} from 'react-native';
const DateTimePicker = Platform.OS !== 'web'
  ? require('@react-native-community/datetimepicker').default
  : null;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { C } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Icons } from '../components/Icons';
import { BottomSheet } from '../components/BottomSheet';
import { RootStackParamList, NotifTimes } from '../types';
import { exportJSON, exportWeightCSV, pickAndParseJSON, parseJSONText, KaloriaExport } from '../utils/dataIO';
import { requestPermissions, applyNotifications } from '../utils/notifications';

type Nav = any;

const ACTIVITY_LABELS: Record<string, string> = { Low: 'Düşük', Moderate: 'Orta', High: 'Yüksek' };

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
      style={[tg.track, value && tg.trackActive]}
    >
      <View style={[tg.thumb, value && tg.thumbActive]} />
    </TouchableOpacity>
  );
}

const tg = StyleSheet.create({
  track: { width: 44, height: 26, borderRadius: 13, backgroundColor: '#D4D4CC', justifyContent: 'center', paddingHorizontal: 3 },
  trackActive: { backgroundColor: C.ink },
  thumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.card },
  thumbActive: { backgroundColor: C.accent, alignSelf: 'flex-end' },
});

function PSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={ps.wrap}>
      <Text style={ps.title}>{title.toUpperCase()}</Text>
      <View style={ps.card}>{children}</View>
    </View>
  );
}

function PRow({ label, val, onPress, last, danger }: { label: string; val?: string; onPress?: () => void; last?: boolean; danger?: boolean }) {
  return (
    <TouchableOpacity
      style={[pr.row, !last && pr.border]}
      onPress={onPress || (() => {})}
      activeOpacity={0.7}
    >
      <Text style={[pr.label, danger && { color: C.danger }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {val ? <Text style={pr.val}>{val}</Text> : null}
        <Icons.chevR size={15} color={C.ink4} sw={1.8} />
      </View>
    </TouchableOpacity>
  );
}

function PToggleRow({ label, value, onChange, last }: { label: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <View style={[pr.row, !last && pr.border]}>
      <Text style={pr.label}>{label}</Text>
      <Toggle value={value} onChange={onChange} />
    </View>
  );
}

const ps = StyleSheet.create({
  wrap: { marginTop: 22 },
  title: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600', marginBottom: 10, paddingLeft: 4 },
  card: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: '#EEEEE8', overflow: 'hidden' },
});

const pr = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  border: { borderBottomWidth: 1, borderBottomColor: C.line2 },
  label: { fontSize: 14, color: C.ink },
  val: { fontSize: 13, color: C.ink3 },
});

function HourStepper({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);

  const toDate = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };

  const fromDate = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  if (Platform.OS === 'web') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
        <Text style={{ fontSize: 13, color: C.ink2, flex: 1 }}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          style={[nt.timeVal, { borderWidth: 1, borderColor: C.line, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }]}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
        />
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
      <Text style={{ fontSize: 13, color: C.ink2, flex: 1 }}>{label}</Text>
      <TouchableOpacity onPress={() => setShow(true)} activeOpacity={0.7}>
        <Text style={[nt.timeVal, { textDecorationLine: 'underline' }]}>{value}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={toDate(value)}
          mode="time"
          is24Hour={true}
          display="clock"
          onChange={(event, date) => {
            setShow(false);
            if (date && event.type !== 'dismissed') onChange(fromDate(date));
          }}
        />
      )}
    </View>
  );
}

function IntervalStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
      <Text style={{ fontSize: 13, color: C.ink2, flex: 1 }}>Her kaç saatte bir</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={() => onChange(Math.max(1, value - 1))} style={nt.stepBtn} activeOpacity={0.7}>
          <Text style={nt.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={nt.timeVal}>{value} saat</Text>
        <TouchableOpacity onPress={() => onChange(Math.min(12, value + 1))} style={nt.stepBtn} activeOpacity={0.7}>
          <Text style={nt.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NotifSheet({ toggles, times, onSave }: {
  toggles: { meals: boolean; weekly: boolean; water: boolean };
  times: NotifTimes;
  onSave: (t: typeof toggles, ti: NotifTimes) => void;
}) {
  const [t, setT] = useState(toggles);
  const [ti, setTi] = useState(times);
  const upTi = (k: keyof NotifTimes, v: any) => setTi(prev => ({ ...prev, [k]: v }));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
      {/* Öğün */}
      <View style={nt.section}>
        <View style={nt.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={nt.sectionTitle}>Öğün hatırlatıcısı</Text>
            <Text style={nt.sectionSub}>Günlük yemek hatırlatmaları</Text>
          </View>
          <Toggle value={t.meals} onChange={v => setT(p => ({ ...p, meals: v }))} />
        </View>
        {t.meals && (
          <View style={nt.timeBlock}>
            <HourStepper label="Kahvaltı" value={ti.breakfastTime} onChange={v => upTi('breakfastTime', v)} />
            <View style={nt.divider} />
            <HourStepper label="Öğle yemeği" value={ti.lunchTime} onChange={v => upTi('lunchTime', v)} />
            <View style={nt.divider} />
            <HourStepper label="Akşam yemeği" value={ti.dinnerTime} onChange={v => upTi('dinnerTime', v)} />
          </View>
        )}
      </View>

      {/* Haftalık */}
      <View style={nt.section}>
        <View style={nt.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={nt.sectionTitle}>Haftalık rapor</Text>
            <Text style={nt.sectionSub}>Her Pazartesi özet bildirim</Text>
          </View>
          <Toggle value={t.weekly} onChange={v => setT(p => ({ ...p, weekly: v }))} />
        </View>
        {t.weekly && (
          <View style={nt.timeBlock}>
            <HourStepper label="Saat" value={ti.weeklyTime} onChange={v => upTi('weeklyTime', v)} />
          </View>
        )}
      </View>

      {/* Su */}
      <View style={nt.section}>
        <View style={nt.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={nt.sectionTitle}>Su hatırlatıcısı</Text>
            <Text style={nt.sectionSub}>Düzenli su içme bildirimleri</Text>
          </View>
          <Toggle value={t.water} onChange={v => setT(p => ({ ...p, water: v }))} />
        </View>
        {t.water && (
          <View style={nt.timeBlock}>
            <HourStepper label="Başlangıç saati" value={ti.waterStart} onChange={v => upTi('waterStart', v)} />
            <View style={nt.divider} />
            <HourStepper label="Bitiş saati" value={ti.waterEnd} onChange={v => upTi('waterEnd', v)} />
            <View style={nt.divider} />
            <IntervalStepper value={ti.waterInterval} onChange={v => upTi('waterInterval', v)} />
          </View>
        )}
      </View>

      <TouchableOpacity style={[sh.primaryBtn, { marginTop: 8 }]} onPress={() => onSave(t, ti)} activeOpacity={0.85}>
        <Text style={sh.primaryBtnText}>Bildirimleri kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const nt = StyleSheet.create({
  section: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: '#EEEEE8', marginBottom: 10, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: C.ink },
  sectionSub: { fontSize: 11, color: C.ink3, marginTop: 2 },
  timeBlock: { backgroundColor: C.surface, paddingHorizontal: 16, paddingBottom: 4 },
  divider: { height: 1, backgroundColor: C.line2 },
  timeVal: { fontSize: 15, fontWeight: '600', color: C.ink, minWidth: 64, textAlign: 'center' },
});

export function ProfileScreen() {
  const {
    userName, setUserName, userEmail, setUserEmail,
    goalKcal, setGoalKcal, goalProtein, setGoalProtein,
    goalCarbs, setGoalCarbs, goalFat, setGoalFat,
    goalWeight, setGoalWeight,
    activity, setActivity, units, setUnits,
    notifToggles, setNotifToggles,
    notifTimes, setNotifTimes,
    weightLogs, setWeightLogs, streak, setStreak,
    meals, setMeals, setWater,
    signOut,
  } = useApp();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [sheet, setSheet] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [editGoalKcal, setEditGoalKcal] = useState(String(goalKcal));
  const [editGoalWeight, setEditGoalWeight] = useState(goalWeight);
  const [editActivity, setEditActivity] = useState(activity);

  const close = () => setSheet(null);
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const currentWeight = weightLogs.length > 0 ? `${weightLogs[weightLogs.length - 1].kg}kg` : '—';

  const buildExport = (): KaloriaExport => ({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    profile: { name: userName, email: userEmail },
    goals: { kcal: goalKcal, protein: goalProtein, carbs: goalCarbs, fat: goalFat, weight: goalWeight, activity },
    settings: { units, notifications: notifToggles },
    stats: { streak },
    weightLogs,
  });

  const handleExportJSON = () => exportJSON(buildExport()).catch(e => Alert.alert('Hata', e.message));
  const handleExportCSV = () => exportWeightCSV(weightLogs).catch(e => Alert.alert('Hata', e.message));

  const applyImport = (data: KaloriaExport) => {
    setUserName(data.profile.name);
    setUserEmail(data.profile.email);
    setGoalKcal(data.goals.kcal);
    setGoalProtein(data.goals.protein);
    setGoalCarbs(data.goals.carbs);
    setGoalFat(data.goals.fat);
    setGoalWeight(data.goals.weight);
    setActivity(data.goals.activity);
    setUnits(data.settings.units);
    setNotifToggles(data.settings.notifications);
    setStreak(data.stats.streak);
    setWeightLogs(data.weightLogs);
    setImportSuccess(true);
    setImportError('');
  };

  const handleImportFile = () => {
    pickAndParseJSON()
      .then(applyImport)
      .catch(e => setImportError(e.message || 'Dosya okunamadı'));
  };

  const handleImportText = () => {
    try {
      applyImport(parseJSONText(importText));
    } catch (e: any) {
      setImportError(e.message || 'Geçersiz JSON');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Çıkış yap', 'Çıkış yapmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış yap', style: 'destructive', onPress: () => { signOut(); navigation.replace('Onboarding'); } },
    ]);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerLabel}>HESAP</Text>
        <Text style={s.headerTitle}>Profil</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar card */}
        <View style={s.avatarCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{userName}</Text>
            <Text style={s.email}>{userEmail} · Ocak 2026'dan beri üye</Text>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={() => { setEditName(userName); setEditEmail(userEmail); setSheet('edit'); }} activeOpacity={0.8}>
            <Icons.edit size={16} color={C.ink} />
          </TouchableOpacity>
        </View>

        {/* Mini stats */}
        <View style={s.miniStatsRow}>
          {[
            { v: currentWeight, l: 'Ağırlık' },
            { v: goalKcal.toLocaleString(), l: 'Günlük kcal' },
            { v: String(streak), l: 'Gün serisi' },
          ].map(stat => (
            <View key={stat.l} style={s.miniStat}>
              <Text style={s.miniStatVal}>{stat.v}</Text>
              <Text style={s.miniStatLabel}>{stat.l.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <PSection title="Analizler">
          <PRow label="Raporlar ve grafikler" onPress={() => navigation.navigate('Report')} last />
        </PSection>

        <PSection title="Hedefler">
          <PRow label="Günlük kalori" val={`${goalKcal.toLocaleString()} kcal`} onPress={() => { setEditGoalKcal(String(goalKcal)); setEditGoalWeight(goalWeight); setEditActivity(activity); setSheet('goals'); }} />
          <PRow label="Hedef kilo" val={`${goalWeight} kg`} onPress={() => setSheet('goals')} />
          <PRow label="Aktivite seviyesi" val={ACTIVITY_LABELS[activity] ?? activity} onPress={() => setSheet('goals')} />
          <PRow label="Makro dağılımı" val="P 140 · K 230 · Y 65" onPress={() => setSheet('goals')} last />
        </PSection>

        <PSection title="Tercihler">
          <PToggleRow label="Öğün hatırlatıcısı" value={notifToggles.meals} onChange={v => setNotifToggles({ ...notifToggles, meals: v })} />
          <PToggleRow label="Haftalık rapor" value={notifToggles.weekly} onChange={v => setNotifToggles({ ...notifToggles, weekly: v })} />
          <PToggleRow label="Su hatırlatıcısı" value={notifToggles.water} onChange={v => setNotifToggles({ ...notifToggles, water: v })} />
          <PRow label="Birimler" val={units === 'metric' ? 'Metrik (kg, ml)' : 'İmperial (lb, fl oz)'} onPress={() => setSheet('units')} last />
        </PSection>

        <PSection title="Veri">
          <PRow label="Veri dışa aktar" val="JSON / CSV" onPress={() => setSheet('export')} />
          <PRow label="Yedek içe aktar" onPress={() => { setImportText(''); setImportError(''); setImportSuccess(false); setSheet('import'); }} />
          <PRow label="Bildirimler" onPress={() => setSheet('notif')} />
          <PRow label="Bugünü sıfırla" onPress={() => setSheet('reset')} last danger />
        </PSection>

        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={s.signOutText}>Çıkış yap</Text>
        </TouchableOpacity>
        <Text style={s.version}>Kaloria v1.0.3</Text>
      </ScrollView>

      {/* Edit profile sheet */}
      <BottomSheet open={sheet === 'edit'} onClose={close} title="Profili Düzenle">
        <View style={{ paddingBottom: 12 }}>
          <Text style={sh.label}>AD</Text>
          <TextInput value={editName} onChangeText={setEditName} style={sh.input} placeholderTextColor={C.ink4} />
          <Text style={sh.label}>E-POSTA</Text>
          <TextInput value={editEmail} onChangeText={setEditEmail} style={sh.input} keyboardType="email-address" placeholderTextColor={C.ink4} />
          <TouchableOpacity style={sh.primaryBtn} onPress={() => { setUserName(editName); setUserEmail(editEmail); close(); }} activeOpacity={0.85}>
            <Text style={sh.primaryBtnText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Goals sheet */}
      <BottomSheet open={sheet === 'goals'} onClose={close} title="Hedefleri Düzenle">
        <View style={{ paddingBottom: 12 }}>
          <Text style={sh.label}>GÜNLÜK KALORİ HEDEFİ</Text>
          <TextInput
            value={editGoalKcal} onChangeText={setEditGoalKcal}
            keyboardType="numeric" style={[sh.input, sh.bigInput]}
            placeholderTextColor={C.ink4}
          />
          <Text style={{ fontSize: 12, color: C.ink3, textAlign: 'center', marginBottom: 16, marginTop: -6 }}>kcal / gün</Text>
          <Text style={sh.label}>KİLO HEDEFİ (KG)</Text>
          <TextInput value={editGoalWeight} onChangeText={setEditGoalWeight} keyboardType="decimal-pad" style={sh.input} placeholderTextColor={C.ink4} />
          <Text style={sh.label}>AKTİVİTE SEVİYESİ</Text>
          <View style={sh.activityRow}>
            {(['Low', 'Moderate', 'High'] as const).map(a => (
              <TouchableOpacity key={a} style={[sh.actBtn, editActivity === a && sh.actBtnActive]} onPress={() => setEditActivity(a)} activeOpacity={0.8}>
                <Text style={[sh.actBtnText, editActivity === a && sh.actBtnTextActive]}>{ACTIVITY_LABELS[a]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={sh.accentBtn} onPress={() => { setGoalKcal(parseInt(editGoalKcal) || goalKcal); setGoalWeight(editGoalWeight); setActivity(editActivity); close(); }} activeOpacity={0.85}>
            <Text style={sh.accentBtnText}>Hedefleri kaydet</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Units sheet */}
      <BottomSheet open={sheet === 'units'} onClose={close} title="Birimler">
        <View style={{ paddingBottom: 12 }}>
          {[{ v: 'metric', l: 'Metrik', sub: 'kg, cm, ml' }, { v: 'imperial', l: 'İmperial', sub: 'lb, ft/in, fl oz' }].map(u => (
            <TouchableOpacity key={u.v} style={[sh.unitBtn, units === u.v && sh.unitBtnActive]} onPress={() => setUnits(u.v)} activeOpacity={0.8}>
              <View>
                <Text style={[sh.unitLabel, units === u.v && { color: C.bg }]}>{u.l}</Text>
                <Text style={[sh.unitSub, units === u.v && { color: C.ink4 }]}>{u.sub}</Text>
              </View>
              {units === u.v && <Icons.check size={18} color={C.accent} sw={2.4} />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={sh.primaryBtn} onPress={close} activeOpacity={0.85}>
            <Text style={sh.primaryBtnText}>Uygula</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Notifications sheet */}
      <BottomSheet open={sheet === 'notif'} onClose={close} title="Bildirimler">
        <NotifSheet
          toggles={notifToggles}
          times={notifTimes}
          onSave={(toggles, times) => {
            setNotifToggles(toggles);
            setNotifTimes(times);
            requestPermissions().then(granted => {
              if (!granted) { Alert.alert('İzin gerekli', 'Bildirimler için izin verilmedi.'); return; }
              applyNotifications(toggles, times);
            });
            close();
          }}
        />
      </BottomSheet>

      {/* Export sheet */}
      <BottomSheet open={sheet === 'export'} onClose={close} title="Veri Dışa Aktar">
        <View style={{ paddingBottom: 12, gap: 10 }}>
          <Text style={{ fontSize: 13, color: C.ink3, lineHeight: 19, marginBottom: 4 }}>
            Profil, hedefler ve kilo geçmişinizin tam yedeklemesini indirin.
          </Text>
          <TouchableOpacity style={sh.primaryBtn} onPress={handleExportJSON} activeOpacity={0.85}>
            <Text style={sh.primaryBtnText}>JSON yedek indir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sh.outlineBtn} onPress={handleExportCSV} activeOpacity={0.85}>
            <Text style={sh.outlineBtnText}>Kilo günlüğü indir (CSV)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sh.cancelBtn} onPress={close} activeOpacity={0.85}>
            <Text style={sh.cancelBtnText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Import sheet */}
      <BottomSheet open={sheet === 'import'} onClose={close} title="Yedek İçe Aktar">
        <View style={{ paddingBottom: 12, gap: 10 }}>
          {importSuccess ? (
            <View style={{ alignItems: 'center', paddingVertical: 20, gap: 10 }}>
              <Icons.check size={36} color="#4A6B1A" sw={2} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.ink }}>İçe aktarma başarılı!</Text>
              <Text style={{ fontSize: 13, color: C.ink3, textAlign: 'center' }}>Verileriniz geri yüklendi.</Text>
              <TouchableOpacity style={[sh.primaryBtn, { width: '100%', marginTop: 8 }]} onPress={close} activeOpacity={0.85}>
                <Text style={sh.primaryBtnText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={{ fontSize: 13, color: C.ink3, lineHeight: 19 }}>
                Kaloria'dan dışa aktarılmış bir .json dosyası seçin veya JSON içeriğini aşağıya yapıştırın.
              </Text>
              <TouchableOpacity style={sh.primaryBtn} onPress={handleImportFile} activeOpacity={0.85}>
                <Text style={sh.primaryBtnText}>Dosya seç…</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 11, color: C.ink4, textAlign: 'center' }}>— veya JSON yapıştır —</Text>
              <TextInput
                style={[sh.input, { height: 100, textAlignVertical: 'top', fontFamily: 'monospace', fontSize: 12 }]}
                value={importText}
                onChangeText={v => { setImportText(v); setImportError(''); }}
                placeholder='{"version":"1.0","goals":...}'
                placeholderTextColor={C.ink4}
                multiline
              />
              {importError ? (
                <Text style={{ fontSize: 12, color: C.danger }}>{importError}</Text>
              ) : null}
              <TouchableOpacity style={sh.accentBtn} onPress={handleImportText} activeOpacity={0.85}>
                <Text style={sh.accentBtnText}>Metinden içe aktar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={sh.cancelBtn} onPress={close} activeOpacity={0.85}>
                <Text style={sh.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </BottomSheet>

      {/* Reset sheet */}
      <BottomSheet open={sheet === 'reset'} onClose={close} title="Bugünü sıfırla?">
        <View style={{ paddingBottom: 12 }}>
          <Text style={{ fontSize: 14, color: C.ink2, lineHeight: 21.7, marginBottom: 24 }}>Bugünkü tüm yemek ve su kayıtları kalıcı olarak silinecek. Egzersiz kayıtları korunacak.</Text>
          <TouchableOpacity
            style={sh.dangerBtn}
            onPress={() => {
              setMeals(prev => {
                const reset: typeof prev = {} as any;
                (Object.keys(prev) as Array<keyof typeof prev>).forEach(k => {
                  reset[k] = { ...prev[k], items: [], time: '—' };
                });
                return reset;
              });
              setWater(0);
              close();
            }}
            activeOpacity={0.85}
          >
            <Text style={sh.dangerBtnText}>Evet, sıfırla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sh.cancelBtn} onPress={close} activeOpacity={0.85}>
            <Text style={sh.cancelBtnText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 10 },
  headerLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.6, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '600', letterSpacing: -0.4, marginTop: 2, color: C.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  avatarCard: { padding: 20, backgroundColor: C.card, borderRadius: 22, borderWidth: 1, borderColor: '#EEEEE8', flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '600', color: C.accentInk },
  name: { fontSize: 16, fontWeight: '600', color: C.ink },
  email: { fontSize: 12, color: C.ink3, marginTop: 2 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  miniStatsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  miniStat: { flex: 1, padding: 14, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: '#EEEEE8', alignItems: 'center' },
  miniStatVal: { fontSize: 16, fontWeight: '600', letterSpacing: -0.3, color: C.ink },
  miniStatLabel: { fontSize: 10, color: C.ink3, letterSpacing: 0.4, marginTop: 2 },
  signOutBtn: { height: 48, borderRadius: 24, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  signOutText: { fontSize: 14, fontWeight: '500', color: C.danger },
  version: { textAlign: 'center', fontSize: 11, color: C.ink4, marginTop: 14 },
});

const sh = StyleSheet.create({
  label: { fontSize: 11, color: C.ink3, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  input: { width: '100%', padding: 13, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1.5, borderColor: C.line, fontSize: 15, color: C.ink, marginBottom: 14 },
  bigInput: { fontSize: 28, fontWeight: '600', textAlign: 'center', letterSpacing: -0.5 },
  primaryBtn: { height: 52, borderRadius: 26, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, fontWeight: '600', color: C.accent },
  accentBtn: { height: 52, borderRadius: 26, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  accentBtnText: { fontSize: 15, fontWeight: '600', color: C.accentInk },
  activityRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  actBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.line2 },
  actBtnActive: { backgroundColor: C.ink },
  actBtnText: { fontSize: 14, fontWeight: '500', color: C.ink2 },
  actBtnTextActive: { color: C.accent },
  unitBtn: { width: '100%', padding: 16, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unitBtnActive: { backgroundColor: C.ink, borderWidth: 0 },
  unitLabel: { fontSize: 15, fontWeight: '600', color: C.ink },
  unitSub: { fontSize: 12, color: C.ink3, marginTop: 2 },
  dangerBtn: { height: 52, borderRadius: 26, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  dangerBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  cancelBtn: { height: 52, borderRadius: 26, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '500', color: C.ink },
  outlineBtn: { height: 52, borderRadius: 26, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  outlineBtnText: { fontSize: 15, fontWeight: '600', color: C.ink },
});
