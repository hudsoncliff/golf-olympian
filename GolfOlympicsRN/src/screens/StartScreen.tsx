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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import { DEFAULT_POINT_CONFIG, PointConfig } from '../config/gameConfig';
import { Player } from '../models/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Start'>;
};

const STORAGE_KEY_POINT_CONFIG = '@golf_point_config';

export default function StartScreen({ navigation }: Props) {
  const [playerCount, setPlayerCount] = useState(4);
  const [names, setNames] = useState(['', '', '', '']);
  const [pointConfig, setPointConfig] = useState<PointConfig>(DEFAULT_POINT_CONFIG);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_POINT_CONFIG).then((val) => {
      if (val) {
        try {
          setPointConfig(JSON.parse(val));
        } catch {
          // ignore
        }
      }
    });
  }, []);

  const handleStart = () => {
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: String(i + 1),
      name: names[i].trim() || `プレイヤー${i + 1}`,
    }));
    navigation.navigate('HoleInput', { players, pointConfig });
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.title}>⛳ Onigiri Golf</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={handleSettingsPress} activeOpacity={0.7}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>オリンピック（マイホール）スコア管理</Text>

        {/* Player Count */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>プレイヤー人数</Text>
          <View style={styles.countRow}>
            {[2, 3, 4].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.countBtn, playerCount === n && styles.countBtnActive]}
                onPress={() => setPlayerCount(n)}
                activeOpacity={0.7}
              >
                <Text style={[styles.countBtnText, playerCount === n && styles.countBtnTextActive]}>
                  {n}人
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Player Names */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>プレイヤー名</Text>
          {Array.from({ length: playerCount }, (_, i) => (
            <View key={i} style={styles.nameRow}>
              <Text style={styles.nameLabel}>P{i + 1}</Text>
              <TextInput
                style={styles.nameInput}
                value={names[i]}
                onChangeText={(text) => {
                  const next = [...names];
                  next[i] = text;
                  setNames(next);
                }}
                placeholder={`プレイヤー${i + 1}`}
                placeholderTextColor={Colors.whiteMuted}
                maxLength={12}
                returnKeyType="done"
              />
            </View>
          ))}
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.7}>
          <Text style={styles.startBtnText}>ゲーム開始 ▶</Text>
        </TouchableOpacity>

        {/* Point Config Preview */}
        <View style={styles.pointPreview}>
          <Text style={styles.pointPreviewTitle}>現在のポイント設定</Text>
          <View style={styles.pointPreviewRow}>
            <Text style={styles.pointPreviewItem}>🥇{pointConfig.gold}pt</Text>
            <Text style={styles.pointPreviewItem}>🥈{pointConfig.silver}pt</Text>
            <Text style={styles.pointPreviewItem}>🥉{pointConfig.bronze}pt</Text>
            <Text style={styles.pointPreviewItem}>🪨{pointConfig.iron}pt</Text>
          </View>
          <View style={styles.pointPreviewRow}>
            <Text style={styles.pointPreviewItem}>💎{pointConfig.diamond}pt</Text>
            <Text style={styles.pointPreviewItem}>🚩+{pointConfig.saoichiBonus}pt</Text>
            <Text style={styles.pointPreviewItem}>📍{pointConfig.neapin}pt</Text>
            <Text style={styles.pointPreviewItem}>🐦{pointConfig.birdie}pt</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    width: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.gold,
    textAlign: 'center',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.whiteMuted,
    textAlign: 'center',
    marginBottom: 28,
  },
  card: {
    backgroundColor: Colors.bgCardSolid,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 13,
    color: Colors.whiteMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  countBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(245,166,35,0.15)',
  },
  countBtnText: {
    fontSize: 16,
    color: Colors.whiteMuted,
    fontWeight: '600',
  },
  countBtnTextActive: {
    color: Colors.gold,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameLabel: {
    width: 28,
    fontSize: 13,
    color: Colors.whiteMuted,
    fontWeight: '600',
  },
  nameInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  startBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a0a00',
  },
  pointPreview: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
  },
  pointPreviewTitle: {
    fontSize: 11,
    color: Colors.whiteMuted,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pointPreviewRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  pointPreviewItem: {
    fontSize: 12,
    color: Colors.whiteMuted,
  },
});
