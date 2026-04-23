import { Platform, Alert } from 'react-native';
import { WeightLog, NotifToggles } from '../types';

export interface KaloriaExport {
  version: string;
  exportedAt: string;
  profile: { name: string; email: string };
  goals: {
    kcal: number; protein: number; carbs: number; fat: number;
    weight: string; activity: string;
  };
  settings: { units: string; notifications: NotifToggles };
  stats: { streak: number };
  weightLogs: WeightLog[];
}

// ── Web helpers ──────────────────────────────────────────────────────────────

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Mobile helpers ───────────────────────────────────────────────────────────

async function shareFile(content: string, filename: string) {
  const FileSystem = await import('expo-file-system');
  const Sharing = await import('expo-sharing');

  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert('Paylaşım desteklenmiyor', 'Bu cihaz dosya paylaşımını desteklemiyor.');
    return;
  }
  await Sharing.shareAsync(uri, { mimeType: filename.endsWith('.csv') ? 'text/csv' : 'application/json' });
}

// ── Exports ──────────────────────────────────────────────────────────────────

export async function exportJSON(data: KaloriaExport) {
  const date = new Date().toISOString().slice(0, 10);
  const content = JSON.stringify(data, null, 2);
  const filename = `kaloria-backup-${date}.json`;

  if (Platform.OS === 'web') {
    triggerDownload(content, filename, 'application/json');
  } else {
    await shareFile(content, filename);
  }
}

export async function exportWeightCSV(weightLogs: WeightLog[]) {
  const date = new Date().toISOString().slice(0, 10);
  const rows = ['Date,Weight (kg)', ...weightLogs.map(l => `${l.d},${l.kg}`)];
  const content = rows.join('\n');
  const filename = `kaloria-weight-${date}.csv`;

  if (Platform.OS === 'web') {
    triggerDownload(content, filename, 'text/csv');
  } else {
    await shareFile(content, filename);
  }
}

export async function pickAndParseJSON(): Promise<KaloriaExport> {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) { reject(new Error('Dosya seçilmedi')); return; }
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const parsed = JSON.parse(e.target?.result as string) as KaloriaExport;
            if (!parsed.version || !parsed.goals) throw new Error('Geçersiz yedek dosyası');
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  // Mobile
  const DocumentPicker = await import('expo-document-picker');
  const FileSystem = await import('expo-file-system');

  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.[0]) throw new Error('Dosya seçilmedi');

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const parsed = JSON.parse(content) as KaloriaExport;
  if (!parsed.version || !parsed.goals) throw new Error('Geçersiz yedek dosyası');
  return parsed;
}

export function parseJSONText(text: string): KaloriaExport {
  const parsed = JSON.parse(text) as KaloriaExport;
  if (!parsed.version || !parsed.goals) throw new Error('Geçersiz yedek dosyası');
  return parsed;
}
