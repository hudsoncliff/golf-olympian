import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import {
  MEDAL_CONFIG,
  MEDAL_KEYS,
  MedalKey,
  getMedalKeysForCount,
  PointConfig,
} from '../config/gameConfig';
import {
  Player,
  HoleResult,
  emptyHoleResult,
  calcHolePoints,
  calcTotalPoints,
  TOTAL_HOLES,
} from '../models/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'HoleInput'>;
  route: RouteProp<RootStackParamList, 'HoleInput'>;
};

export default function HoleInputScreen({ navigation, route }: Props) {
  const { players, pointConfig } = route.params;

  // Mutable game state stored in a ref to survive re-renders without triggering them
  const holeResultsRef = useRef<HoleResult[]>(
    Array.from({ length: TOTAL_HOLES }, (_, i) => emptyHoleResult(i + 1)),
  );

  const [currentHole, setCurrentHole] = useState(1);
  const [, forceUpdate] = useState(0);
  const [quitDialogVisible, setQuitDialogVisible] = useState(false);

  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  const hole = holeResultsRef.current[currentHole - 1];
  const availableMedals = getMedalKeysForCount(players.length);

  // ---- Medal logic ----
  const toggleMedal = (playerId: string, medal: MedalKey) => {
    const h = holeResultsRef.current[currentHole - 1];
    const newMedals = { ...h.medals };
    const newDiamonds = { ...h.diamonds };

    if (newMedals[playerId] === medal) {
      // Deselect
      delete newMedals[playerId];
    } else {
      // Remove this medal from whoever had it
      for (const pid of Object.keys(newMedals)) {
        if (newMedals[pid] === medal) delete newMedals[pid];
      }
      newMedals[playerId] = medal;
      // If this player had diamond, remove it (medal replaces diamond)
      delete newDiamonds[playerId];
    }

    holeResultsRef.current[currentHole - 1] = { ...h, medals: newMedals, diamonds: newDiamonds };
    refresh();
  };

  const toggleDiamond = (playerId: string) => {
    const h = holeResultsRef.current[currentHole - 1];
    const newDiamonds = { ...h.diamonds };
    const newMedals = { ...h.medals };

    if (newDiamonds[playerId]) {
      delete newDiamonds[playerId];
    } else {
      newDiamonds[playerId] = true;
      // Remove medal for this player (diamond replaces it)
      delete newMedals[playerId];
    }

    holeResultsRef.current[currentHole - 1] = { ...h, diamonds: newDiamonds, medals: newMedals };
    refresh();
  };

  const toggleSaoichi = (playerId: string) => {
    const h = holeResultsRef.current[currentHole - 1];
    const newSaoichi = { ...h.saoichi };
    if (newSaoichi[playerId]) {
      delete newSaoichi[playerId];
    } else {
      newSaoichi[playerId] = true;
    }
    holeResultsRef.current[currentHole - 1] = { ...h, saoichi: newSaoichi };
    refresh();
  };

  const toggleNeapin = (playerId: string) => {
    const h = holeResultsRef.current[currentHole - 1];
    const newNeapin = h.neapin === playerId ? null : playerId;
    holeResultsRef.current[currentHole - 1] = { ...h, neapin: newNeapin };
    refresh();
  };

  const toggleBirdie = (playerId: string) => {
    const h = holeResultsRef.current[currentHole - 1];
    const newBirdie = { ...h.birdie };
    if (newBirdie[playerId]) {
      delete newBirdie[playerId];
    } else {
      newBirdie[playerId] = true;
    }
    holeResultsRef.current[currentHole - 1] = { ...h, birdie: newBirdie };
    refresh();
  };

  const toggleShort = () => {
    const h = holeResultsRef.current[currentHole - 1];
    const isShort = !h.isShort;
    // Clear neapin if turning off short
    const neapin = isShort ? h.neapin : null;
    holeResultsRef.current[currentHole - 1] = { ...h, isShort, neapin };
    refresh();
  };

  // ---- Navigation ----
  const handleBack = () => {
    if (currentHole === 1) {
      navigation.goBack();
    } else {
      setCurrentHole(currentHole - 1);
    }
  };

  const handleNext = () => {
    if (currentHole === TOTAL_HOLES) {
      navigation.navigate('Result', {
        players,
        holeResults: holeResultsRef.current,
        pointConfig,
      });
    } else {
      setCurrentHole(currentHole + 1);
    }
  };

  const handleQuit = () => {
    setQuitDialogVisible(true);
  };

  const confirmQuit = () => {
    setQuitDialogVisible(false);
    navigation.navigate('Start');
  };

  const progress = currentHole / TOTAL_HOLES;
  const isLastHole = currentHole === TOTAL_HOLES;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.holeInfoRow}>
          <Text style={styles.holeLabel}>ホール</Text>
          <Text style={styles.holeNum}>{currentHole}</Text>
          <Text style={styles.holeTotal}>/ {TOTAL_HOLES}</Text>
        </View>
        <TouchableOpacity style={styles.quitBtn} onPress={handleQuit} activeOpacity={0.7}>
          <Text style={styles.quitBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Short Hole Toggle */}
        <TouchableOpacity
          style={[styles.shortToggle, hole.isShort && styles.shortToggleActive]}
          onPress={toggleShort}
          activeOpacity={0.7}
        >
          <Text style={[styles.shortToggleText, hole.isShort && styles.shortToggleTextActive]}>
            ★ ショートホール {hole.isShort ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        {/* Player Rows */}
        {players.map((player) => {
          const pts = calcHolePoints(player.id, hole, pointConfig);
          const hasDiamond = !!hole.diamonds[player.id];
          const hasSaoichi = !!hole.saoichi[player.id];
          const hasNeapin = hole.neapin === player.id;
          const hasBirdie = !!hole.birdie[player.id];
          const playerMedal = hole.medals[player.id];

          return (
            <View key={player.id} style={styles.playerCard}>
              {/* Player Name + Points */}
              <View style={styles.playerHeader}>
                <Text style={styles.playerName}>{player.name}</Text>
                <View style={styles.ptsBadge}>
                  <Text style={styles.ptsText}>{pts > 0 ? `+${pts}pt` : `${pts}pt`}</Text>
                </View>
              </View>

              {/* Medal Buttons */}
              <View style={styles.medalRow}>
                {availableMedals.map((medal) => {
                  const cfg = MEDAL_CONFIG[medal];
                  const isActive = playerMedal === medal;
                  const takenByOther =
                    !isActive &&
                    Object.values(hole.medals).includes(medal) &&
                    hole.medals[player.id] !== medal;
                  return (
                    <TouchableOpacity
                      key={medal}
                      style={[
                        styles.medalBtn,
                        isActive && { backgroundColor: cfg.color + '33', borderColor: cfg.color },
                        hasDiamond && styles.medalBtnDisabled,
                        takenByOther && styles.medalBtnTaken,
                      ]}
                      onPress={() => !hasDiamond && toggleMedal(player.id, medal)}
                      activeOpacity={0.7}
                      disabled={hasDiamond}
                    >
                      <Text
                        style={[
                          styles.medalBtnText,
                          isActive && { color: cfg.color },
                          (hasDiamond || takenByOther) && styles.medalBtnTextMuted,
                        ]}
                      >
                        {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Special Row 1: Diamond, Saoichi, Neapin */}
              <View style={styles.specialRow}>
                <TouchableOpacity
                  style={[styles.specialBtn, hasDiamond && styles.specialBtnActiveDiamond]}
                  onPress={() => toggleDiamond(player.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.specialBtnText, hasDiamond && { color: Colors.diamond }]}>
                    💎 ダイヤ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.specialBtn, hasSaoichi && styles.specialBtnActiveSaoichi]}
                  onPress={() => toggleSaoichi(player.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.specialBtnText, hasSaoichi && { color: Colors.saoichi }]}>
                    🚩 竿イチ権
                  </Text>
                </TouchableOpacity>

                {hole.isShort && (
                  <TouchableOpacity
                    style={[styles.specialBtn, hasNeapin && styles.specialBtnActiveNeapin]}
                    onPress={() => toggleNeapin(player.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.specialBtnText, hasNeapin && { color: Colors.neapin }]}>
                      📍 ニアピン
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Special Row 2: Birdie */}
              <View style={styles.specialRow}>
                <TouchableOpacity
                  style={[styles.specialBtn, hasBirdie && styles.specialBtnActiveBirdie]}
                  onPress={() => toggleBirdie(player.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.specialBtnText, hasBirdie && { color: Colors.birdie }]}>
                    🐦 バーディ
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Mini Scoreboard */}
        <View style={styles.scoreboard}>
          <Text style={styles.scoreboardTitle}>累計スコア</Text>
          {[...players]
            .map((p) => ({
              player: p,
              total: calcTotalPoints(p.id, holeResultsRef.current.slice(0, currentHole), pointConfig),
            }))
            .sort((a, b) => b.total - a.total)
            .map(({ player, total }, idx) => (
              <View key={player.id} style={styles.scoreRow}>
                <Text style={styles.scoreRank}>{idx + 1}位</Text>
                <Text style={styles.scoreName}>{player.name}</Text>
                <Text style={styles.scoreTotal}>{total}pt</Text>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← 戻る</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextBtn, isLastHole && styles.nextBtnFinish]}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextBtnText}>
            {isLastHole ? '結果を見る 🏆' : '次のホールへ →'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quit Confirmation Dialog */}
      <Modal
        visible={quitDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuitDialogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>ゲームを中止しますか？</Text>
            <Text style={styles.modalBody}>入力したスコアは失われます。</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setQuitDialogVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalQuitBtn} onPress={confirmQuit} activeOpacity={0.7}>
                <Text style={styles.modalQuitText}>中止する</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 6,
  },
  holeInfoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  holeLabel: {
    fontSize: 13,
    color: Colors.whiteMuted,
  },
  holeNum: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.gold,
    lineHeight: 36,
  },
  holeTotal: {
    fontSize: 16,
    color: Colors.whiteMuted,
  },
  quitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,138,138,0.15)',
  },
  quitBtnText: {
    fontSize: 18,
    color: Colors.danger,
  },
  progressBg: {
    height: 4,
    backgroundColor: Colors.progressBg,
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
    gap: 10,
  },
  shortToggle: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  shortToggleActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(245,166,35,0.1)',
  },
  shortToggleText: {
    fontSize: 14,
    color: Colors.whiteMuted,
    fontWeight: '600',
  },
  shortToggleTextActive: {
    color: Colors.gold,
  },
  playerCard: {
    backgroundColor: Colors.bgCardSolid,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  ptsBadge: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ptsText: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '700',
  },
  medalRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  medalBtn: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  medalBtnDisabled: {
    opacity: 0.3,
  },
  medalBtnTaken: {
    opacity: 0.4,
  },
  medalBtnText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  medalBtnTextMuted: {
    color: Colors.whiteMuted,
  },
  specialRow: {
    flexDirection: 'row',
    gap: 6,
  },
  specialBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  specialBtnActiveDiamond: {
    borderColor: Colors.diamond,
    backgroundColor: 'rgba(100,212,247,0.12)',
  },
  specialBtnActiveSaoichi: {
    borderColor: Colors.saoichi,
    backgroundColor: 'rgba(167,139,250,0.12)',
  },
  specialBtnActiveNeapin: {
    borderColor: Colors.neapin,
    backgroundColor: 'rgba(52,211,153,0.12)',
  },
  specialBtnActiveBirdie: {
    borderColor: Colors.birdie,
    backgroundColor: 'rgba(134,239,172,0.12)',
  },
  specialBtnText: {
    fontSize: 12,
    color: Colors.whiteMuted,
    fontWeight: '600',
  },
  scoreboard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    backgroundColor: Colors.bgCardSolid,
    gap: 6,
  },
  scoreboardTitle: {
    fontSize: 11,
    color: Colors.whiteMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreRank: {
    fontSize: 13,
    color: Colors.whiteMuted,
    width: 28,
  },
  scoreName: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
  },
  scoreTotal: {
    fontSize: 15,
    color: Colors.gold,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  backBtnText: {
    fontSize: 15,
    color: Colors.whiteMuted,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.gold,
  },
  nextBtnFinish: {
    backgroundColor: Colors.success,
  },
  nextBtnText: {
    fontSize: 15,
    color: '#1a0a00',
    fontWeight: 'bold',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#0d1f3c',
    borderRadius: 18,
    padding: 24,
    width: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    color: Colors.whiteMuted,
    textAlign: 'center',
    marginBottom: 22,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 15,
    color: Colors.whiteMuted,
    fontWeight: '600',
  },
  modalQuitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,138,138,0.2)',
    borderWidth: 1.5,
    borderColor: Colors.danger,
  },
  modalQuitText: {
    fontSize: 15,
    color: Colors.danger,
    fontWeight: '700',
  },
});
