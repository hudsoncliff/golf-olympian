import { useState, useCallback } from "react";

const MEDAL_CONFIG = {
  gold:   { label: "🥇 金", points: 4, color: "#F5A623", bg: "#FFF8E7", border: "#F5A623" },
  silver: { label: "🥈 銀", points: 3, color: "#9B9B9B", bg: "#F5F5F5", border: "#9B9B9B" },
  bronze: { label: "🥉 銅", points: 2, color: "#C47B2B", bg: "#FDF1E7", border: "#C47B2B" },
  iron:   { label: "🔩 鉄", points: 1, color: "#607D8B", bg: "#ECEFF1", border: "#607D8B" },
};

const MEDAL_KEYS = ["gold", "silver", "bronze", "iron"];
const TOTAL_HOLES = 18;

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)",
    fontFamily: "'Georgia', serif",
    color: "#f0e6d3",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 0 40px 0",
  },
  header: {
    width: "100%",
    textAlign: "center",
    padding: "28px 20px 16px",
    borderBottom: "1px solid rgba(245,166,35,0.2)",
    marginBottom: "24px",
  },
  title: {
    fontSize: "22px",
    letterSpacing: "0.15em",
    color: "#F5A623",
    fontWeight: "bold",
    margin: 0,
  },
  subtitle: {
    fontSize: "11px",
    color: "rgba(240,230,211,0.5)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginTop: "4px",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(245,166,35,0.15)",
    borderRadius: "16px",
    padding: "24px 20px",
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
  },
  sectionTitle: {
    fontSize: "13px",
    letterSpacing: "0.12em",
    color: "#F5A623",
    textTransform: "uppercase",
    marginBottom: "16px",
    fontStyle: "italic",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(245,166,35,0.3)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#f0e6d3",
    fontSize: "15px",
    fontFamily: "Georgia, serif",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "10px",
  },
  btn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontFamily: "Georgia, serif",
    fontSize: "15px",
    fontWeight: "bold",
    letterSpacing: "0.08em",
    transition: "all 0.2s",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #F5A623, #e8951c)",
    color: "#0a1628",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.07)",
    color: "#f0e6d3",
    border: "1px solid rgba(240,230,211,0.2)",
  },
  btnDanger: {
    background: "rgba(220,80,80,0.15)",
    color: "#ff8a8a",
    border: "1px solid rgba(220,80,80,0.3)",
  },
  playerRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "14px",
  },
  playerName: {
    fontSize: "14px",
    fontWeight: "bold",
    width: "64px",
    flexShrink: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  medalBtns: {
    display: "flex",
    gap: "5px",
    flex: 1,
    flexWrap: "wrap",
  },
  holeInfo: {
    textAlign: "center",
    marginBottom: "20px",
  },
  holeNum: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#F5A623",
    lineHeight: 1,
  },
  holeLabel: {
    fontSize: "11px",
    color: "rgba(240,230,211,0.5)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginTop: "2px",
  },
  progressBar: {
    width: "100%",
    height: "4px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "2px",
    marginBottom: "20px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #F5A623, #e8951c)",
    borderRadius: "2px",
    transition: "width 0.4s ease",
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "8px",
    marginBottom: "6px",
  },
  rank: {
    fontSize: "18px",
    width: "28px",
    textAlign: "center",
  },
  resultName: {
    flex: 1,
    fontSize: "15px",
    paddingLeft: "8px",
  },
  resultScore: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#F5A623",
  },
  miniScore: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    fontSize: "12px",
    color: "rgba(240,230,211,0.6)",
    borderTop: "1px solid rgba(245,166,35,0.1)",
    marginTop: "12px",
    paddingTop: "12px",
    flexWrap: "wrap",
    gap: "4px",
  },
  navBtns: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },
  playerCount: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
  },
  countBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(245,166,35,0.3)",
    background: "transparent",
    color: "#f0e6d3",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "Georgia, serif",
    transition: "all 0.2s",
  },
  countBtnActive: {
    background: "rgba(245,166,35,0.2)",
    border: "1px solid #F5A623",
    color: "#F5A623",
  },
  rateBox: {
    background: "rgba(245,166,35,0.08)",
    border: "1px solid rgba(245,166,35,0.25)",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "20px",
  },
  rateRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid rgba(245,166,35,0.1)",
  },
  payRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "8px",
    marginBottom: "6px",
  },
  modal: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "20px",
  },
  modalCard: {
    background: "#0d2137",
    border: "1px solid rgba(245,166,35,0.3)",
    borderRadius: "16px",
    padding: "24px 20px",
    width: "100%",
    maxWidth: "360px",
    boxSizing: "border-box",
  },
};

function getRankEmoji(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}位`;
}

function getMedalKeysForCount(count) {
  return MEDAL_KEYS.slice(0, count);
}

// ── StartView ──────────────────────────────────────────────────
function StartView({ onStart }) {
  const [count, setCount] = useState(4);
  const [names, setNames] = useState(["", "", "", ""]);

  const updateName = (i, val) => {
    const n = [...names];
    n[i] = val;
    setNames(n);
  };

  const handleStart = () => {
    const players = names.slice(0, count).map((n, i) => ({
      id: `p${i}`,
      name: n.trim() || `Player ${i + 1}`,
    }));
    onStart(players);
  };

  return (
    <div style={{ ...styles.card, maxWidth: "380px" }}>
      <p style={styles.sectionTitle}>プレイヤー人数</p>
      <div style={styles.playerCount}>
        {[2, 3, 4].map(n => (
          <button
            key={n}
            style={{ ...styles.countBtn, ...(count === n ? styles.countBtnActive : {}) }}
            onClick={() => setCount(n)}
          >
            {n}人
          </button>
        ))}
      </div>
      <p style={styles.sectionTitle}>プレイヤー名</p>
      {names.slice(0, count).map((name, i) => (
        <input
          key={i}
          style={styles.input}
          placeholder={`Player ${i + 1}`}
          value={name}
          onChange={e => updateName(i, e.target.value)}
        />
      ))}
      <div style={{ marginTop: "8px" }} />
      <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleStart}>
        ゲーム開始 ⛳
      </button>
    </div>
  );
}

// ── HoleInputView ──────────────────────────────────────────────
function HoleInputView({ players, holeResults, currentHole, onSave, onPrev, onFinish }) {
  // ★ 修正: 前ホールのデータは引き継がず、保存済みデータがあればそれを初期値にする
  const saved = holeResults[currentHole - 1];
  const hasSaved = saved && Object.keys(saved).length > 0;
  const [medals, setMedals] = useState(hasSaved ? saved : {});

  const availableMedals = getMedalKeysForCount(players.length);

  const selectMedal = useCallback((playerId, medal) => {
    setMedals(prev => {
      const next = { ...prev };
      // 同じメダルを他のプレイヤーが持っていたら外す
      Object.keys(next).forEach(pid => {
        if (next[pid] === medal) delete next[pid];
      });
      // 同じボタンを再タップで解除
      if (prev[playerId] === medal) {
        delete next[playerId];
      } else {
        next[playerId] = medal;
      }
      return next;
    });
  }, []);

  const totalScore = (pid) =>
    holeResults.reduce((sum, h, idx) => {
      if (idx === currentHole - 1) return sum; // 現在ホールは除く（下でリアルタイム加算）
      const m = h[pid];
      return sum + (m ? MEDAL_CONFIG[m].points : 0);
    }, 0);

  const isLast = currentHole === TOTAL_HOLES;

  return (
    <div style={{ ...styles.card, maxWidth: "420px" }}>
      <div style={styles.holeInfo}>
        <div style={styles.holeNum}>{currentHole}</div>
        <div style={styles.holeLabel}>HOLE / {TOTAL_HOLES}</div>
      </div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${(currentHole / TOTAL_HOLES) * 100}%` }} />
      </div>

      <p style={styles.sectionTitle}>メダル割り当て</p>
      <p style={{ fontSize: "11px", color: "rgba(240,230,211,0.45)", marginBottom: "14px", marginTop: "-10px" }}>
        1パットで決めたプレイヤーのメダルを選択（再タップで解除）
      </p>

      {players.map(player => (
        <div key={player.id} style={styles.playerRow}>
          <div style={styles.playerName}>{player.name}</div>
          <div style={styles.medalBtns}>
            {availableMedals.map(mk => {
              const cfg = MEDAL_CONFIG[mk];
              const selected = medals[player.id] === mk;
              return (
                <button
                  key={mk}
                  onClick={() => selectMedal(player.id, mk)}
                  style={{
                    padding: "5px 8px",
                    borderRadius: "7px",
                    border: `1.5px solid ${selected ? cfg.border : "rgba(255,255,255,0.12)"}`,
                    background: selected ? cfg.bg : "transparent",
                    color: selected ? cfg.color : "rgba(240,230,211,0.5)",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "Georgia, serif",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                    fontWeight: selected ? "bold" : "normal",
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* ミニスコアボード */}
      <div style={styles.miniScore}>
        {players.map(p => (
          <span key={p.id}>
            {p.name}:{" "}
            <span style={{ color: "#F5A623", fontWeight: "bold" }}>
              {totalScore(p.id) + (medals[p.id] ? MEDAL_CONFIG[medals[p.id]].points : 0)}pt
            </span>
          </span>
        ))}
      </div>

      <div style={styles.navBtns}>
        {currentHole > 1 && (
          <button style={{ ...styles.btn, ...styles.btnSecondary, flex: 1 }} onClick={onPrev}>
            ← 戻る
          </button>
        )}
        <button
          style={{ ...styles.btn, ...styles.btnPrimary, flex: 2 }}
          onClick={() => isLast ? onFinish(medals) : onSave(medals)}
        >
          {isLast ? "結果を見る 🏆" : "次のホールへ →"}
        </button>
      </div>
    </div>
  );
}

// ── RateModal ──────────────────────────────────────────────────
function calcFinalScores(players, scores) {
  const n = players.length;
  const total = players.reduce((s, p) => s + scores[p.id], 0);
  return players.map(p => ({
    ...p,
    finalScore: scores[p.id] * (n - 1) - (total - scores[p.id]),
  }));
}

function RateModal({ players, scores, onClose }) {
  const [rate, setRate] = useState("");

  const rateNum = parseInt(rate.replace(/,/g, ""), 10) || 0;

  const finals = calcFinalScores(players, scores);
  const diffs = finals.map(p => ({
    ...p,
    diff: p.finalScore * rateNum,
  }));

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
        <p style={{ ...styles.sectionTitle, textAlign: "center", marginBottom: "20px" }}>
          💴 レート計算
        </p>

        {/* レート入力 */}
        <p style={{ fontSize: "12px", color: "rgba(240,230,211,0.6)", marginBottom: "8px" }}>
          1ポイントあたりのレート（円）
        </p>
        <input
          style={{ ...styles.input, marginBottom: "20px" }}
          type="number"
          placeholder="例: 100"
          value={rate}
          onChange={e => setRate(e.target.value)}
        />

        {/* スコア一覧 */}
        <div style={styles.rateBox}>
          <div style={{ fontSize: "11px", color: "rgba(240,230,211,0.4)", marginBottom: "10px", letterSpacing: "0.1em" }}>
            ポイント集計
          </div>
          {players
            .slice()
            .sort((a, b) => scores[b.id] - scores[a.id])
            .map(p => (
              <div key={p.id} style={styles.rateRow}>
                <span style={{ fontSize: "14px" }}>{p.name}</span>
                <span style={{ color: "#F5A623", fontWeight: "bold" }}>{scores[p.id]}pt</span>
              </div>
            ))}
        </div>

        {/* 精算結果 */}
        {rateNum > 0 && (
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "11px", color: "rgba(240,230,211,0.4)", marginBottom: "10px", letterSpacing: "0.1em" }}>
              精算金額
            </div>
            {diffs.sort((a, b) => b.diff - a.diff).map(p => (
              <div key={p.id} style={{
                ...styles.payRow,
                background: p.diff > 0 ? "rgba(80,200,120,0.1)" : p.diff < 0 ? "rgba(220,80,80,0.1)" : "rgba(255,255,255,0.04)",
              }}>
                <span style={{ fontSize: "14px" }}>{p.name}</span>
                <span style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: p.diff > 0 ? "#50C878" : p.diff < 0 ? "#ff8a8a" : "rgba(240,230,211,0.4)",
                }}>
                  {p.diff > 0 ? `+${p.diff.toLocaleString()}円` : p.diff < 0 ? `${p.diff.toLocaleString()}円` : "±0円"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "20px" }} />
        <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}

// ── ResultView ──────────────────────────────────────────────────
function ResultView({ players, holeResults, onEdit, onNewGame }) {
  const [showRate, setShowRate] = useState(false);

  const scores = {};
  players.forEach(p => {
    scores[p.id] = holeResults.reduce((sum, h) => {
      const m = h[p.id];
      return sum + (m ? MEDAL_CONFIG[m].points : 0);
    }, 0);
  });

  const sorted = players.slice().sort((a, b) => scores[b.id] - scores[a.id]);

  let rank = 1;
  const ranked = sorted.map((p, i) => {
    if (i > 0 && scores[p.id] < scores[sorted[i - 1].id]) rank = i + 1;
    return { ...p, rank };
  });

  return (
    <>
      {showRate && (
        <RateModal players={players} scores={scores} onClose={() => setShowRate(false)} />
      )}
      <div style={{ ...styles.card, maxWidth: "380px" }}>
        <p style={{ ...styles.sectionTitle, textAlign: "center", fontSize: "15px" }}>
          🏆 最終結果
        </p>

        {ranked.map(p => (
          <div key={p.id} style={{
            ...styles.scoreRow,
            background: p.rank === 1 ? "rgba(245,166,35,0.12)" : "rgba(255,255,255,0.04)",
            border: p.rank === 1 ? "1px solid rgba(245,166,35,0.35)" : "1px solid transparent",
          }}>
            <span style={styles.rank}>{getRankEmoji(p.rank)}</span>
            <span style={styles.resultName}>{p.name}</span>
            <span style={styles.resultScore}>{scores[p.id]}pt</span>
          </div>
        ))}

        {/* ホール別詳細 */}
        <details style={{ marginTop: "20px" }}>
          <summary style={{ fontSize: "12px", color: "rgba(240,230,211,0.5)", cursor: "pointer", letterSpacing: "0.1em" }}>
            ホール別スコアを見る
          </summary>
          <div style={{ marginTop: "12px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr>
                  <th style={{ color: "#F5A623", textAlign: "left", padding: "4px 6px" }}>H</th>
                  {players.map(p => (
                    <th key={p.id} style={{ color: "#F5A623", padding: "4px 6px", textAlign: "center" }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holeResults.map((h, i) => (
                  <tr key={i}>
                    <td style={{ padding: "3px 6px", color: "rgba(240,230,211,0.5)" }}>{i + 1}</td>
                    {players.map(p => {
                      const m = h[p.id];
                      const cfg = m ? MEDAL_CONFIG[m] : null;
                      return (
                        <td key={p.id} style={{ textAlign: "center", padding: "3px 6px", color: cfg ? cfg.color : "rgba(255,255,255,0.2)" }}>
                          {cfg ? cfg.label.split(" ")[0] : "ー"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* 精算点 */}
        <div style={{ marginTop: "20px" }}>
          <div style={{ fontSize: "11px", color: "rgba(240,230,211,0.4)", marginBottom: "10px", letterSpacing: "0.1em" }}>
            精算点（本人pt × 他人人数 − 他人pt合計）
          </div>
          {calcFinalScores(players, scores)
            .sort((a, b) => b.finalScore - a.finalScore)
            .map(p => (
              <div key={p.id} style={{
                ...styles.payRow,
                background: p.finalScore > 0 ? "rgba(80,200,120,0.1)" : p.finalScore < 0 ? "rgba(220,80,80,0.1)" : "rgba(255,255,255,0.04)",
              }}>
                <span style={{ fontSize: "14px" }}>{p.name}</span>
                <span style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: p.finalScore > 0 ? "#50C878" : p.finalScore < 0 ? "#ff8a8a" : "rgba(240,230,211,0.4)",
                }}>
                  {p.finalScore > 0 ? `+${p.finalScore}` : p.finalScore}pt
                </span>
              </div>
            ))}
        </div>

        {/* ★ ボタン3つ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => setShowRate(true)}>
            💴 レート計算・集計
          </button>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={onEdit}>
            ✏️ スコアを修正する
          </button>
          <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={onNewGame}>
            🔄 新しいゲームを始める
          </button>
        </div>
      </div>
    </>
  );
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("start");
  const [players, setPlayers] = useState([]);
  const [holeResults, setHoleResults] = useState(Array(TOTAL_HOLES).fill(null).map(() => ({})));
  const [currentHole, setCurrentHole] = useState(1);

  const handleStart = (ps) => {
    setPlayers(ps);
    setHoleResults(Array(TOTAL_HOLES).fill(null).map(() => ({})));
    setCurrentHole(1);
    setScreen("hole");
  };

  const handleSave = (medals) => {
    const updated = [...holeResults];
    updated[currentHole - 1] = medals;
    setHoleResults(updated);
    setCurrentHole(h => h + 1);
  };

  const handlePrev = () => {
    setCurrentHole(h => h - 1);
  };

  const handleFinish = (medals) => {
    const updated = [...holeResults];
    updated[currentHole - 1] = medals;
    setHoleResults(updated);
    setScreen("result");
  };

  // ★ 修正: 結果画面から最終ホールに戻って修正できる
  const handleEdit = () => {
    setCurrentHole(TOTAL_HOLES);
    setScreen("hole");
  };

  // ★ 新しいゲーム: スタート画面に戻る（データリセット）
  const handleNewGame = () => {
    setScreen("start");
    setCurrentHole(1);
  };

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1 style={styles.title}>⛳ GOLF OLYMPICS</h1>
        <p style={styles.subtitle}>Score Tracker</p>
      </div>

      {screen === "start" && <StartView onStart={handleStart} />}
      {screen === "hole" && (
        <HoleInputView
          key={currentHole}
          players={players}
          holeResults={holeResults}
          currentHole={currentHole}
          onSave={handleSave}
          onPrev={handlePrev}
          onFinish={handleFinish}
        />
      )}
      {screen === "result" && (
        <ResultView
          players={players}
          holeResults={holeResults}
          onEdit={handleEdit}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
