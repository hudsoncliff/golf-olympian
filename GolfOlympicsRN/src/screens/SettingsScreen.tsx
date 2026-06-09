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
  description: string;
  min: number;
  max: number;
}

const SETTING_ROWS: SettingRow[] = [
  { key: 'gold',        label: '🥇 金メダル',   description: '金メダル獲得時の基本ポイント', min: 0, max: 20 },
  { key: 'silver',      label: '🥈 銀メダル',   description: '銀メダル獲得時の基本ポイント', min: 0, max: 20 },
  { key: 'bronze',      label: '🥉 銅メダル',   description: '銅メダル獲得時の基本ポイント', min: 0, max: 20 },
  { key: 'iron',        label: '🪨 鉄メダル',   description: '鉄メダル獲得時の基本ポイント', min: 0, max: 20 },
  { key: 'diamond',     label: '💎 ダイヤ',     description: 'ダイヤ選択時のポイント（メダルの代わり）', min: 0, max: 20 },
  { key: 'saoichiBonus',label: '🚩 竿イチ権',   description: 'メダルへの加算ボーナス', min: 0, max: 20 },
  { key: 'neapin',      label: '📍 ニアピン',   description: 'ショートホール限定ポイント', min: 0, max: 20 },
  { key: 'birdie',      label: '🐦 バーディ',   description: 'バーディ獲得時のポイント', min: 0, max: 20 },
];

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
    setConfig((prev) => {
      const row = SETTING_ROWS.find((r) => r.key === key)!;
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
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚙️ ポイント設定</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.note}>
          各種ポイントをカスタマイズできます。設定はゲーム開始時に適用されます。
        </Text>

        <View style={styles.card}>
          {SETTING_ROWS.map((row, idx) => (
            <View
              key={row.key}
              style={[styles.row, idx < SETTING_ROWS.length - 1 && styles.rowBorder]}
            >
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowDesc}>{row.description}</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleChange(row.key, -1)}
                  activeOpacity={0.7}
                  disabled={config[row.key] <= row.min}
                >
                  <Text style={[styles.stepBtnText, config[row.key] <= row.min && styles.stepBtnDisabled]}>
                    −
                  </Text>
                </TouchableOpacity>
                <Text style={styles.stepValue}>{config[row.key]}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleChange(row.key, +1)}
                  activeOpacity={0.7}
                  disabled={config[row.key] >= row.max}
                >
                  <Text style={[styles.stepBtnText, config[row.key] >= row.max && styles.stepBtnDisabled]}>
                    ＋
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnSaved]}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={styles.saveBtnText}>{saved ? '✓ 保存しました' : '保存する'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
          <Text style={styles.resetBtnText}>デフォルトに戻す</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  backBtnText: {
    fontSize: 15,
    color: Colors.gold,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerRight: {
    minWidth: 60,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  note: {
    fontSize: 13,
    color: Colors.whiteMuted,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.bgCardSolid,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowInfo: {
    flex: 1,
    paddingRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 11,
    color: Colors.whiteMuted,
    lineHeight: 16,
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
    borderColor: Colors.border,
  },
  stepBtnText: {
    fontSize: 20,
    color: Colors.white,
    lineHeight: 24,
  },
  stepBtnDisabled: {
    color: Colors.whiteMuted,
    opacity: 0.4,
  },
  stepValue: {
    width: 36,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  saveBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
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
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  resetBtnText: {
    fontSize: 15,
    color: Colors.whiteMuted,
    fontWeight: '600',
  },
});
