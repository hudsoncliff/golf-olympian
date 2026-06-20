import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import { MEDAL_CONFIG, MedalKey } from '../config/gameConfig';
import { calcTotalPoints, calcHolePoints, HoleResult, TOTAL_HOLES } from '../models/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

const RANK_MEDAL = ['🥇', '🥈', '🥉', '🔩'];

function getRankMedal(rank: number): string {
  return RANK_MEDAL[rank] ?? `${rank + 1}`;
}

function holeIconSummary(hole: HoleResult, playerId: string, config: any): string {
  const pts = calcHolePoints(playerId, hole, config);
  if (pts === 0) return '—';
  const icons: string[] = [];
  if (hole.diamonds[playerId]) icons.push('💎');
  else if (hole.medals[playerId]) {
    const mk = hole.medals[playerId] as MedalKey;
    icons.push(MEDAL_CONFIG[mk].label.split(' ')[0]);
    if (hole.saoichi[playerId]) icons.push('🚩');
  }
  if (hole.neapin === playerId) icons.push('📍');
  if (hole.birdie[playerId]) icons.push('🐦');
  return `+${pts}pt ${icons.join('')}`;
}

export default function ResultScreen({ navigation, route }: Props) {
  const { players, holeResults, pointConfig } = route.params;
  const [holeDetailOpen, setHoleDetailOpen] = useState(false);

  const totals = players.map((p) => ({
    player: p,
    total: calcTotalPoints(p.id, holeResults, pointConfig),
  }));
  const sorted = [...totals].sort((a, b) => b.total - a.total);

  const rankedSorted = sorted.map((item) => {
    const rank = sorted.findIndex((s) => s.total === item.total);
    return { ...item, rank };
  });

  const n = players.length;
  const totalSum = totals.reduce((s, t) => s + t.total, 0);

  const handleRateCalc = () => {
    navigation.navigate('RateCalc', { players, holeResults, pointConfig });
  };

  const handleEditScores = () => {
    navigation.navigate('HoleInput', { players, pointConfig });
  };

  return (
    <LinearGradient
      colors={['#59B2E0', '#2079B7', '#1A8048', '#07471F']}
      locations={[0, 0.25, 0.6, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* App Header */}
          <View style={styles.appHeader}>
            <Text style={styles.appTitle}>⛳️ Onigiri Golf</Text>
            <Text style={styles.appSub}>OLYMPIC SCORING</Text>
          </View>

          {/* Rankings */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🏆 最終結果</Text>
            {rankedSorted.map(({ player, total, rank }, idx) => (
              <View key={player.id} style={[styles.rankRow, idx === 0 && styles.rankRowFirst]}>
                <Text style={styles.rankEmoji}>{getRankMedal(rank)}</Text>
                <Text style={[styles.rankName, idx === 0 && styles.rankNameFirst]}>
                  {player.name}
                </Text>
                <Text style={[styles.rankTotal, idx === 0 && styles.rankTotalFirst]}>
                  {total}pt
                </Text>
              </View>
            ))}
          </View>

          {/* Hole-by-hole Details */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.holeDetailToggle}
              onPress={() => setHoleDetailOpen(!holeDetailOpen)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>ホール別点数を見る</Text>
              <Text style={styles.toggleChevron}>{holeDetailOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {holeDetailOpen && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
                <View>
                  {/* Table Header */}
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCellH]}>H</Text>
                    {players.map((p) => (
                      <Text key={p.id} style={[styles.tableCell, styles.tableCellPlayer]}>
                        {p.name}
                      </Text>
                    ))}
                  </View>
                  {/* Table Body */}
                  {holeResults.map((hole) => {
                    const hasData = players.some((p) => calcHolePoints(p.id, hole, pointConfig) > 0);
                    return (
                      <View
                        key={hole.holeNumber}
                        style={[styles.tableRow, hasData && styles.tableRowActive]}
                      >
                        <Text style={[styles.tableCell, styles.tableCellH, hasData && styles.tableCellHActive]}>
                          {hole.holeNumber}
                        </Text>
                        {players.map((p) => {
                          const pts = calcHolePoints(p.id, hole, pointConfig);
                          return (
                            <Text
                              key={p.id}
                              style={[
                                styles.tableCell,
                                styles.tableCellPlayer,
                                pts > 0 && styles.tableCellPositive,
                              ]}
                            >
                              {pts > 0 ? holeIconSummary(hole, p.id, pointConfig) : '—'}
                            </Text>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Settlement Points */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>精算点</Text>
            <Text style={styles.settlementFormula}>
              本人pt × (人数-1) − 他全員のpt合計
            </Text>
            {totals.map(({ player, total }) => {
              const net = total * (n - 1) - (totalSum - total);
              return (
                <View key={player.id} style={styles.settlementRow}>
                  <Text style={styles.settlementName}>{player.name}</Text>
                  <Text
                    style={[
                      styles.settlementNet,
                      net > 0 && styles.settlementPositive,
                      net < 0 && styles.settlementNegative,
                    ]}
                  >
                    {net >= 0 ? `+${net}pt` : `${net}pt`}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.rateCalcBtn} onPress={handleRateCalc} activeOpacity={0.8}>
            <Text style={styles.rateCalcBtnText}>💴 レート計算・集計</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editBtn} onPress={handleEditScores} activeOpacity={0.7}>
            <Text style={styles.editBtnText}>✏️ スコアを修正する</Text>
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
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  appHeader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.gold,
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 6,
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(2,10,20,0.82)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    gap: 10,
  },
  cardTitle: {
    fontSize: 12,
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 2,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  rankRowFirst: {
    backgroundColor: 'rgba(245,166,35,0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  rankEmoji: {
    fontSize: 22,
    width: 34,
    textAlign: 'center',
  },
  rankName: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  rankNameFirst: {
    color: Colors.gold,
    fontWeight: 'bold',
  },
  rankTotal: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
  rankTotalFirst: {
    color: Colors.gold,
    fontSize: 22,
  },
  holeDetailToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleChevron: {
    fontSize: 12,
    color: Colors.gold,
  },
  tableScroll: {
    marginTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 6,
  },
  tableRowActive: {
    backgroundColor: 'rgba(245,166,35,0.06)',
  },
  tableCell: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tableCellH: {
    width: 30,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  tableCellHActive: {
    color: Colors.gold,
  },
  tableCellPlayer: {
    minWidth: 90,
    fontSize: 11,
  },
  tableCellPositive: {
    color: Colors.gold,
  },
  settlementFormula: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  settlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  settlementName: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  settlementNet: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  settlementPositive: {
    color: Colors.success,
  },
  settlementNegative: {
    color: Colors.danger,
  },
  rateCalcBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  rateCalcBtnText: {
    fontSize: 16,
    color: '#1a0a00',
    fontWeight: 'bold',
  },
  editBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  editBtnText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
});
