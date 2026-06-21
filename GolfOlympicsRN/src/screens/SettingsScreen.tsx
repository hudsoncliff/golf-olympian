import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
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

const STORAGE_KEY_POINT_CONFIG = '@golf_point_config';
const STORAGE_KEY_LAST_NAME    = '@golf_last_player_name';
const STORAGE_KEY_DEFAULT_RATE = '@golf_default_rate';
const STORAGE_KEY_CURRENCY     = '@golf_currency';

const PRIVACY_POLICY_URL = 'https://hudsoncliff.github.io/golf-olympian/privacy/';

interface SettingRow {
  key: keyof PointConfig;
  label: string;
  min: number;
  max: number;
}

const MEDAL_ROWS: SettingRow[] = [
  { key: 'gold',   label: '🥇 金', min: 0, max: 20 },
  { key: 'silver', label: '🥈 銀', min: 0, max: 20 },
  { key: 'bronze', label: '🥉 銅', min: 0, max: 20 },
  { key: 'iron',   label: '🪨 鉄', min: 0, max: 20 },
];

const OPTION_ROWS: SettingRow[] = [
  { key: 'diamond',      label: '💎 ダイヤモンド',   min: 0, max: 20 },
  { key: 'saoichiBonus', label: '🚩 竿イチボーナス', min: 0, max: 20 },
  { key: 'neapin',       label: '📍 ニアピン',        min: 0, max: 20 },
  { key: 'birdie',       label: '🐦 バーディ',         min: 0, max: 20 },
];

const RULE_ITEMS = [
  {
    icon: '🥇🥈🥉🪨',
    title: 'メダル',
    desc: 'グリーンオン後、ピンから遠い順に金〜鉄を割り当て。1パットで沈めたプレイヤーのみ点数を獲得。',
  },
  {
    icon: '💎',
    title: 'ダイヤモンド',
    desc: 'グリーン外からチップインした場合にポイント獲得。メダルは獲得しない。',
  },
  {
    icon: '🚩',
    title: '竿イチ権',
    desc: 'ボールとカップの距離が旗竿より長い場合に獲得。1パット成功時にボーナスポイント加算。',
  },
  {
    icon: '📍',
    title: 'ニアピン',
    desc: 'グリーンオン後、カップに最も近いプレイヤーが獲得。1ホールにつき1人のみ。',
  },
  {
    icon: '🐦',
    title: 'バーディ',
    desc: 'そのホールでバーディを達成したプレイヤーが獲得。メダルとの重複可。複数プレイヤーが同時取得可能。',
  },
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
  const [config, setConfig]       = useState<PointConfig>({ ...DEFAULT_POINT_CONFIG });
  const [userName, setUserName]   = useState('');
  const [defaultRate, setDefaultRate] = useState('100');
  const [currency, setCurrency]   = useState('円');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_POINT_CONFIG),
      AsyncStorage.getItem(STORAGE_KEY_LAST_NAME),
      AsyncStorage.getItem(STORAGE_KEY_DEFAULT_RATE),
      AsyncStorage.getItem(STORAGE_KEY_CURRENCY),
    ]).then(([cfg, name, rate, cur]) => {
      if (cfg) {
        try { setConfig(JSON.parse(cfg)); } catch {}
      }
      if (name) setUserName(name);
      if (rate) setDefaultRate(rate);
      if (cur)  setCurrency(cur);
    });
  }, []);

  const handleChange = (key: keyof PointConfig, delta: number) => {
    const allRows = [...MEDAL_ROWS, ...OPTION_ROWS];
    setConfig((prev) => {
      const row = allRows.find((r) => r.key === key)!;
      const next = Math.min(row.max, Math.max(row.min, prev[key] + delta));
      return { ...prev, [key]: next };
    });
  };

  const handleSave = async () => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_POINT_CONFIG, JSON.stringify(config)),
      AsyncStorage.setItem(STORAGE_KEY_LAST_NAME,    userName.trim()),
      AsyncStorage.setItem(STORAGE_KEY_DEFAULT_RATE, defaultRate || '100'),
      AsyncStorage.setItem(STORAGE_KEY_CURRENCY,     currency.trim() || '円'),
    ]);
    navigation.goBack();
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
          onPress: () => setConfig({ ...DEFAULT_POINT_CONFIG }),
        },
      ],
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() => {
      Alert.alert('エラー', 'URLを開けませんでした。');
    });
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

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* ユーザー情報 */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>ユーザー情報</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>名前</Text>
              <TextInput
                style={styles.fieldInput}
                value={userName}
                onChangeText={setUserName}
                placeholder="名前を入力"
                placeholderTextColor={Colors.whiteMuted}
                maxLength={12}
                returnKeyType="done"
              />
            </View>

            <View style={[styles.fieldGroup, styles.fieldGroupBorder]}>
              <Text style={styles.fieldLabel}>デフォルトレート（円 / pt）</Text>
              <TextInput
                style={styles.fieldInput}
                value={defaultRate}
                onChangeText={setDefaultRate}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor={Colors.whiteMuted}
                returnKeyType="done"
              />
            </View>

            <View style={[styles.fieldGroup, styles.fieldGroupBorder]}>
              <Text style={styles.fieldLabel}>通貨単位</Text>
              <TextInput
                style={styles.fieldInput}
                value={currency}
                onChangeText={setCurrency}
                placeholder="円"
                placeholderTextColor={Colors.whiteMuted}
                maxLength={10}
                returnKeyType="done"
              />
              <Text style={styles.fieldHint}>
                レート計算画面の精算額に表示されます（例：ペリカ、ドル、石）
              </Text>
            </View>
          </View>

          {/* メダルポイント */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>メダルポイント</Text>
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

          {/* オプション */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>オプション</Text>
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

          {/* ルール説明 */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>ルール説明</Text>
            {RULE_ITEMS.map((item, idx) => (
              <View
                key={item.title}
                style={[styles.ruleItem, idx < RULE_ITEMS.length - 1 && styles.ruleItemBorder]}
              >
                <Text style={styles.ruleIcon}>{item.icon}</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleTitle}>{item.title}</Text>
                  <Text style={styles.ruleDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>保存して戻る</Text>
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.resetBtnText}>デフォルトに戻す</Text>
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity style={styles.privacyBtn} onPress={handlePrivacyPolicy} activeOpacity={0.7}>
            <Text style={styles.privacyBtnText}>プライバシーポリシー</Text>
            <Text style={styles.privacyIcon}>↗</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
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
    paddingBottom: 48,
    gap: 12,
  },
  card: {
    backgroundColor: 'rgba(2,10,20,0.82)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  cardSectionTitle: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  /* ユーザー情報フィールド */
  fieldGroup: {
    paddingBottom: 14,
    gap: 6,
  },
  fieldGroupBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 14,
  },
  fieldLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
  },
  fieldInput: {
    height: 46,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.35)',
  },
  fieldHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 16,
  },
  /* ステッパー行 */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
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
  /* ルール説明 */
  ruleItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 10,
    alignItems: 'flex-start',
  },
  ruleItemBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  ruleIcon: {
    fontSize: 18,
    lineHeight: 24,
    width: 36,
  },
  ruleTextWrap: {
    flex: 1,
    gap: 3,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  ruleDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 18,
  },
  /* ボタン */
  saveBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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
  privacyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  privacyBtnText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  privacyIcon: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
  },
});
