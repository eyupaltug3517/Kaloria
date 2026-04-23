import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Path, Circle, Rect, Line as SvgLine,
  Defs, LinearGradient, Stop, G, Text as SvgText,
} from 'react-native-svg';

import { C } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Icons } from '../components/Icons';
import { WeightLog } from '../types';

// ── Geometry helpers ──────────────────────────────────────────────────────────

const DAY = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function arc(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function bezierLine(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const mx = f((a.x + b.x) / 2);
    d += ` C ${mx} ${f(a.y)} ${mx} ${f(b.y)} ${f(b.x)} ${f(b.y)}`;
  }
  return d;
}

function bezierArea(pts: { x: number; y: number }[], baseY: number) {
  if (pts.length < 2) return '';
  const line = bezierLine(pts);
  return `${line} L ${f(pts[pts.length - 1].x)} ${baseY} L ${f(pts[0].x)} ${baseY} Z`;
}

const f = (n: number) => n.toFixed(1);

// ── Stat summary card ─────────────────────────────────────────────────────────

function StatTile({
  label, val, unit, icon, tint = C.card,
}: {
  label: string; val: string; unit?: string; icon: React.ReactNode; tint?: string;
}) {
  return (
    <View style={[st.tile, { backgroundColor: tint }]}>
      <View style={st.iconWrap}>{icon}</View>
      <Text style={st.val} numberOfLines={1}>
        {val}
        {unit ? <Text style={st.unit}> {unit}</Text> : null}
      </Text>
      <Text style={st.label}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  tile:    { flex: 1, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: '#EEEEE8', minHeight: 90, gap: 2 },
  iconWrap:{ marginBottom: 6 },
  val:     { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, color: C.ink },
  unit:    { fontSize: 12, fontWeight: '400', color: C.ink3 },
  label:   { fontSize: 11, color: C.ink3, letterSpacing: 0.2 },
});

// ── Progress ring (Apple Watch style) ─────────────────────────────────────────

function Ring({
  pct, color, size = 72, sw = 7, label, val, sub,
}: {
  pct: number; color: string; size?: number; sw?: number;
  label: string; val: string; sub?: string;
}) {
  const r   = (size - sw) / 2;
  const cx  = size / 2, cy = size / 2;
  const p   = Math.min(Math.max(pct, 0), 0.9999);
  const deg = p * 359.99;
  const s   = arc(cx, cy, r, 0);
  const e   = arc(cx, cy, r, deg);
  const lg  = deg > 180 ? 1 : 0;
  const d   = deg < 0.5 ? null
    : `M ${f(s.x)} ${f(s.y)} A ${r} ${r} 0 ${lg} 1 ${f(e.x)} ${f(e.y)}`;

  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} fill="none" stroke={C.line2} strokeWidth={sw} />
          {d && <Path d={d} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />}
        </Svg>
        <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ fontSize: 10.5, fontWeight: '700', color: C.ink }}>
            {Math.round(p * 100)}%
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 13, fontWeight: '600', color: C.ink, marginTop: 8 }}>{val}</Text>
      <Text style={{ fontSize: 11, color: C.ink3, marginTop: 1 }}>{label}</Text>
      {sub && <Text style={{ fontSize: 10, color: C.ink4, marginTop: 1 }}>{sub}</Text>}
    </View>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────

function Donut({
  segs, size = 140,
}: {
  segs: { v: number; c: string }[];
  size?: number;
}) {
  const total  = segs.reduce((s, g) => s + g.v, 0);
  const cx = size / 2, cy = size / 2;
  const r  = size / 2 - 22;
  const sw = 22;
  const gap = 4;
  const active = segs.filter(g => g.v > 0);
  let angle = 0;

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={C.line2} strokeWidth={sw} />
      {total > 0 && active.map((seg, i) => {
        const a = (seg.v / total) * (360 - gap * active.length);
        const s = arc(cx, cy, r, angle);
        const e = arc(cx, cy, r, angle + a);
        const lg = a > 180 ? 1 : 0;
        const d = a >= 359.5
          ? `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx - r + 0.001} ${cy}`
          : `M ${f(s.x)} ${f(s.y)} A ${r} ${r} 0 ${lg} 1 ${f(e.x)} ${f(e.y)}`;
        angle += a + gap;
        return <Path key={i} d={d} stroke={seg.c} strokeWidth={sw} fill="none" strokeLinecap="butt" />;
      })}
    </Svg>
  );
}

// ── SVG calorie bar chart ─────────────────────────────────────────────────────

function CalChart({
  data, goalKcal, todayIdx, weekOffset, W,
}: {
  data: { d: string; kcal: number }[];
  goalKcal: number; todayIdx: number; weekOffset: number; W: number;
}) {
  const H = 175;
  const pad = { l: 2, r: 2, t: 30, b: 28 };
  const gW  = W - pad.l - pad.r;
  const gH  = H - pad.t - pad.b;
  const max = Math.max(goalKcal * 1.3, ...data.map(d => d.kcal), 200);
  const n   = data.length;
  const gap = 8;
  const bW  = (gW - gap * (n - 1)) / n;

  const toX = (i: number)  => pad.l + i * (bW + gap);
  const toY = (v: number)  => pad.t + gH - (v / max) * gH;
  const goalY = toY(goalKcal);

  return (
    <Svg width={W} height={H}>
      <Defs>
        <LinearGradient id="calToday" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={C.accent} />
          <Stop offset="100%" stopColor="#A8D438" />
        </LinearGradient>
        <LinearGradient id="calNorm" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={C.ink} stopOpacity="0.85" />
          <Stop offset="100%" stopColor={C.ink} stopOpacity="0.35" />
        </LinearGradient>
        <LinearGradient id="calOver" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={C.danger} stopOpacity="0.9" />
          <Stop offset="100%" stopColor={C.danger} stopOpacity="0.45" />
        </LinearGradient>
      </Defs>

      {/* Goal line */}
      <SvgLine x1={pad.l} y1={goalY} x2={W - pad.r} y2={goalY}
        stroke="#C4C4BC" strokeWidth={1} strokeDasharray="4 5" />
      <SvgText x={W - pad.r} y={goalY - 5} textAnchor="end"
        fontSize={8.5} fill="#B0B0A8">hedef</SvgText>

      {data.map((d, i) => {
        const x     = toX(i);
        const today = weekOffset === 0 && i === todayIdx;
        const over  = d.kcal > goalKcal;
        const has   = d.kcal > 0;
        const bH    = has ? Math.max((d.kcal / max) * gH, 6) : 4;
        const y     = has ? toY(d.kcal) : H - pad.b - 4;
        const fill  = !has ? C.line2 : today ? 'url(#calToday)' : over ? 'url(#calOver)' : 'url(#calNorm)';

        return (
          <G key={i}>
            <Rect x={f(x)} y={f(y)} width={f(bW)} height={f(bH)} rx={5}
              fill={fill} opacity={!has ? 0.45 : 1} />
            {today && has && (
              <SvgText x={f(x + bW / 2)} y={f(y - 8)} textAnchor="middle"
                fontSize={10} fill={C.ink} fontWeight="700">{d.kcal}</SvgText>
            )}
            <SvgText x={f(x + bW / 2)} y={H - 5} textAnchor="middle"
              fontSize={today ? 10.5 : 10} fill={today ? C.ink : '#B0B0A8'}
              fontWeight={today ? '700' : '500'}>{d.d}</SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ── Weight line chart ─────────────────────────────────────────────────────────

function WeightChart({
  logs, goal, W,
}: {
  logs: WeightLog[]; goal: number; W: number;
}) {
  const last = logs.slice(-10);

  if (last.length < 2) {
    return (
      <View style={{ height: 130, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Icons.scale size={28} color={C.ink4} />
        <Text style={{ fontSize: 13, color: C.ink4 }}>
          {logs.length === 0 ? 'Henüz kilo kaydı yok' : 'Trend için en az 2 kayıt gerekli'}
        </Text>
      </View>
    );
  }

  const H   = 160;
  const pad = { l: 4, r: 4, t: 14, b: 26 };
  const gW  = W - pad.l - pad.r;
  const gH  = H - pad.t - pad.b;

  const allKg = [...last.map(l => l.kg), goal];
  const minKg = Math.min(...allKg) - 2.5;
  const maxKg = Math.max(...allKg) + 2.5;
  const span  = maxKg - minKg || 1;

  const tx = (i: number)  => pad.l + (i / (last.length - 1)) * gW;
  const ty = (kg: number) => pad.t + gH - ((kg - minKg) / span) * gH;

  const pts    = last.map((l, i) => ({ x: tx(i), y: ty(l.kg) }));
  const goalY  = ty(goal);
  const line   = bezierLine(pts);
  const area   = bezierArea(pts, H - pad.b);

  const weights  = last.map(l => l.kg);
  const minW     = Math.min(...weights);
  const maxW     = Math.max(...weights);
  const minIdx   = last.findIndex(l => l.kg === minW);
  const maxIdx   = last.findIndex(l => l.kg === maxW);
  const diff     = +(last[last.length - 1].kg - last[0].kg).toFixed(1);
  const showIdxs = new Set([0, Math.floor((last.length - 1) / 2), last.length - 1]);

  return (
    <View>
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={C.ink} stopOpacity="0.1" />
            <Stop offset="100%" stopColor={C.ink} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Goal dashed */}
        <SvgLine x1={pad.l} y1={goalY} x2={W - pad.r} y2={goalY}
          stroke={C.accent} strokeWidth={1.5} strokeDasharray="5 5" />
        <SvgText x={W - pad.r} y={goalY - 5} textAnchor="end"
          fontSize={8.5} fill={C.move}>hedef</SvgText>

        {/* Area fill */}
        <Path d={area} fill="url(#wGrad)" />

        {/* Line */}
        <Path d={line} stroke={C.ink} strokeWidth={2.5} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Small dots */}
        {pts.map((p, i) => (
          <Circle key={i} cx={f(p.x)} cy={f(p.y)} r={3}
            fill={C.bg} stroke={C.ink} strokeWidth={1.8} />
        ))}

        {/* Min/max highlights */}
        {minIdx !== maxIdx && (
          <>
            <Circle cx={f(pts[minIdx].x)} cy={f(pts[minIdx].y)} r={5} fill="#4A9B2A" />
            <Circle cx={f(pts[maxIdx].x)} cy={f(pts[maxIdx].y)} r={5} fill={C.move} />
          </>
        )}

        {/* Latest dot */}
        <Circle cx={f(pts[pts.length - 1].x)} cy={f(pts[pts.length - 1].y)} r={5.5} fill={C.ink} />

        {/* X labels */}
        {last.map((l, i) => {
          if (!showIdxs.has(i)) return null;
          const lbl = l.d ? l.d.slice(5).replace('-', '/') : '';
          return (
            <SvgText key={i} x={f(tx(i))} y={H - 5} textAnchor="middle"
              fontSize={9} fill="#B0B0A8">{lbl}</SvgText>
          );
        })}
      </Svg>

      {/* Legend row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          {minIdx !== maxIdx && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4A9B2A' }} />
                <Text style={{ fontSize: 11, color: C.ink3 }}>En düşük: {minW} kg</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.move }} />
                <Text style={{ fontSize: 11, color: C.ink3 }}>En yüksek: {maxW} kg</Text>
              </View>
            </>
          )}
        </View>
        <Text style={{ fontSize: 11, fontWeight: '600', color: diff <= 0 ? '#4A9B2A' : C.move }}>
          {diff <= 0 ? '↓' : '↑'} {Math.abs(diff)} kg
        </Text>
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function ReportScreen() {
  const {
    streak, meals, exercises, water,
    goalKcal, goalProtein, goalCarbs, goalFat,
    goalWeight, weightLogs,
  } = useApp();

  const [weekOffset, setWeekOffset] = useState(0);
  const [range, setRange]           = useState('1H');
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const chartW    = width - 40 - 44;

  const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();

  const totals = useMemo(() => {
    let kcal = 0, p = 0, c = 0, f = 0;
    Object.values(meals).forEach(m => m.items.forEach(it => {
      kcal += it.kcal; p += it.p; c += it.c; f += it.f;
    }));
    return { kcal, p, c, f };
  }, [meals]);

  const burned = exercises.reduce((s, e) => s + e.kcal, 0);
  const net    = Math.max(totals.kcal - burned, 0);

  const weekData = DAY.map((d, i) => ({
    d, kcal: weekOffset === 0 && i === todayIdx ? totals.kcal : 0,
  }));

  const loggedDays = weekData.filter(d => d.kcal > 0).length;
  const avg = loggedDays > 0
    ? Math.round(weekData.reduce((s, d) => s + d.kcal, 0) / loggedDays) : 0;

  const mk = { p: totals.p * 4, c: totals.c * 4, f: totals.f * 9 };
  const mkTotal = mk.p + mk.c + mk.f;

  const goalWeightNum = parseFloat(goalWeight) || 70;
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].kg : null;

  const weekLabel = weekOffset === 0 ? 'Bu hafta' : `${Math.abs(weekOffset)} hafta önce`;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.eyebrow}>ANALİZLER</Text>
          <Text style={s.title}>{weekLabel}</Text>
        </View>
        <View style={s.navRow}>
          <TouchableOpacity style={s.navBtn} onPress={() => setWeekOffset(o => o - 1)} activeOpacity={0.8}>
            <Icons.chevL size={18} color={C.ink} sw={1.8} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.navBtn, weekOffset === 0 && { opacity: 0.3 }]}
            onPress={() => setWeekOffset(o => Math.min(0, o + 1))}
            activeOpacity={0.8}
          >
            <Icons.chevR size={18} color={C.ink} sw={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Stat tiles ── */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatTile
            label="Günlük seri"
            val={String(streak)}
            unit="gün"
            icon={<Icons.flame size={17} color={streak > 0 ? C.move : C.ink4} />}
            tint={streak > 0 ? '#FFF4E4' : C.card}
          />
          <StatTile
            label="Kalori hedefi"
            val={goalKcal.toLocaleString()}
            unit="kcal"
            icon={<Icons.bolt size={17} color={C.ink} />}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <StatTile
            label="Güncel kilo"
            val={currentWeight != null ? String(currentWeight) : '—'}
            unit={currentWeight != null ? 'kg' : undefined}
            icon={<Icons.scale size={17} color={C.ink} />}
          />
          <StatTile
            label="Net kalori"
            val={totals.kcal > 0 ? String(net) : '—'}
            unit={totals.kcal > 0 ? 'kcal' : undefined}
            icon={<Icons.leaf size={17} color="#4A9B2A" />}
            tint={totals.kcal > 0 && net <= goalKcal ? '#EEF9E4' : C.card}
          />
        </View>

        {/* ── Haftalık Kalori ── */}
        <Text style={s.sectionLabel}>HAFTALİK KALORİ</Text>
        <View style={s.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={s.eyebrowSm}>GÜNLÜK ORTALAMA</Text>
              <Text style={s.bigNum}>
                {avg > 0 ? avg.toLocaleString() : '—'}
                {avg > 0 && <Text style={s.bigUnit}> kcal</Text>}
              </Text>
              {avg > 0 && (
                <Text style={[s.diff, avg <= goalKcal ? s.diffGreen : s.diffRed]}>
                  {avg <= goalKcal
                    ? `↓ ${(goalKcal - avg).toLocaleString()} altında`
                    : `↑ ${(avg - goalKcal).toLocaleString()} üstünde`}
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icons.flame size={15} color={streak > 0 ? C.move : C.ink4} />
                <Text style={{ fontSize: 22, fontWeight: '700', color: C.ink }}>{streak}</Text>
              </View>
              <Text style={{ fontSize: 10, color: C.ink4 }}>günlük seri</Text>
            </View>
          </View>
          <View style={{ marginTop: 6 }}>
            <CalChart
              data={weekData} goalKcal={goalKcal}
              todayIdx={todayIdx} weekOffset={weekOffset} W={chartW}
            />
          </View>
          <View style={s.rangeRow}>
            {['1H', '1A', '3A', '6A', '1Y', 'Tüm'].map(r => (
              <TouchableOpacity
                key={r}
                style={[s.rangeBtn, range === r && s.rangeBtnOn]}
                onPress={() => setRange(r)}
                activeOpacity={0.75}
              >
                <Text style={[s.rangeTxt, range === r && s.rangeTxtOn]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Makro Halkaları ── */}
        <Text style={s.sectionLabel}>GÜNLÜK MAKRO HEDEFLERİ</Text>
        <View style={s.card}>
          <View style={{ flexDirection: 'row' }}>
            <Ring
              pct={goalProtein > 0 ? totals.p / goalProtein : 0}
              color={C.ink} label="Protein"
              val={`${totals.p}g`} sub={`/ ${goalProtein}g`}
            />
            <Ring
              pct={goalCarbs > 0 ? totals.c / goalCarbs : 0}
              color={C.accent} label="Karbonhidrat"
              val={`${totals.c}g`} sub={`/ ${goalCarbs}g`}
            />
            <Ring
              pct={goalFat > 0 ? totals.f / goalFat : 0}
              color={C.move} label="Yağ"
              val={`${totals.f}g`} sub={`/ ${goalFat}g`}
            />
          </View>
        </View>

        {/* ── Makro Dağılımı ── */}
        <Text style={s.sectionLabel}>MAKRO DAĞILIMI</Text>
        <View style={s.card}>
          {mkTotal > 0 ? (
            <View style={{ alignItems: 'center' }}>
              {/* Donut */}
              <View>
                <Donut segs={[
                  { v: mk.p, c: C.ink },
                  { v: mk.c, c: C.accent },
                  { v: mk.f, c: C.move },
                ]} />
                <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 20, fontWeight: '700', letterSpacing: -0.5, color: C.ink }}>
                    {totals.kcal}
                  </Text>
                  <Text style={{ fontSize: 10, color: C.ink3, letterSpacing: 0.4 }}>kcal</Text>
                </View>
              </View>
              {/* Legend */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 22, width: '100%' }}>
                {[
                  { label: 'Protein',       v: totals.p, kv: mk.p,  color: C.ink   },
                  { label: 'Karbonhidrat', v: totals.c, kv: mk.c,  color: C.accent },
                  { label: 'Yağ',           v: totals.f, kv: mk.f,  color: C.move  },
                ].map(m => {
                  const pct = mkTotal > 0 ? Math.round((m.kv / mkTotal) * 100) : 0;
                  return (
                    <View key={m.label} style={{
                      flex: 1, padding: 12, borderRadius: 14,
                      backgroundColor: C.bg, alignItems: 'center', gap: 3,
                    }}>
                      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: m.color }} />
                      <Text style={{ fontSize: 18, fontWeight: '700', color: C.ink }}>{pct}%</Text>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: C.ink2 }}>{m.v}g</Text>
                      <Text style={{ fontSize: 10, color: C.ink4 }}>{m.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 28, gap: 12 }}>
              <Donut segs={[{ v: 1, c: C.line }]} size={100} />
              <Text style={{ fontSize: 13, color: C.ink4, marginTop: 4 }}>
                Öğün kaydedilince görünecek
              </Text>
            </View>
          )}
        </View>

        {/* ── Kilo Trendi ── */}
        <Text style={s.sectionLabel}>KİLO TRENDİ</Text>
        <View style={s.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
            <View>
              <Text style={s.eyebrowSm}>GÜNCEL</Text>
              <Text style={[s.bigNum, { fontSize: 28, marginTop: 2 }]}>
                {currentWeight ?? '—'}
                <Text style={[s.bigUnit, currentWeight == null && { color: C.ink4 }]}>
                  {currentWeight != null ? ' kg' : ''}
                </Text>
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.eyebrowSm}>HEDEF</Text>
              <Text style={[s.bigNum, { fontSize: 28, marginTop: 2, color: C.ink3 }]}>
                {goalWeightNum}
                <Text style={[s.bigUnit, { color: C.ink4 }]}> kg</Text>
              </Text>
            </View>
          </View>
          <WeightChart logs={weightLogs} goal={goalWeightNum} W={chartW} />
        </View>

        {/* ── Bugün özeti ── */}
        <Text style={s.sectionLabel}>BUGÜNÜN ÖZETİ</Text>
        <View style={s.card}>
          {[
            { label: 'Alınan kalori',  val: `${totals.kcal} kcal`, good: totals.kcal > 0 && totals.kcal <= goalKcal },
            { label: 'Yakılan kalori', val: `${burned} kcal`,      good: burned > 0 },
            { label: 'Net kalori',     val: `${net} kcal`,         good: totals.kcal > 0 && net <= goalKcal },
            { label: 'Su tüketimi',    val: `${(water / 1000).toFixed(1)} L`, good: water >= 2000, last: true },
          ].map(row => (
            <View key={row.label} style={[
              { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13 },
              !row.last && { borderBottomWidth: 1, borderBottomColor: C.line2 },
            ]}>
              <Text style={{ fontSize: 13, color: C.ink2 }}>{row.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: row.good ? '#4A9B2A' : C.ink }}>
                {row.val}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Tavsiye ── */}
        <View style={s.insightCard}>
          <View style={s.insightDot} />
          <View style={{ flex: 1 }}>
            <Text style={s.insightTitle}>
              {streak > 0 ? `${streak} günlük serin var! 🔥` : 'Seriyi başlat'}
            </Text>
            <Text style={s.insightBody}>
              {streak > 0
                ? 'Düzenli kayıt tutarak haftalık trendleri ve kişisel önerileri görmeye devam et.'
                : 'İlk öğünü kaydet, haftalık trend grafiklerin açılsın.'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  eyebrow: { fontSize: 11, color: C.ink3, letterSpacing: 0.8, fontWeight: '600' },
  title:   { fontSize: 24, fontWeight: '700', letterSpacing: -0.5, marginTop: 2, color: C.ink },
  navRow:  { flexDirection: 'row', gap: 6 },
  navBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: C.line2, alignItems: 'center', justifyContent: 'center' },

  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100 },

  sectionLabel: { fontSize: 11, color: C.ink3, letterSpacing: 0.8, fontWeight: '600', marginTop: 22, marginBottom: 10, marginLeft: 2 },

  card: { padding: 22, backgroundColor: C.card, borderRadius: 26, borderWidth: 1, borderColor: '#EEEEE8' },

  eyebrowSm: { fontSize: 10.5, color: C.ink3, letterSpacing: 0.6, fontWeight: '600' },
  bigNum:  { fontSize: 30, fontWeight: '700', letterSpacing: -0.7, color: C.ink, marginTop: 3 },
  bigUnit: { fontSize: 13, fontWeight: '400', color: C.ink3 },

  diff:      { fontSize: 12, marginTop: 2, fontWeight: '500' },
  diffGreen: { color: '#4A9B2A' },
  diffRed:   { color: C.danger },

  rangeRow:   { flexDirection: 'row', gap: 5, marginTop: 14 },
  rangeBtn:   { flex: 1, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: C.line2 },
  rangeBtnOn: { backgroundColor: C.ink },
  rangeTxt:   { fontSize: 11, fontWeight: '500', color: C.ink3 },
  rangeTxtOn: { color: C.bg, fontWeight: '600' },

  insightCard: { padding: 16, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: '#EEEEE8', flexDirection: 'row', gap: 12, marginTop: 18 },
  insightDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent, marginTop: 6, flexShrink: 0 },
  insightTitle: { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 3 },
  insightBody:  { fontSize: 13, color: C.ink2, lineHeight: 19 },
});
