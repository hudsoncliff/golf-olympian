import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import { calcTotalPoints } from '../models/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'RateCalc'>;
  route: RouteProp<RootStackParamList, 'RateCalc'>;
};

export default function RateCalcScreen({ navigation, route }: Props) {
  const { players, holeResults, pointConfig } = route.params;
  const [rateText, setRateText] = useState('100');
  const [currency, setCurrency] = useState('円');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('@golf_default_rate'),
      AsyncStorage.getItem('@golf_currency'),
    ]).then(([rate, cur]) => {
      if (rate) setRateText(rate);
      if (cur && cur.trim()) setCurrency(cur.trim());
    });
  }, []);

  const totals = players.map((p) => ({
    player: p,
    total: calcTotalPoints(p.id, holeResults, pointConfig),
  }));
  const sorted = [...totals].sort((a, b) => b.total - a.total);

  const n = players.length;
  const totalSum = totals.reduce((s, t) => s + t.total, 0);
  const rate = parseFloat(rateText) || 0;

  const rows = sorted.map(({ player, total }) => {
    const net = total * (n - 1) - (totalSum - total);
    const amount = Math.round(net * rate);
    return { player, total, net, amount };
  });

  const handleFinish = () => {
    navigation.navigate('Opening');
  };

  return (
    <LinearGradient
      colors={['#59B2E0', '#2079B7', '#1A8048', '#07471F']}
      locations={[0, 0.25, 0.6, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={styles.backBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>💴 レート計算</Text>
            <View style={styles.backBtnPlaceholder} />
          </View>

          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            {/* Rate Input */}
            <View style={styles.card}>
              <Text style={styles.rateLabel}>1ポイントあたりのレート（円）</Text>
              <TextInput
                style={styles.rateInput}
                value={rateText}
                onChangeText={setRateText}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor={Colors.whiteMuted}
                selectTextOnFocus
              />
            </View>

            {/* Results Table */}
            <View style={styles.card}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.cellName]} />
                <Text style={[styles.tableCell, styles.cellPt]}>獲得pt</Text>
                <Text style={[styles.tableCell, styles.cellNet]}>精算pt</Text>
                <Text style={[styles.tableCell, styles.cellAmount]}>精算額({currency})</Text>
              </View>
              {rows.map(({ player, total, net, amount }) => (
                <View key={player.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.cellName, styles.cellNameText]} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.cellPt, styles.cellPtText]}>
                    {total}pt{rate > 0 ? ' →' : ''}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.cellNet,
                      net > 0 ? styles.positive : net < 0 ? styles.negative : styles.neutral,
                    ]}
                  >
                    {net >= 0 ? `+${net}pt` : `${net}pt`}{rate > 0 ? ' →' : ''}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.cellAmount,
                      amount > 0 ? styles.positive : amount < 0 ? styles.negative : styles.neutral,
                    ]}
                  >
                    {rate > 0
                      ? amount >= 0
                        ? `+${amount.toLocaleString()}${currency}`
                        : `${amount.toLocaleString()}${currency}`
                      : '—'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Finish Button */}
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} activeOpacity={0.8}>
              <Text style={styles.finishBtnText}>ゲームを終了する</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    width: 40,
    alignItems: 'flex-start',
  },
  backBtnText: {
    fontSize: 32,
    color: Colors.gold,
    lineHeight: 34,
  },
  backBtnPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.gold,
    letterSpacing: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: 'rgba(2,10,20,0.82)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    gap: 12,
  },
  rateLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  rateInput: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.3)',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  cellName: {
    flex: 1.4,
    textAlign: 'left',
  },
  cellNameText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  cellPt: {
    flex: 1,
  },
  cellPtText: {
    color: Colors.gold,
    fontWeight: '600',
    fontSize: 13,
  },
  cellNet: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  cellAmount: {
    flex: 1.2,
    fontSize: 13,
    fontWeight: '700',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.danger,
  },
  neutral: {
    color: 'rgba(255,255,255,0.5)',
  },
  finishBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gold,
    backgroundColor: 'rgba(245,166,35,0.1)',
  },
  finishBtnText: {
    fontSize: 16,
    color: Colors.gold,
    fontWeight: 'bold',
  },
});
