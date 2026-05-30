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
  gold:   { label: "🥇 金", points: 4, color: "#F5A623", bg: "#F5A623", border: "#F5A623" },
  silver: { label: "🥈 銀", points: 3, color: "#9B9B9B", bg: "#9B9B9B", border: "#9B9B9B" },
  bronze: { label: "🥉 銅", points: 2, color: "#C47B2B", bg: "#C47B2B", border: "#C47B2B" },
  iron:   { label: "🔩 鉄", points: 1, color: "#607D8B", bg: "#607D8B", border: "#607D8B" },
};

const SPECIAL_CONFIG = {
  diamond: { label: "💎 ダイヤ", points: 5, color: "#64D4F7", bg: "rgba(100,212,247,0.15)", border: "#64D4F7" },
  saoichi: { label: "🚩 竿イチ権", bonus: 3, color: "#A78BFA", bg: "rgba(167,139,250,0.12)", border: "#A78BFA" },
  neapin:  { label: "📍 ニアピン", points: 2, color: "#34D399", bg: "rgba(52,211,153,0.12)", border: "#34D399" },
};

const MEDAL_KEYS = ["gold", "silver", "bronze", "iron"];
const TOTAL_HOLES = 18;

function emptyHoleResult() {
  return { medals: {}, diamonds: {}, saoichi: {}, neapin: null, isShort: false };
}

function normalizeHoleResult(h) {
  if (!h) return emptyHoleResult();
  if (h.medals !== undefined) return h;
  // legacy flat format: { playerId: medalKey }
  return { medals: { ...h }, diamonds: {}, saoichi: {}, neapin: null, isShort: false };
}

function calcHolePoints(playerId, hole) {
  if (!hole) return 0;
  const { medals = {}, diamonds = {}, saoichi = {}, neapin } = hole;
  let pts = 0;
  if (diamonds[playerId]) {
    pts += SPECIAL_CONFIG.diamond.points;
  } else if (medals[playerId]) {
    pts += MEDAL_CONFIG[medals[playerId]].points;
    if (saoichi[playerId]) pts += SPECIAL_CONFIG.saoichi.bonus;
  }
  if (neapin === playerId) pts += SPECIAL_CONFIG.neapin.points;
  return pts;
}

const styles = {
  app: {
    minHeight: "100vh",
    background: [
      "radial-gradient(ellipse 200% 10% at 50% 52%, rgba(255,245,200,0.28) 0%, transparent 100%)",
      "radial-gradient(ellipse 110% 60% at 40% 0%, rgba(18,82,160,0.55) 0%, transparent 80%)",
      "radial-gradient(ellipse 110% 50% at 60% 100%, rgba(14,88,26,0.65) 0%, transparent 70%)",
      "repeating-linear-gradient(90deg, rgba(0,0,0,0.045) 0px, rgba(0,0,0,0.045) 32px, transparent 32px, transparent 64px)",
      "linear-gradient(180deg, #020c1a 0%, #092d5e 22%, #0d4878 42%, #156630 57%, #0c3d18 74%, #05140a 100%)",
    ].join(", "),
    backgroundAttachment: "fixed",
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
    padding: "32px 20px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "24px",
    background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 100%)",
  },
  title: {
    fontSize: "24px",
    letterSpacing: "0.2em",
    color: "#F5A623",
    fontWeight: "bold",
    margin: 0,
    textShadow: "0 0 24px rgba(245,166,35,0.4)",
  },
  subtitle: {
    fontSize: "11px",
    color: "rgba(240,230,211,0.4)",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    marginTop: "6px",
  },
  card: {
    background: "rgba(2,10,20,0.72)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "20px",
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
    marginBottom: "10px",
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
  divider: {
    borderTop: "1px solid rgba(255,255,255,0.07)",
    margin: "16px 0",
  },
};

function specialBtn(selected, cfg) {
  return {
    padding: "8px 13px",
    borderRadius: "9px",
    border: `${selected ? 2 : 1}px solid ${selected ? cfg.border : "rgba(255,255,255,0.12)"}`,
    background: selected ? cfg.bg : "transparent",
    color: selected ? "#fff" : "rgba(240,230,211,0.4)",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "Georgia, serif",
    transition: "all 0.15s",
    fontWeight: selected ? "bold" : "normal",
    whiteSpace: "nowrap",
    boxShadow: selected ? `0 2px 10px ${cfg.border}88` : "none",
  };
}

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
  const [copied, setCopied] = useState(false);
  const url = window.location.href.split("#")[0] + "#" + roomId;
  const canShare = !!navigator.share;

  const handleShare = () => {
    if (canShare) {
      navigator.share({ title: "Golf Olympics", url });
    } else {
      navigator.clipboard?.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!visible) {
    return (
      <div style={{ position: "fixed", bottom: "16px", right: "16px", zIndex: 50 }}>
        <button
          onClick={handleShare}
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
      <p style={{ ...styles.sectionTitle, textAlign: "center", marginBottom: "16px" }}>
        📱 参加者に共有する
      </p>
      <button
        onClick={handleShare}
        style={{ ...styles.btn, ...styles.btnPrimary, marginBottom: "16px", fontSize: "16px" }}
      >
        {canShare ? "🔗 このゲームを共有" : copied ? "✅ コピーしました" : "🔗 URLをコピー"}
      </button>
      {!canShare && (
        <>
          <QRCodeSVG value={url} size={120} bgColor="transparent" fgColor="#f0e6d3" />
          <p style={{ fontSize: "22px", letterSpacing: "0.3em", color: "#F5A623", fontWeight: "bold", margin: "10px 0 4px" }}>
            {roomId}
          </p>
        </>
      )}
      <button onClick={() => setVisible(false)} style={{ ...styles.btn, ...styles.btnSecondary, padding: "8px", fontSize: "12px", marginTop: "8px" }}>
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
    scores[p.id] = holeResults.reduce((sum, h) => sum + calcHolePoints(p.id, normalizeHoleResult(h)), 0);
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
function HoleInputView({ players, holeResults, currentHole, onSave, onPrev, onFinish, onAbort }) {
  const saved = holeResults[currentHole - 1];
  const [holeData, setHoleData] = useState(() => normalizeHoleResult(saved));

  const [confirmAbort, setConfirmAbort] = useState(false);
  const { medals, diamonds, saoichi, neapin } = holeData;

  const nonDiamondPlayers = players.filter(p => !diamonds[p.id]);
  const availableMedals = getMedalKeysForCount(nonDiamondPlayers.length);

  const toggleDiamond = (pid) => {
    setHoleData(prev => {
      const wasOn = !!prev.diamonds[pid];
      const nextDiamonds = { ...prev.diamonds };
      const nextMedals = { ...prev.medals };
      if (wasOn) {
        delete nextDiamonds[pid];
      } else {
        nextDiamonds[pid] = true;
        delete nextMedals[pid];
        // ダイヤ追加で使用可能メダルが1つ減るため、範囲外になったメダルを除去
        const remaining = players.length - Object.keys(nextDiamonds).length;
        const validMedals = new Set(getMedalKeysForCount(remaining));
        Object.keys(nextMedals).forEach(id => {
          if (!validMedals.has(nextMedals[id])) delete nextMedals[id];
        });
      }
      return { ...prev, diamonds: nextDiamonds, medals: nextMedals };
    });
  };

  const toggleSaoichi = (pid) => {
    setHoleData(prev => {
      const nextSaoichi = { ...prev.saoichi };
      if (nextSaoichi[pid]) delete nextSaoichi[pid];
      else nextSaoichi[pid] = true;
      return { ...prev, saoichi: nextSaoichi };
    });
  };

  const selectMedal = useCallback((playerId, medal) => {
    setHoleData(prev => {
      const next = { ...prev.medals };
      Object.keys(next).forEach(pid => { if (next[pid] === medal) delete next[pid]; });
      if (prev.medals[playerId] === medal) delete next[playerId];
      else next[playerId] = medal;
      return { ...prev, medals: next };
    });
  }, []);

  const selectNeapin = (pid) => {
    setHoleData(prev => ({ ...prev, neapin: prev.neapin === pid ? null : pid }));
  };

  const prevTotal = (pid) =>
    holeResults.reduce((sum, h, idx) => {
      if (idx === currentHole - 1) return sum;
      return sum + calcHolePoints(pid, h);
    }, 0);

  const isLast = currentHole === TOTAL_HOLES;

  const SubTitle = ({ children, note }) => (
    <div style={{ marginTop: "16px", marginBottom: "4px" }}>
      <p style={{ ...styles.sectionTitle, marginBottom: note ? "4px" : "12px" }}>{children}</p>
      {note && <p style={{ fontSize: "11px", color: "rgba(240,230,211,0.4)", marginBottom: "10px" }}>{note}</p>}
    </div>
  );

  return (
    <div style={{ ...styles.card, maxWidth: "420px" }}>
      <div style={styles.holeInfo}>
        <div style={styles.holeNum}>{currentHole}</div>
        <div style={styles.holeLabel}>HOLE / {TOTAL_HOLES}</div>
      </div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${(currentHole / TOTAL_HOLES) * 100}%` }} />
      </div>


      <div style={styles.divider} />

      {/* Combined: medal + diamond + saoichi + neapin per player */}
      <SubTitle note="1パット→メダル選択 / チップイン→💎 / 旗竿より遠い→🚩 / ニアピン→📍">メダル割り当て</SubTitle>
      {players.map(player => {
        const isDiamond = !!diamonds[player.id];
        const isSaoichi = !!saoichi[player.id];
        const isNeapin = neapin === player.id;
        return (
          <div key={player.id} style={{ marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "7px" }}>{player.name}</div>
            {/* Medal buttons */}
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "7px" }}>
              {isDiamond ? (
                <span style={{ fontSize: "12px", color: SPECIAL_CONFIG.diamond.color, fontStyle: "italic" }}>
                  💎 ダイヤモンド（メダル対象外）
                </span>
              ) : (
                availableMedals.map(mk => {
                  const cfg = MEDAL_CONFIG[mk];
                  const selected = medals[player.id] === mk;
                  return (
                    <button
                      key={mk}
                      onClick={() => selectMedal(player.id, mk)}
                      style={{
                        padding: "8px 13px",
                        borderRadius: "9px",
                        border: `${selected ? 2 : 1}px solid ${selected ? cfg.border : "rgba(255,255,255,0.12)"}`,
                        background: selected ? cfg.bg : "transparent",
                        color: selected ? "#fff" : "rgba(240,230,211,0.5)",
                        fontSize: "13px",
                        cursor: "pointer",
                        fontFamily: "Georgia, serif",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap",
                        fontWeight: selected ? "bold" : "normal",
                        boxShadow: selected ? `0 2px 10px ${cfg.border}88` : "none",
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })
              )}
            </div>
            {/* Diamond + Saoichi + Neapin toggles */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button onClick={() => toggleDiamond(player.id)} style={specialBtn(isDiamond, SPECIAL_CONFIG.diamond)}>
                {SPECIAL_CONFIG.diamond.label}
              </button>
              <button onClick={() => toggleSaoichi(player.id)} style={specialBtn(isSaoichi, SPECIAL_CONFIG.saoichi)}>
                {SPECIAL_CONFIG.saoichi.label}
              </button>
              <button onClick={() => selectNeapin(player.id)} style={specialBtn(isNeapin, SPECIAL_CONFIG.neapin)}>
                {SPECIAL_CONFIG.neapin.label}
              </button>
            </div>
          </div>
        );
      })}

      {/* Mini scoreboard */}
      <div style={styles.miniScore}>
        {players.map(p => (
          <span key={p.id}>
            {p.name}:{" "}
            <span style={{ color: "#F5A623", fontWeight: "bold" }}>
              {prevTotal(p.id) + calcHolePoints(p.id, holeData)}pt
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
          onClick={() => isLast ? onFinish(holeData) : onSave(holeData)}
        >
          {isLast ? "結果を見る 🏆" : "次のホールへ →"}
        </button>
      </div>

      {!confirmAbort ? (
        <button
          style={{ ...styles.btn, ...styles.btnDanger, marginTop: "12px", fontSize: "13px", padding: "10px" }}
          onClick={() => setConfirmAbort(true)}
        >
          ✕ ゲームを中止してトップへ戻る
        </button>
      ) : (
        <div style={{
          marginTop: "12px",
          background: "rgba(220,80,80,0.1)",
          border: "1px solid rgba(220,80,80,0.3)",
          borderRadius: "10px",
          padding: "12px",
        }}>
          <p style={{ fontSize: "13px", color: "#ff8a8a", textAlign: "center", margin: "0 0 10px" }}>
            スコアデータはすべて消えます。本当に中止しますか？
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={{ ...styles.btn, ...styles.btnSecondary, flex: 1, fontSize: "13px", padding: "10px" }}
              onClick={() => setConfirmAbort(false)}
            >
              続ける
            </button>
            <button
              style={{ ...styles.btn, ...styles.btnDanger, flex: 1, fontSize: "13px", padding: "10px" }}
              onClick={onAbort}
            >
              中止する
            </button>
          </div>
        </div>
      )}
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

        {/* 列ヘッダー */}
        <div style={{ display: "flex", fontSize: "10px", color: "rgba(240,230,211,0.35)", marginBottom: "6px", padding: "0 4px" }}>
          <span style={{ flex: 1 }} />
          <span style={{ width: "38px", textAlign: "right" }}>獲得pt</span>
          <span style={{ width: "18px" }} />
          <span style={{ width: "42px", textAlign: "right" }}>精算pt</span>
          {rateNum > 0 && <><span style={{ width: "18px" }} /><span style={{ width: "52px", textAlign: "right" }}>精算額</span></>}
        </div>

        {/* 合計pt → 精算pt → 精算額 一行表示 */}
        {finals
          .slice()
          .sort((a, b) => b.finalScore - a.finalScore)
          .map(p => {
            const payment = p.finalScore * rateNum;
            const fg = p.finalScore > 0 ? "#50C878" : p.finalScore < 0 ? "#ff8a8a" : "rgba(240,230,211,0.4)";
            const bg = p.finalScore > 0 ? "rgba(80,200,120,0.1)" : p.finalScore < 0 ? "rgba(220,80,80,0.1)" : "rgba(255,255,255,0.04)";
            const scoreLabel = p.finalScore > 0 ? `+${p.finalScore}pt` : p.finalScore < 0 ? `${p.finalScore}pt` : "±0pt";
            const payLabel   = payment > 0 ? `+${payment.toLocaleString()}円` : payment < 0 ? `${payment.toLocaleString()}円` : "±0円";
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", padding: "8px 10px", borderRadius: "8px", marginBottom: "6px", background: bg }}>
                <span style={{ flex: 1, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                <span style={{ width: "38px", textAlign: "right", fontSize: "13px", fontWeight: "bold", color: "#F5A623" }}>{scores[p.id]}pt</span>
                <span style={{ width: "18px", textAlign: "center", fontSize: "11px", color: "rgba(240,230,211,0.25)" }}>→</span>
                <span style={{ width: "42px", textAlign: "right", fontSize: "13px", fontWeight: "bold", color: fg }}>{scoreLabel}</span>
                {rateNum > 0 && <>
                  <span style={{ width: "18px", textAlign: "center", fontSize: "11px", color: "rgba(240,230,211,0.25)" }}>→</span>
                  <span style={{ width: "52px", textAlign: "right", fontSize: "13px", fontWeight: "bold", color: fg }}>{payLabel}</span>
                </>}
              </div>
            );
          })}

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
    scores[p.id] = holeResults.reduce((sum, h) => sum + calcHolePoints(p.id, h), 0);
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
            ホール別点数を見る
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
                    <td style={{ padding: "3px 6px", color: "rgba(240,230,211,0.5)" }}>
                      {i + 1}
                    </td>
                    {players.map(p => {
                      const { medals: hm = {}, diamonds: hd = {}, saoichi: hs = {}, neapin: hn } = h;
                      const pts = calcHolePoints(p.id, h);
                      let icons = "";
                      let color = "rgba(255,255,255,0.2)";
                      if (hd[p.id]) {
                        icons = "💎";
                        color = SPECIAL_CONFIG.diamond.color;
                      } else if (hm[p.id]) {
                        const cfg = MEDAL_CONFIG[hm[p.id]];
                        icons = cfg.label.split(" ")[0] + (hs[p.id] ? "🚩" : "");
                        color = cfg.color;
                      }
                      if (hn === p.id) icons += "📍";
                      return (
                        <td key={p.id} style={{ textAlign: "center", padding: "3px 6px", color }}>
                          {pts === 0 ? "ー" : <>{pts}pt {icons}</>}
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
  const [holeResults, setHoleResults] = useState(Array(TOTAL_HOLES).fill(null).map(() => emptyHoleResult()));
  const [currentHole, setCurrentHole] = useState(1);
  const [roomId, setRoomId] = useState(null);
  const [isObserver, setIsObserver] = useState(false);
  const [observerData, setObserverData] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && /^[A-Z0-9]{6}$/.test(hash) && db) {
      joinRoom(hash);
    }
    return () => {
      if (observerRef.current) off(observerRef.current);
    };
  }, []);

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
    setHoleResults(Array(TOTAL_HOLES).fill(null).map(() => emptyHoleResult()));
    setCurrentHole(1);
    if (db) {
      const id = generateRoomId();
      setRoomId(id);
      window.history.replaceState(null, "", window.location.pathname + "#" + id);
    }
    setScreen("hole");
  };

  const handleSave = (holeData) => {
    const updated = [...holeResults];
    updated[currentHole - 1] = holeData;
    setHoleResults(updated);
    setCurrentHole(h => h + 1);
  };

  const handlePrev = () => setCurrentHole(h => h - 1);

  const handleFinish = (holeData) => {
    const updated = [...holeResults];
    updated[currentHole - 1] = holeData;
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
            onAbort={handleNewGame}
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
