import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
  sw?: number;
};

const mk = (children: (color: string, sw: number) => React.ReactNode) =>
  ({ size = 22, color = '#0E0E0C', sw = 1.6 }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {children(color, sw)}
    </Svg>
  );

export const Icons = {
  home: mk((c, sw) => (
    <Path d="M3 11L12 4l9 7v8a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" stroke={c} strokeWidth={sw} />
  )),
  chart: mk((c, sw) => (
    <Path d="M4 20V10m6 10V4m6 16v-8m6 8v-14" stroke={c} strokeWidth={sw} />
  )),
  plus: mk((c, sw) => (
    <Path d="M12 5v14M5 12h14" stroke={c} strokeWidth={sw} />
  )),
  drop: mk((c, sw) => (
    <Path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z" stroke={c} strokeWidth={sw} />
  )),
  user: mk((c, sw) => (
    <Path d="M4 21a8 8 0 0 1 16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke={c} strokeWidth={sw} />
  )),
  chevR: mk((c, sw) => (
    <Path d="M9 6l6 6-6 6" stroke={c} strokeWidth={sw} />
  )),
  chevL: mk((c, sw) => (
    <Path d="M15 6l-6 6 6 6" stroke={c} strokeWidth={sw} />
  )),
  x: mk((c, sw) => (
    <Path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth={sw} />
  )),
  search: mk((c, sw) => (
    <>
      <Circle cx="11" cy="11" r="7" stroke={c} strokeWidth={sw} />
      <Path d="M21 21l-4.3-4.3" stroke={c} strokeWidth={sw} />
    </>
  )),
  barcode: mk((c, sw) => (
    <Path d="M4 6v12M7 6v12M10 6v9M13 6v12M16 6v9M19 6v12" stroke={c} strokeWidth={sw} />
  )),
  camera: mk((c, sw) => (
    <>
      <Path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke={c} strokeWidth={sw} />
      <Circle cx="12" cy="13" r="4" stroke={c} strokeWidth={sw} />
    </>
  )),
  flame: mk((c, sw) => (
    <Path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-1-.5-2-1-2 0 1-1 2-2 2 0-3 2-4 2-7-1-1-3-2-3-2z" stroke={c} strokeWidth={sw} />
  )),
  dumbbell: mk((c, sw) => (
    <Path d="M2 12h2m16 0h2M5 8v8m3-10v12m8-12v12m3-10v8" stroke={c} strokeWidth={sw} />
  )),
  scale: mk((c, sw) => (
    <>
      <Rect x="3" y="4" width="18" height="16" rx="2" stroke={c} strokeWidth={sw} />
      <Path d="M8 9l2 4h4l2-4" stroke={c} strokeWidth={sw} />
    </>
  )),
  bell: mk((c, sw) => (
    <Path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16zM10 20a2 2 0 0 0 4 0" stroke={c} strokeWidth={sw} />
  )),
  clock: mk((c, sw) => (
    <>
      <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={sw} />
      <Path d="M12 7v5l3 2" stroke={c} strokeWidth={sw} />
    </>
  )),
  check: mk((c, sw) => (
    <Path d="M4 12l5 5L20 6" stroke={c} strokeWidth={sw} />
  )),
  trash: mk((c, sw) => (
    <Path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke={c} strokeWidth={sw} />
  )),
  edit: mk((c, sw) => (
    <Path d="M4 20h4L20 8l-4-4L4 16v4z" stroke={c} strokeWidth={sw} />
  )),
  more: mk((c, sw) => (
    <>
      <Circle cx="5" cy="12" r="1" fill={c} stroke={c} strokeWidth={sw} />
      <Circle cx="12" cy="12" r="1" fill={c} stroke={c} strokeWidth={sw} />
      <Circle cx="19" cy="12" r="1" fill={c} stroke={c} strokeWidth={sw} />
    </>
  )),
  bolt: mk((c, sw) => (
    <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke={c} strokeWidth={sw} />
  )),
  leaf: mk((c, sw) => (
    <Path d="M4 20s2-10 16-16c0 0 2 14-10 16a5 5 0 0 1-6 0z M4 20l8-8" stroke={c} strokeWidth={sw} />
  )),
  mic: mk((c, sw) => (
    <>
      <Rect x="9" y="3" width="6" height="12" rx="3" stroke={c} strokeWidth={sw} />
      <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke={c} strokeWidth={sw} />
    </>
  )),
  star: mk((c, sw) => (
    <Path d="M12 3l2.6 5.5 6 .9-4.3 4.3 1 6-5.3-2.8-5.3 2.8 1-6L3.4 9.4l6-.9z" stroke={c} strokeWidth={sw} />
  )),
  arrowUp: mk((c, sw) => (
    <Path d="M12 19V5M5 12l7-7 7 7" stroke={c} strokeWidth={sw} />
  )),
  arrowDown: mk((c, sw) => (
    <Path d="M12 5v14M19 12l-7 7-7-7" stroke={c} strokeWidth={sw} />
  )),
  bowl: mk((c, sw) => (
    <Path d="M3 11h18a9 9 0 0 1-18 0zM7 11a5 5 0 0 1 10 0" stroke={c} strokeWidth={sw} />
  )),
  coffee: mk((c, sw) => (
    <Path d="M4 8h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8zM17 11h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2M15 3v2" stroke={c} strokeWidth={sw} />
  )),
  moon: mk((c, sw) => (
    <Path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z" stroke={c} strokeWidth={sw} />
  )),
  apple: mk((c, sw) => (
    <Path d="M12 8c0-2 1-4 4-4-1 3-3 4-4 4zM7 8c-3 0-5 3-5 6 0 4 3 8 5 8 1 0 2-1 3-1 2 0 3 1 4 1 2 0 4-3 4-6 0-2-1-4-3-5-2-1-4 0-5 0-1 0-2-1-3-3z" stroke={c} strokeWidth={sw} fill={c} />
  )),
  refresh: mk((c, sw) => (
    <Path d="M4 12a8 8 0 0 1 14.9-3M20 4v5h-5M20 12a8 8 0 0 1-14.9 3M4 20v-5h5" stroke={c} strokeWidth={sw} />
  )),
  sun: mk((c, sw) => (
    <>
      <Circle cx="12" cy="12" r="4" stroke={c} strokeWidth={sw} />
      <Path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke={c} strokeWidth={sw} />
    </>
  )),
} as const;

export type IconName = keyof typeof Icons;

export function getIcon(name: string, props: IconProps) {
  const icon = Icons[name as IconName];
  return icon ? icon(props) : null;
}
