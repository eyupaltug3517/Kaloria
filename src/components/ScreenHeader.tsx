import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icons } from './Icons';
import { C } from '../theme/colors';

interface ScreenHeaderProps {
  title: string;
  sub?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, sub, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Icons.chevL size={20} color={C.ink} sw={1.8} />
        </TouchableOpacity>
      ) : null}
      <View style={[styles.titleWrap, onBack ? styles.centered : null]}>
        <Text style={styles.title}>{title}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      {right != null ? right : onBack ? <View style={styles.placeholder} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: C.ink,
  },
  sub: {
    fontSize: 12,
    color: C.ink3,
    marginTop: 1,
  },
  placeholder: {
    width: 40,
  },
});
