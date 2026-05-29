import { useState, useCallback, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ref, set, onValue, off } from "firebase/database";
import { db } from "./firebase";

function generateRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

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

// ── RoomBanner ─────────────────────────────────────────────────
function RoomBanner({ roomId }) {
  const [visible, setVisible] = useState(true);
  const url = window.location.href.split("#")[0] + "#" + roomId;

  if (!visible) {
    return (
      <div style={{ position: "fixed", bottom: "16px", right: "16px", zIndex: 50 }}>
        <button
          onClick={() => setVisible(true)}
          style={{
            background: "rgba(245,166,35,0.9)", color: "#0a1628",
            border: "none", borderRadius: "50%", width: "48px", height: "48px",
            fontSize: "20px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >🔗</button>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(13,33,55,0.97)", border: "1px solid rgba(245,166,35,0.4)",
      borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "420px",
      boxSizing: "border-box", marginBottom: "12px", textAlign: "center",
    }}>
      <p style={{ ...styles.sectionTitle, textAlign: "center", marginBottom: "12px" }}>
        📱 QRでリアルタイム観戦
      </p>
      <QRCodeSVG value={url} size={140} bgColor="transparent" fgColor="#f0e6d3" />
      <p style={{ fontSize: "26px", letterSpacing: "0.35em", color: "#F5A623", fontWeight: "bold", margin: "12px 0 4px" }}>
        {roomId}
      </p>
      <p style={{ fontSize: "11px", color: "rgba(240,230,211,0.4)", marginBottom: "12px" }}>
        このコードを参加者に共有してください
      </p>
      <button onClick={() => setVisible(false)} style={{ ...styles.btn, ...styles.btnSecondary, padding: "8px", fontSize: "12px" }}>
        閉じる
      </button>
    </div>
  );
}

// ── ObserverView ────────────────────────────────────────────────
function ObserverView({ data, roomId }) {
  if (!data) {
    return (
      <div style={{ ...styles.card, maxWidth: "380px", textAlign: "center", padding: "40px 20px" }}>
        <p style={{ fontSize: "24px", marginBottom: "12px" }}>⏳</p>
        <p style={{ color: "rgba(240,230,211,0.5)", letterSpacing: "0.1em" }}>接続中...</p>
        <p style={{ fontSize: "11px", color: "rgba(240,230,211,0.3)", marginTop: "8px" }}>ルーム: {roomId}</p>
      </div>
    );
  }

  const { players, holeResults: raw, currentHole, status } = data;
  const holeResults = Array.isArray(raw)
    ? raw
    : Array.from({ length: TOTAL_HOLES }, (_, i) => raw[i] || {});

  const scores = {};
  players.forEach(p => {
    scores[p.id] = holeResults.reduce((sum, h) => {
      const m = h && h[p.id];
      return sum + (m ? MEDAL_CONFIG[m].points : 0);
    }, 0);
  });

  const sorted = players.slice().sort((a, b) => scores[b.id] - scores[a.id]);
  let rank = 1;
  const ranked = sorted.map((p, i) => {
    if (i > 0 && scores[p.id] < scores[sorted[i - 1].id]) rank = i + 1;
    return { ...p, rank };
  });

  const finished = status === "finished";

  return (
    <div style={{ ...styles.card, maxWidth: "380px" }}>
      <p style={{ ...styles.sectionTitle, textAlign: "center", fontSize: "15px" }}>
        {finished ? "🏆 最終結果" : `⛳ ${currentHole}H 進行中`}
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
      <p style={{ fontSize: "11px", color: "rgba(240,230,211,0.25)", textAlign: "center", marginTop: "16px" }}>
        ルーム: {roomId} · リアルタイム更新中
      </p>
    </div>
  );
}

// ── StartView ──────────────────────────────────────────────────
function StartView({ onStart, onJoin }) {
  const [count, setCount] = useState(4);
  const [names, setNames] = useState(["", "", "", ""]);
  const [joinCode, setJoinCode] = useState("");

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

      {db && (
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(245,166,35,0.1)" }}>
          <p style={styles.sectionTitle}>ルームコードで参加</p>
          <input
            style={styles.input}
            placeholder="例: ABC123"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            maxLength={6}
          />
          <button
            style={{ ...styles.btn, ...styles.btnSecondary, opacity: joinCode.length !== 6 ? 0.4 : 1 }}
            onClick={() => onJoin(joinCode)}
            disabled={joinCode.length !== 6}
          >
            👁 観戦モードで参加
          </button>
        </div>
      )}
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
  const [roomId, setRoomId] = useState(null);
  const [isObserver, setIsObserver] = useState(false);
  const [observerData, setObserverData] = useState(null);
  const observerRef = useRef(null);

  // URLハッシュにルームIDがあれば自動で観戦モードに入る
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && /^[A-Z0-9]{6}$/.test(hash) && db) {
      joinRoom(hash);
    }
    return () => {
      if (observerRef.current) off(observerRef.current);
    };
  }, []);

  // ゲーム状態をFirebaseに同期（ホスト側）
  useEffect(() => {
    if (!db || !roomId || isObserver) return;
    set(ref(db, `rooms/${roomId}`), {
      players,
      holeResults,
      currentHole,
      status: screen === "result" ? "finished" : "playing",
    });
  }, [players, holeResults, currentHole, screen, roomId, isObserver]);

  const joinRoom = (code) => {
    if (!db) return;
    if (observerRef.current) off(observerRef.current);
    const roomRef = ref(db, `rooms/${code}`);
    observerRef.current = roomRef;
    setIsObserver(true);
    setScreen("observe");
    onValue(roomRef, (snapshot) => {
      setObserverData(snapshot.val());
    });
    window.history.replaceState(null, "", window.location.pathname + "#" + code);
  };

  const handleStart = (ps) => {
    setPlayers(ps);
    setHoleResults(Array(TOTAL_HOLES).fill(null).map(() => ({})));
    setCurrentHole(1);
    if (db) {
      const id = generateRoomId();
      setRoomId(id);
      window.history.replaceState(null, "", window.location.pathname + "#" + id);
    }
    setScreen("hole");
  };

  const handleSave = (medals) => {
    const updated = [...holeResults];
    updated[currentHole - 1] = medals;
    setHoleResults(updated);
    setCurrentHole(h => h + 1);
  };

  const handlePrev = () => setCurrentHole(h => h - 1);

  const handleFinish = (medals) => {
    const updated = [...holeResults];
    updated[currentHole - 1] = medals;
    setHoleResults(updated);
    setScreen("result");
  };

  const handleEdit = () => {
    setCurrentHole(TOTAL_HOLES);
    setScreen("hole");
  };

  const handleNewGame = () => {
    if (observerRef.current) off(observerRef.current);
    setScreen("start");
    setCurrentHole(1);
    setRoomId(null);
    setIsObserver(false);
    setObserverData(null);
    observerRef.current = null;
    window.history.replaceState(null, "", window.location.pathname);
  };

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1 style={styles.title}>⛳ GOLF OLYMPICS</h1>
        <p style={styles.subtitle}>Score Tracker</p>
      </div>

      {screen === "observe" && (
        <ObserverView
          data={observerData}
          roomId={window.location.hash.slice(1)}
        />
      )}
      {screen === "start" && <StartView onStart={handleStart} onJoin={joinRoom} />}
      {screen === "hole" && (
        <>
          {roomId && <RoomBanner roomId={roomId} />}
          <HoleInputView
            key={currentHole}
            players={players}
            holeResults={holeResults}
            currentHole={currentHole}
            onSave={handleSave}
            onPrev={handlePrev}
            onFinish={handleFinish}
          />
        </>
      )}
      {screen === "result" && (
        <>
          {roomId && <RoomBanner roomId={roomId} />}
          <ResultView
            players={players}
            holeResults={holeResults}
            onEdit={handleEdit}
            onNewGame={handleNewGame}
          />
        </>
      )}
    </div>
  );
}
