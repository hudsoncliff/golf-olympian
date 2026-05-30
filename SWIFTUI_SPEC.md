# Golf Olympics — SwiftUI 実装仕様書

Reactプロトタイプの現行動作を元に記述。実装の正とする。

---

## ゲームルール

### 基本ルール

- **形式**：マイホール（ホールごとに独立した勝負）
- **人数**：2〜4人
- **ホール数**：18ホール固定

### メダル

グリーンオン後、ピンから遠い順に金〜鉄を割り当てる。
**1パットで沈めたプレイヤーのみ**そのホールの点数を獲得。

| メダル | 点数 | 人数制限 |
|--------|------|----------|
| 🥇 金  | 4pt  | 常に使用 |
| 🥈 銀  | 3pt  | 常に使用 |
| 🥉 銅  | 2pt  | 3人以上  |
| 🔩 鉄  | 1pt  | 4人のみ  |

使用メダル数 ＝ プレイヤー数 − ダイヤ取得者数。

### スペシャルオプション

| オプション | 点数 | 条件 | 排他 |
|-----------|------|------|------|
| 💎 ダイヤ  | 5pt  | グリーン外からチップイン | メダルと排他（ダイヤ選択者はメダル対象外） |
| 🚩 竿イチ権 | +3pt | ボールとカップの距離が旗竿より長い | メダルに加算。メダルなしの場合は無効 |
| 📍 ニアピン | 2pt  | グリーンオン後、最もカップに近い | 1ホールにつき1人のみ選択可 |

### 得点計算（1ホール・1プレイヤー）

```
points = 0

if ダイヤ選択:
    points += 5
else if メダル取得:
    points += メダル点数（1〜4）
    if 竿イチ権あり:
        points += 3

if ニアピン選択:
    points += 2
```

---

## 画面仕様

### 1. StartView（スタート画面）

**状態**
- `playerCount: Int` — 2〜4（初期値: 4）
- `names: [String]` — playerCount分の名前（空欄時は "Player N" で補完）

**UI要素**
- 人数選択ボタン（2 / 3 / 4 の3択、タップで切り替え）
- 名前入力フィールド × playerCount
- 「ゲーム開始」ボタン

**遷移**
- 「ゲーム開始」タップ → Player配列を生成 → HoleInputView（hole: 1）へ

---

### 2. HoleInputView（ホール入力画面）

**状態**
- `currentHole: Int` — 1〜18
- `holeData: HoleResult` — 現ホールの入力内容（ホール移動時は保存済みデータを復元、なければ空）

**UI要素（上から順）**

1. **ホール番号** — 大きく表示（例: "5"）、"HOLE / 18"
2. **プログレスバー** — currentHole / 18 の割合で塗りつぶし
3. **プレイヤーごとのブロック**（全プレイヤー分、区切り線あり）
   - プレイヤー名
   - **メダルボタン行**（ダイヤ未選択時のみ表示）
     - 表示するメダル種類 = `getMedalKeys(totalPlayers - diamondCount)`
     - 同じメダルは1人にしか割り当てられない（タップで排他制御）
     - 選択中は再タップで解除
     - ダイヤ選択中は代わりに「💎 ダイヤモンド（メダル対象外）」のラベルを表示
   - **特殊オプション行**（3ボタン、常に表示）
     - `💎 ダイヤ` — トグル。ONにするとこのプレイヤーのメダルを消去
     - `🚩 竿イチ権` — トグル。点数反映は1パット成功時のみ
     - `📍 ニアピン` — ラジオ（1ホール1人のみ）。再タップで解除
4. **ミニスコアボード** — 全プレイヤーの現在ホールを含む累計点をリアルタイム表示
5. **ナビゲーションボタン**
   - 「← 戻る」（hole > 1 の時のみ表示） → currentHole - 1
   - 「次のホールへ →」（hole < 18） / 「結果を見る 🏆」（hole = 18）

**ホール遷移時の動作**
- 「次のホールへ」タップ → 現ホールのholeDataを保存 → currentHole + 1
- 「← 戻る」タップ → currentHole - 1（データは保存済みのものを復元）
- ホールが変わるたびholeDataをリセット（そのホールの保存済みデータがあれば復元）

---

### 3. ResultView（結果画面）

**表示内容**

1. **最終順位** — 合計点の高い順に表示。同点は同順位
2. **ホール別点数（折りたたみ）**
   - 列: H（ホール番号） + プレイヤー名×N
   - セル: `{点数}pt {アイコン}` 形式 / 0点は「ー」
   - アイコン例: `4pt 🥇`、`5pt 💎`、`7pt 🥇🚩`、`2pt 📍`、`6pt 🥇🚩📍`
3. **精算点** — `自分のpt × (人数-1) - 他全員のptの合計`
4. **アクションボタン**
   - 「💴 レート計算・集計」→ RateModal を表示
   - 「✏️ スコアを修正する」→ HoleInputView（hole: 18）に戻る。← 戻るで任意ホールまで遡れる
   - 「🔄 新しいゲームを始める」→ StartView に戻り、全データリセット

---

### 4. RateModal（レート計算）

**状態**
- `rate: Int?` — 1ptあたりの金額（円）

**UI要素**
- レート入力（テキストフィールド、数値のみ）
- ポイント集計一覧（順位順）
- rate入力済みの場合：精算金額一覧
  - `精算額 = 精算点 × rate`
  - プラスは受け取り（緑）、マイナスは支払い（赤）

---

## データモデル

```swift
struct Player: Identifiable, Codable {
    let id: UUID
    var name: String
}

enum Medal: Int, CaseIterable, Codable {
    case gold   = 4  // 🥇
    case silver = 3  // 🥈
    case bronze = 2  // 🥉
    case iron   = 1  // 🔩

    var label: String {
        switch self {
        case .gold:   return "🥇 金"
        case .silver: return "🥈 銀"
        case .bronze: return "🥉 銅"
        case .iron:   return "🔩 鉄"
        }
    }
}

struct HoleResult: Codable {
    let holeNumber: Int           // 1〜18
    var medals:   [UUID: Medal]   // 1パット成功プレイヤー → メダル
    var diamonds: Set<UUID>       // ダイヤ取得プレイヤー（メダル無効）
    var saoichi:  Set<UUID>       // 竿イチ権保有プレイヤー
    var neapin:   UUID?           // ニアピン取得プレイヤー（1人のみ）

    static func empty(hole: Int) -> HoleResult {
        HoleResult(holeNumber: hole, medals: [:], diamonds: [], saoichi: [], neapin: nil)
    }

    func points(for playerID: UUID) -> Int {
        var pts = 0
        if diamonds.contains(playerID) {
            pts += 5
        } else if let medal = medals[playerID] {
            pts += medal.rawValue
            if saoichi.contains(playerID) { pts += 3 }
        }
        if neapin == playerID { pts += 2 }
        return pts
    }
}

@Observable
class GameSession {
    var players: [Player] = []
    var holeResults: [HoleResult] = []   // index 0 = hole 1
    var currentHole: Int = 1

    func totalScore(for playerID: UUID) -> Int {
        holeResults.reduce(0) { $0 + $1.points(for: playerID) }
    }

    func finalScore(for playerID: UUID) -> Int {
        let myPts = totalScore(for: playerID)
        let n = players.count
        let total = players.reduce(0) { $0 + totalScore(for: $1.id) }
        return myPts * (n - 1) - (total - myPts)
    }

    func availableMedals() -> [Medal] {
        // 現ホールのダイヤ取得者数に応じて使用メダルを決定
        let diamondCount = (holeResults.last?.diamonds.count ?? 0)
        let count = max(0, players.count - diamondCount)
        return Array(Medal.allCases.reversed().prefix(count))
        // allCases が iron→bronze→silver→gold の順なら reverse で gold→... になる
    }

    func sorted() -> [(player: Player, rank: Int)] {
        let scores = players.map { ($0, totalScore(for: $0.id)) }
        let sorted = scores.sorted { $0.1 > $1.1 }
        var rank = 1
        return sorted.enumerated().map { i, pair in
            if i > 0 && pair.1 < sorted[i-1].1 { rank = i + 1 }
            return (pair.0, rank)
        }
    }
}
```

---

## ファイル構成（推奨）

```
GolfOlympics/
├── GolfOlympicsApp.swift
├── Models/
│   ├── Player.swift
│   ├── Medal.swift
│   ├── HoleResult.swift
│   └── GameSession.swift        ← @Observable class
├── Views/
│   ├── StartView.swift
│   ├── HoleInputView.swift
│   │   └── PlayerHoleRow.swift  ← 各プレイヤー行のサブビュー
│   ├── ResultView.swift
│   │   ├── HoleDetailTable.swift
│   │   └── RateModal.swift
│   └── MiniScoreboard.swift     ← ホール画面下部のスコア帯
└── Helpers/
    └── MedalConfig.swift        ← 色・ラベル定数
```

---

## 状態管理の方針

- `GameSession` を `@Observable` class で保持し、`@State` で StartView が所有
- `NavigationStack` + `navigationDestination` でホール画面・結果画面へ遷移
- `HoleResult` は `GameSession.holeResults` の配列で管理（index = hole番号 - 1）
- 「← 戻る」は NavigationStack の pop ではなく `currentHole -= 1` で実装
  （スタックを積まずに同一Viewでホール番号だけ変える）

---

## 実装上の注意点

### メダルの排他制御
同じメダルは1人にしか割り当てられない。あるプレイヤーにメダルAを選んだとき、
他のプレイヤーがすでにメダルAを持っていれば、そちらを外してから割り当てる。

### ダイヤとメダルの連動
ダイヤをONにした瞬間、そのプレイヤーのメダルを削除する。
使用可能メダル数が1減るため、他プレイヤーのメダルボタン表示も即時更新が必要。

### ニアピンは1ホール1人
同じプレイヤーを再タップで解除。別プレイヤーをタップすると自動的に移動。

### 竿イチ権のみは無得点
竿イチ権があっても、メダルを取得していなければボーナス点はつかない（UIでは選択可能）。

### スコア修正フロー
結果画面 → 「スコアを修正」→ HoleInputView（currentHole = 18）
← 戻るで 17, 16... と遡れる。修正後「次のホールへ」で進み、18Hで「結果を見る」で戻る。

---

## 未実装（バックログ）

- [ ] ラウンド履歴の保存（SwiftData）
- [ ] 9ホール対応
- [ ] 点数配分のカスタマイズ
- [ ] 同点時のタイブレーク処理
- [ ] レート設定の保存
