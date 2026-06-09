import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
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

const RANK_EMOJI = ['🥇', '🥈', '🥉'];

function getRankEmoji(rank: number): string {
  return rank < RANK_EMOJI.length ? RANK_EMOJI[rank] : `${rank + 1}位`;
}

function holeLabel(hole: HoleResult): string {
  const parts: string[] = [];
  if (hole.isShort) parts.push('★');
  return `H${hole.holeNumber}${parts.length ? ' ' + parts.join(' ') : ''}`;
}

function holePointSummary(hole: HoleResult, playerId: string, config: any): string {
  const pts = calcHolePoints(playerId, hole, config);
  if (pts === 0) return '-';
  const details: string[] = [];
  if (hole.diamonds[playerId]) details.push('💎');
  else if (hole.medals[playerId]) {
    const mk = hole.medals[playerId] as MedalKey;
    details.push(MEDAL_CONFIG[mk].label.split(' ')[0]);
    if (hole.saoichi[playerId]) details.push('🚩');
  }
  if (hole.neapin === playerId) details.push('📍');
  if (hole.birdie[playerId]) details.push('🐦');
  return `+${pts}pt ${details.join('')}`;
}

export default function ResultScreen({ navigation, route }: Props) {
  const { players, holeResults, pointConfig } = route.params;
  const [rateText, setRateText] = useState('');
  const [expandedHoles, setExpandedHoles] = useState<Set<number>>(new Set());

  const totals = players.map((p) => ({
    player: p,
    total: calcTotalPoints(p.id, holeResults, pointConfig),
  }));
  const sorted = [...totals].sort((a, b) => b.total - a.total);

  // Settlement: each player pays/receives based on score difference
  // Settlement per player = score × (n-1) - sum of others' scores
  // Simpler approach: difference from average, scaled by rate
  const rate = parseFloat(rateText) || 0;
  const n = players.length;
  const totalSum = totals.reduce((s, t) => s + t.total, 0);
  const avg = totalSum / n;

  const settlements = totals.map(({ player, total }) => ({
    player,
    total,
    net: total - avg, // positive = receive, negative = pay
    amount: Math.round((total - avg) * rate),
  }));

  const toggleHoleExpand = (holeNum: number) => {
    setExpandedHoles((prev) => {
      const next = new Set(prev);
      if (next.has(holeNum)) next.delete(holeNum);
      else next.add(holeNum);
      return next;
    });
  };

  const handleEditScores = () => {
    navigation.navigate('HoleInput', { players, pointConfig });
  };

  const handleNewGame = () => {
    navigation.navigate('Start');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Title */}
        <Text style={styles.title}>🏆 最終結果</Text>

        {/* Rankings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>順位</Text>
          {sorted.map(({ player, total }, idx) => (
            <View key={player.id} style={[styles.rankRow, idx === 0 && styles.rankRowFirst]}>
              <Text style={styles.rankEmoji}>{getRankEmoji(idx)}</Text>
              <Text style={[styles.rankName, idx === 0 && styles.rankNameFirst]}>{player.name}</Text>
              <Text style={[styles.rankTotal, idx === 0 && styles.rankTotalFirst]}>{total}pt</Text>
            </View>
          ))}
        </View>

        {/* Settlement / Rate Calculation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💴 レート精算</Text>
          <View style={styles.rateInputRow}>
            <Text style={styles.rateLabel}>レート (1ptあたり):</Text>
            <TextInput
              style={styles.rateInput}
              value={rateText}
              onChangeText={setRateText}
              keyboardType="numeric"
              placeholder="例: 100"
              placeholderTextColor={Colors.whiteMuted}
            />
            <Text style={styles.rateCurrency}>円</Text>
          </View>
          {rate > 0 && (
            <View style={styles.settlementList}>
              {settlements.map(({ player, net, amount }) => (
                <View key={player.id} style={styles.settlementRow}>
                  <Text style={styles.settlementName}>{player.name}</Text>
                  <Text
                    style={[
                      styles.settlementAmount,
                      amount >= 0 ? styles.settlementPositive : styles.settlementNegative,
                    ]}
                  >
                    {amount >= 0 ? `+${amount.toLocaleString()}` : amount.toLocaleString()}円
                  </Text>
                </View>
              ))}
              <Text style={styles.settlementNote}>
                ※ 平均点を基準とした差分で計算
              </Text>
            </View>
          )}
        </View>

        {/* Hole-by-hole Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ホール別詳細</Text>
          {holeResults.map((hole) => {
            const isExpanded = expandedHoles.has(hole.holeNumber);
            const hasData = players.some((p) => calcHolePoints(p.id, hole, pointConfig) > 0);
            return (
              <TouchableOpacity
                key={hole.holeNumber}
                onPress={() => toggleHoleExpand(hole.holeNumber)}
                activeOpacity={0.7}
                style={styles.holeRow}
              >
                <View style={styles.holeRowHeader}>
                  <Text style={styles.holeRowLabel}>
                    {holeLabel(hole)}
                  </Text>
                  {hasData && (
                    <Text style={styles.holeRowSummary}>
                      {players
                        .filter((p) => calcHolePoints(p.id, hole, pointConfig) > 0)
                        .map((p) => p.name)
                        .join(', ')}
                    </Text>
                  )}
                  {!hasData && <Text style={styles.holeRowEmpty}>-</Text>}
                  <Text style={styles.holeRowChevron}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
                {isExpanded && (
                  <View style={styles.holeDetail}>
                    {players.map((p) => {
                      const pts = calcHolePoints(p.id, hole, pointConfig);
                      return (
                        <View key={p.id} style={styles.holeDetailRow}>
                          <Text style={styles.holeDetailName}>{p.name}</Text>
                          <Text
                            style={[
                              styles.holeDetailPts,
                              pts > 0 && styles.holeDetailPtsPositive,
                            ]}
                          >
                            {holePointSummary(hole, p.id, pointConfig)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.editBtn} onPress={handleEditScores} activeOpacity={0.7}>
          <Text style={styles.editBtnText}>✏️ スコアを修正する</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newGameBtn} onPress={handleNewGame} activeOpacity={0.7}>
          <Text style={styles.newGameBtnText}>🔄 新しいゲームを始める</Text>
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
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gold,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    backgroundColor: Colors.bgCardSolid,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardTitle: {
    fontSize: 12,
    color: Colors.whiteMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  rankRowFirst: {
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  rankEmoji: {
    fontSize: 22,
    width: 34,
    textAlign: 'center',
  },
  rankName: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  rankNameFirst: {
    color: Colors.gold,
    fontWeight: 'bold',
  },
  rankTotal: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
  },
  rankTotalFirst: {
    color: Colors.gold,
    fontSize: 22,
  },
  rateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateLabel: {
    fontSize: 13,
    color: Colors.whiteMuted,
    flex: 1,
  },
  rateInput: {
    width: 80,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'right',
  },
  rateCurrency: {
    fontSize: 13,
    color: Colors.whiteMuted,
  },
  settlementList: {
    gap: 8,
    marginTop: 4,
  },
  settlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settlementName: {
    fontSize: 14,
    color: Colors.white,
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settlementPositive: {
    color: Colors.success,
  },
  settlementNegative: {
    color: Colors.danger,
  },
  settlementNote: {
    fontSize: 11,
    color: Colors.whiteMuted,
    marginTop: 6,
  },
  holeRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
  },
  holeRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holeRowLabel: {
    fontSize: 14,
    color: Colors.whiteMuted,
    width: 48,
    fontWeight: '600',
  },
  holeRowSummary: {
    flex: 1,
    fontSize: 12,
    color: Colors.gold,
  },
  holeRowEmpty: {
    flex: 1,
    fontSize: 12,
    color: Colors.whiteMuted,
  },
  holeRowChevron: {
    fontSize: 11,
    color: Colors.whiteMuted,
  },
  holeDetail: {
    marginTop: 8,
    paddingLeft: 8,
    gap: 6,
  },
  holeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  holeDetailName: {
    fontSize: 13,
    color: Colors.whiteMuted,
  },
  holeDetailPts: {
    fontSize: 13,
    color: Colors.whiteMuted,
  },
  holeDetailPtsPositive: {
    color: Colors.gold,
  },
  editBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  editBtnText: {
    fontSize: 15,
    color: Colors.whiteMuted,
    fontWeight: '600',
  },
  newGameBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.gold,
  },
  newGameBtnText: {
    fontSize: 15,
    color: '#1a0a00',
    fontWeight: 'bold',
  },
});
