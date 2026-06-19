import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import {
  MEDAL_CONFIG,
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

  const holeResultsRef = useRef<HoleResult[]>(
    Array.from({ length: TOTAL_HOLES }, (_, i) => emptyHoleResult(i + 1)),
  );

  const [currentHole, setCurrentHole] = useState(1);
  const [, forceUpdate] = useState(0);
  const [quitDialogVisible, setQuitDialogVisible] = useState(false);
  const [shareDialogVisible, setShareDialogVisible] = useState(false);

  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  const hole = holeResultsRef.current[currentHole - 1];
  const availableMedals = getMedalKeysForCount(players.length);

  const toggleMedal = (playerId: string, medal: MedalKey) => {
    const h = holeResultsRef.current[currentHole - 1];
    const newMedals = { ...h.medals };
    const newDiamonds = { ...h.diamonds };

    if (newMedals[playerId] === medal) {
      delete newMedals[playerId];
    } else {
      for (const pid of Object.keys(newMedals)) {
        if (newMedals[pid] === medal) delete newMedals[pid];
      }
      newMedals[playerId] = medal;
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
    <LinearGradient
      colors={['#59B2E0', '#2079B7', '#1A8048', '#07471F']}
      locations={[0, 0.2, 0.6, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.holeInfo}>
            <Text style={styles.holeLabel}>HOLE</Text>
            <View style={styles.holeNumRow}>
              <Text style={styles.holeNum}>{currentHole}</Text>
              <Text style={styles.holeTotal}>{currentHole} / {TOTAL_HOLES}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.shareBtn} onPress={() => setShareDialogVisible(true)} activeOpacity={0.7}>
              <Text style={styles.shareBtnText}>共有</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quitBtn} onPress={handleQuit} activeOpacity={0.7}>
              <Text style={styles.quitBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
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
                {/* Player Name */}
                <Text style={styles.playerName}>{player.name}</Text>

                {/* Medal Buttons */}
                <View style={styles.medalRow}>
                  {hasDiamond ? (
                    <Text style={styles.diamondPlaceholder}>💎 ダイヤモンド（メダル対象外）</Text>
                  ) : (
                    availableMedals.map((medal) => {
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
                            takenByOther && styles.medalBtnTaken,
                          ]}
                          onPress={() => toggleMedal(player.id, medal)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.medalBtnText,
                              isActive && { color: cfg.color },
                              takenByOther && styles.medalBtnTextMuted,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.7}
                          >
                            {cfg.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                  {!hasDiamond && <View style={{ flex: 1 }} />}
                </View>

                {/* Special Options Row 1: Diamond, Saoichi, Neapin */}
                <View style={styles.specialRow}>
                  <TouchableOpacity
                    style={[styles.specialBtn, hasDiamond && styles.specialBtnActiveDiamond]}
                    onPress={() => toggleDiamond(player.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.specialBtnText, hasDiamond && { color: Colors.diamond }]}>
                      💎 ダイヤモンド
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

                  <TouchableOpacity
                    style={[styles.specialBtn, hasNeapin && styles.specialBtnActiveNeapin]}
                    onPress={() => toggleNeapin(player.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.specialBtnText, hasNeapin && { color: Colors.neapin }]}>
                      📍 ニアピン
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Special Options Row 2: Birdie */}
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

                {/* Points indicator (only shown when > 0) */}
                {pts > 0 && (
                  <View style={styles.ptsIndicator}>
                    <Text style={styles.ptsIndicatorText}>このホール +{pts}pt</Text>
                  </View>
                )}
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

        {/* Share Dialog (placeholder — modal design TBD) */}
        <Modal
          visible={shareDialogVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setShareDialogVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>スコアを共有</Text>
              <Text style={styles.modalBody}>（共有機能は近日実装予定）</Text>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShareDialogVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    paddingBottom: 8,
  },
  holeInfo: {
    gap: 2,
  },
  holeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    fontWeight: '600',
  },
  holeNumRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  holeNum: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.gold,
    lineHeight: 44,
  },
  holeTotal: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.4)',
  },
  shareBtnText: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '600',
  },
  quitBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,138,138,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,138,0.3)',
  },
  quitBtnText: {
    fontSize: 15,
    color: Colors.danger,
    fontWeight: '600',
  },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: 10,
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
  playerCard: {
    backgroundColor: 'rgba(2,10,20,0.82)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    gap: 8,
  },
  playerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  diamondPlaceholder: {
    fontSize: 12,
    color: Colors.diamond,
    fontStyle: 'italic',
    flex: 1,
  },
  medalRow: {
    flexDirection: 'row',
    gap: 6,
  },
  medalBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  medalBtnTaken: {
    opacity: 0.4,
  },
  medalBtnText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  medalBtnTextMuted: {
    color: 'rgba(255,255,255,0.3)',
  },
  specialRow: {
    flexDirection: 'row',
    gap: 6,
  },
  specialBtn: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  specialBtnActiveDiamond: {
    borderColor: Colors.diamond,
    backgroundColor: 'rgba(100,212,247,0.15)',
  },
  specialBtnActiveSaoichi: {
    borderColor: Colors.saoichi,
    backgroundColor: 'rgba(167,139,250,0.15)',
  },
  specialBtnActiveNeapin: {
    borderColor: Colors.neapin,
    backgroundColor: 'rgba(52,211,153,0.15)',
  },
  specialBtnActiveBirdie: {
    borderColor: Colors.birdie,
    backgroundColor: 'rgba(134,239,172,0.15)',
  },
  specialBtnText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  ptsIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ptsIndicatorText: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '700',
  },
  scoreboard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 14,
    backgroundColor: 'rgba(2,10,20,0.82)',
    gap: 8,
  },
  scoreboardTitle: {
    fontSize: 11,
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreRank: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    width: 28,
  },
  scoreName: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
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
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  backBtnText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
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
    borderColor: 'rgba(255,255,255,0.14)',
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
    borderColor: 'rgba(255,255,255,0.2)',
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
