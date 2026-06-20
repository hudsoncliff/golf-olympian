import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Opening'>;
};

const STORAGE_KEY_LAST_NAME = '@golf_last_player_name';

export default function OpeningScreen({ navigation }: Props) {
  const [lastName, setLastName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_LAST_NAME).then((val) => {
      if (val) setLastName(val);
    });
  }, []);

  const handleStartRound = () => {
    navigation.navigate('Start');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleJoinSpectator = () => {
    const code = roomCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('ルームコードを入力してください');
      return;
    }
    Alert.alert('観戦モード', `ルームコード: ${code}\n（この機能は近日公開予定です）`);
  };

  return (
    <LinearGradient
      colors={['#59B2E0', '#2079B7', '#1A8048', '#07471F']}
      locations={[0, 0.3, 0.65, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* App Header */}
          <View style={styles.appHeader}>
            <Text style={styles.title}>⛳️ Onigiri Golf</Text>
            <Text style={styles.titleSub}>OLYMPIC SCORING</Text>
          </View>

          {/* Greeting */}
          {lastName ? (
            <Text style={styles.greeting}>こんにちは、{lastName}さん</Text>
          ) : (
            <Text style={styles.greeting}>こんにちは！</Text>
          )}

          {/* Main Buttons */}
          <View style={styles.mainButtons}>
            <TouchableOpacity style={styles.startBtn} onPress={handleStartRound} activeOpacity={0.8}>
              <Text style={styles.startBtnText}>🚩 ラウンド開始</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsBtn} onPress={handleSettings} activeOpacity={0.7}>
              <Text style={styles.settingsBtnText}>⚙️ 設定</Text>
            </TouchableOpacity>
          </View>

          {/* Spectator Join Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>観戦モードで参加</Text>
            <TextInput
              style={styles.roomInput}
              value={roomCode}
              onChangeText={(t) => setRoomCode(t.toUpperCase())}
              placeholder="ルームコード（例: ABC123）"
              placeholderTextColor={Colors.whiteMuted}
              autoCapitalize="characters"
              maxLength={6}
              returnKeyType="go"
              onSubmitEditing={handleJoinSpectator}
            />
            <TouchableOpacity
              style={[styles.joinBtn, !roomCode.trim() && styles.joinBtnDisabled]}
              onPress={handleJoinSpectator}
              activeOpacity={0.7}
              disabled={!roomCode.trim()}
            >
              <Text style={[styles.joinBtnText, !roomCode.trim() && styles.joinBtnTextDisabled]}>
                👁 観戦モードで参加
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export const OPENING_STORAGE_KEY_LAST_NAME = STORAGE_KEY_LAST_NAME;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: 'center',
    gap: 20,
  },
  appHeader: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    fontSize: 28,
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
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  greeting: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  mainButtons: {
    gap: 12,
  },
  startBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a0a00',
    letterSpacing: 0.5,
  },
  settingsBtn: {
    backgroundColor: 'rgba(2,10,20,0.7)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  settingsBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  card: {
    backgroundColor: 'rgba(2,10,20,0.75)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 12,
  },
  cardLabel: {
    fontSize: 11,
    color: Colors.gold,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  roomInput: {
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    letterSpacing: 1,
  },
  joinBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  joinBtnDisabled: {
    opacity: 0.4,
  },
  joinBtnText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  joinBtnTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
});
