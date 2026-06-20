import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      id: `p${i + 1}`,
      name: names[i].trim() || `プレイヤー${i + 1}`,
    }));
    const firstName = names[0].trim();
    if (firstName) {
      AsyncStorage.setItem('@golf_last_player_name', firstName).catch(() => {});
    }
    navigation.navigate('HoleInput', { players, pointConfig });
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <LinearGradient
      colors={['#59B2E0', '#2079B7', '#1A8048', '#07471F']}
      locations={[0, 0.3, 0.65, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* App Header */}
          <View style={styles.appHeader}>
            <Text style={styles.title}>⛳️ Onigiri Golf</Text>
            <Text style={styles.titleSub}>OLYMPIC SCORING</Text>
          </View>

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
              <TextInput
                key={i}
                style={[styles.nameInput, i < playerCount - 1 && styles.nameInputSpaced]}
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
            ))}
          </View>

          {/* Start Button */}
          <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.8}>
            <Text style={styles.startBtnText}>ゲーム開始 🏌️</Text>
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity style={styles.settingsBtn} onPress={handleSettingsPress} activeOpacity={0.7}>
            <Text style={styles.settingsBtnText}>⚙️ 設定</Text>
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
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  appHeader: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 6,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    backgroundColor: 'rgba(2,10,20,0.82)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  cardTitle: {
    fontSize: 12,
    color: Colors.gold,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
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
    borderColor: 'rgba(245,166,35,0.3)',
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
  nameInput: {
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingHorizontal: 14,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.3)',
  },
  nameInputSpaced: {
    marginBottom: 10,
  },
  startBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a0a00',
  },
  settingsBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  settingsBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.85)',
  },
});
