import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import { DEFAULT_POINT_CONFIG, PointConfig } from '../config/gameConfig';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Settings'>;
};

const STORAGE_KEY = '@golf_point_config';

interface SettingRow {
  key: keyof PointConfig;
  label: string;
  min: number;
  max: number;
}

const MEDAL_ROWS: SettingRow[] = [
  { key: 'gold',        label: '🥇 金',   min: 0, max: 20 },
  { key: 'silver',      label: '🥈 銀',   min: 0, max: 20 },
  { key: 'bronze',      label: '🥉 銅',   min: 0, max: 20 },
  { key: 'iron',        label: '🪨 鉄',   min: 0, max: 20 },
];

const OPTION_ROWS: SettingRow[] = [
  { key: 'diamond',      label: '💎 ダイヤモンド',  min: 0, max: 20 },
  { key: 'saoichiBonus', label: '🚩 竿イチボーナス', min: 0, max: 20 },
  { key: 'neapin',       label: '📍 ニアピン',       min: 0, max: 20 },
  { key: 'birdie',       label: '🐦 バーディ',        min: 0, max: 20 },
];

function StepperRow({
  row,
  value,
  onChange,
  isLast,
}: {
  row: SettingRow;
  value: number;
  onChange: (delta: number) => void;
  isLast: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{row.label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(-1)}
          activeOpacity={0.7}
          disabled={value <= row.min}
        >
          <Text style={[styles.stepBtnText, value <= row.min && styles.stepBtnDisabled]}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{value}pt</Text>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(+1)}
          activeOpacity={0.7}
          disabled={value >= row.max}
        >
          <Text style={[styles.stepBtnText, value >= row.max && styles.stepBtnDisabled]}>＋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const [config, setConfig] = useState<PointConfig>({ ...DEFAULT_POINT_CONFIG });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        try {
          setConfig(JSON.parse(val));
        } catch {
          // ignore
        }
      }
    });
  }, []);

  const handleChange = (key: keyof PointConfig, delta: number) => {
    const allRows = [...MEDAL_ROWS, ...OPTION_ROWS];
    setConfig((prev) => {
      const row = allRows.find((r) => r.key === key)!;
      const next = Math.min(row.max, Math.max(row.min, prev[key] + delta));
      return { ...prev, [key]: next };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    Alert.alert(
      'デフォルトに戻す',
      'ポイント設定をデフォルト値に戻しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            setConfig({ ...DEFAULT_POINT_CONFIG });
            setSaved(false);
          },
        },
      ],
    );
  };

  return (
    <LinearGradient
      colors={['#59B2E0', '#2079B7', '#1A8048', '#07471F']}
      locations={[0, 0.3, 0.65, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>設定</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Medal Points */}
          <Text style={styles.sectionTitle}>メダルポイント</Text>
          <View style={styles.card}>
            {MEDAL_ROWS.map((row, idx) => (
              <StepperRow
                key={row.key}
                row={row}
                value={config[row.key]}
                onChange={(delta) => handleChange(row.key, delta)}
                isLast={idx === MEDAL_ROWS.length - 1}
              />
            ))}
          </View>

          {/* Option Points */}
          <Text style={styles.sectionTitle}>オプション</Text>
          <View style={styles.card}>
            {OPTION_ROWS.map((row, idx) => (
              <StepperRow
                key={row.key}
                row={row}
                value={config[row.key]}
                onChange={(delta) => handleChange(row.key, delta)}
                isLast={idx === OPTION_ROWS.length - 1}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnSaved]}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={styles.saveBtnText}>{saved ? '✓ 保存しました' : '保存して戻る'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.resetBtnText}>デフォルトに戻す</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    minWidth: 40,
  },
  backBtnText: {
    fontSize: 32,
    color: Colors.white,
    lineHeight: 34,
    fontWeight: '300',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerRight: {
    minWidth: 40,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'rgba(2,10,20,0.82)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.4)',
  },
  stepBtnText: {
    fontSize: 20,
    color: Colors.white,
    lineHeight: 24,
  },
  stepBtnDisabled: {
    color: 'rgba(255,255,255,0.2)',
  },
  stepValue: {
    width: 52,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  saveBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnSaved: {
    backgroundColor: Colors.success,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a0a00',
  },
  resetBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  resetBtnText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});
