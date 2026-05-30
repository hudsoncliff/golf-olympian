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
- `joinCode: String` — 観戦参加用ルームコード入力

**UI要素**
- 人数選択ボタン（2 / 3 / 4 の3択）
- 名前入力フィールド × playerCount
- 「ゲーム開始 ⛳」ボタン
- 「ルームコードで参加」セクション（6文字入力 → 「👁 観戦モードで参加」ボタン）

**遷移**
- 「ゲーム開始」→ Firebase ルーム作成 → HoleInputView（hole: 1）へ
- 「観戦モードで参加」→ Firebase を購読 → ObserverView へ

---

### 2. HoleInputView（ホール入力画面）

**状態**
- `draft: HoleResult` — 現ホールの入力内容（ホール移動時は保存済みデータを復元、なければ空）

**UI要素（上から順）**

1. **ヘッダー（AppHeader）** — 右上に「共有ボタン」（roomIdがある場合のみ）
2. **ホール番号・プログレスバー**
3. **プレイヤーごとのブロック**（全プレイヤー分、区切り線あり）
   - プレイヤー名
   - **メダルボタン行**（ダイヤ未選択時のみ表示）
     - 表示するメダル種類 = `getMedalKeys(totalPlayers - diamondCount)`
     - 同じメダルは1人のみ（排他制御）、再タップで解除
     - ダイヤ選択中は「💎 ダイヤモンド（メダル対象外）」ラベルを表示
   - **特殊オプション行**（3ボタン、常に表示）
     - `💎 ダイヤ` — トグル。ONにするとそのプレイヤーのメダルを消去し、範囲外になった他プレイヤーのメダルも除去
     - `🚩 竿イチ権` — トグル。点数反映は1パット成功時のみ
     - `📍 ニアピン` — ラジオ（1ホール1人のみ）。再タップで解除
4. **ミニスコアボード** — 全プレイヤーの現在ホールを含む累計点をリアルタイム表示
5. **ナビゲーションボタン**
   - 「← 戻る」（hole > 1 の時のみ） → currentHole - 1
   - 「次のホールへ →」（hole < 18） / 「結果を見る 🏆」（hole = 18）
6. **「✕ ゲームを中止する」** — 確認アラート後にスタート画面へ戻る

**右上共有ボタン（ShareButton）**
- roomId がある場合のみ表示
- タップ → ShareModalView をハーフシートで表示
  - ルームコード（大きく表示）
  - 「このゲームを共有」ボタン（ShareLink で URL を共有）
  - Web 観戦 URL: `https://hudsoncliff.github.io/golf-olympian/#{roomId}`

**ホール遷移時の動作**
- 「次のホールへ」→ holeData 保存 → Firebase 同期 → currentHole + 1
- 「← 戻る」→ holeData 保存 → Firebase 同期 → currentHole - 1
- 「結果を見る」→ holeData 保存 → Firebase 同期（finished: true）→ ResultView へ

---

### 3. ResultView（結果画面）

**表示内容**

1. **最終順位** — 合計点の高い順。同点は同順位
2. **ホール別点数（折りたたみ）**
   - セル形式: `{点数}pt {アイコン}` / 0点は「ー」
   - アイコン例: `4pt 🥇`、`5pt 💎`、`7pt 🥇🚩`、`2pt 📍`
3. **精算点** — `自分のpt × (人数-1) - 他全員のptの合計`
4. **アクションボタン**
   - 「💴 レート計算・集計」→ RateSheet をシートで表示
   - 「✏️ スコアを修正する」→ currentHole = 18 に設定して HoleInputView に戻る
   - 「🔄 新しいゲームを始める」→ Firebase ルーム削除 → StartView へ

---

### 4. RateSheet（レート計算シート）

**状態**
- `rateText: String` — 1ptあたりの金額（円）入力

**UI要素**
- レート入力（数値キーボード）
- 統合テーブル（レート未入力時は2列、入力後は3列に展開）

```
        獲得pt   精算pt   精算額
Alice    8pt  →  +3pt  →  +300円
Bob      5pt  →  ±0pt  →   ±0円
Carol    3pt  →  -3pt  →  -300円
```

- 行の背景色：精算pt のプラス/マイナスで緑/赤に色分け

---

### 5. ObserverView（観戦画面）

Firebase からリアルタイムでデータを受信して表示。

**表示内容**
- 進行中ホール番号 or 「🏆 最終結果」
- 全プレイヤーのリアルタイムスコア（順位順）
- 「退出する」ボタン → StartView へ

---

## データモデル

```swift
struct Player: Identifiable, Hashable, Codable {
    let id: UUID
    var name: String
}

enum Medal: Int, CaseIterable, Codable, Identifiable {
    case gold = 4, silver = 3, bronze = 2, iron = 1

    var label: String { ... }
    var emoji: String { ... }
    var color: Color { ... }

    // Firebase エンコード用
    var key: String { ... }
    static func from(key: String) -> Medal? { ... }

    static func keys(for count: Int) -> [Medal] // 上位 count 個を返す
}

struct HoleResult: Codable {
    let holeNumber: Int
    var medals:   [UUID: Medal]
    var diamonds: Set<UUID>
    var saoichi:  Set<UUID>
    var neapin:   UUID?

    func points(for playerID: UUID) -> Int
    func availableMedals(playerCount: Int) -> [Medal]

    // ダイヤ追加時は自プレイヤーのメダル消去＋範囲外メダルを全員から除去
    mutating func toggleDiamond(for playerID: UUID, playerCount: Int)
    mutating func toggleSaoichi(for playerID: UUID)
    mutating func selectMedal(_ medal: Medal, for playerID: UUID)
    mutating func selectNeapin(for playerID: UUID)
}

@Observable
class GameSession {
    var players:     [Player]
    var holeResults: [HoleResult]  // index 0 = hole 1
    var currentHole: Int

    func totalScore(for playerID: UUID) -> Int
    func finalScore(for playerID: UUID) -> Int   // 精算点
    func rankedPlayers() -> [(player: Player, score: Int, rank: Int)]
    func setup(players: [Player])
}
```

---

## Firebase リアルタイム共有

### FirebaseSync（`@Observable` class）

```swift
class FirebaseSync {
    var roomId:    String?       // ホスト時: 生成したID、観戦時: 参加したID
    var snapshot:  RoomSnapshot? // 観戦時のリアルタイムデータ
    var isObserver: Bool

    func startHosting(session: GameSession) -> String  // ルーム生成
    func push(session: GameSession, finished: Bool)    // ホールごとに同期
    func stopHosting()
    func startObserving(roomId: String)
    func stopObserving()
}
```

### Firebase データ構造

```json
rooms/{roomId}: {
  "players": [{"id": "uuid", "name": "Alice"}],
  "holeResults": [
    {
      "holeNumber": 1,
      "medals":   {"uuid": "gold"},
      "diamonds": ["uuid"],
      "saoichi":  ["uuid"],
      "neapin":   "uuid"
    }
  ],
  "currentHole": 5,
  "status": "playing" | "finished"
}
```

### 同期タイミング（ホスト側）
- ゲーム開始時
- ホールを進める／戻るたび（`onHoleSaved` コールバック）
- 最終ホール完了時（`finished: true`）

---

## ファイル構成（実装済み）

```
GolfOlympicsiOSApp/GolfOlympics/
├── GolfOlympicsApp.swift      ← @main / FirebaseApp.configure()
├── ContentView.swift          ← 画面ルーター（start/hole/result/observe）
├── AppColors.swift            ← Color定数・ButtonStyle・ViewModifier
├── Player.swift
├── Medal.swift
├── HoleResult.swift
├── GameSession.swift          ← @Observable
├── FirebaseSync.swift         ← Firebase Realtime Database 読み書き
├── StartView.swift
├── HoleInputView.swift
├── PlayerHoleRow.swift        ← 1プレイヤー分のメダル+特殊ボタン
├── ShareBannerView.swift      ← ShareButton + ShareModalView
├── ObserverView.swift         ← 観戦画面
├── ResultView.swift
├── HoleDetailTable.swift      ← 折りたたみ式ホール別点数表
└── RateSheet.swift            ← レート計算シート
```

---

## 状態管理の方針

- `GameSession`・`FirebaseSync` は `ContentView` が `@State` で所有
- 画面切り替えは `AppScreen` enum のスイッチ（NavigationStack は不使用）
- `HoleResult` は `draft` として HoleInputView がローカル保持し、ナビゲーション時に `session.holeResults` へ保存
- 「← 戻る」は pop ではなく `currentHole -= 1` で同一 View 内でホール番号を変える

---

## 実装上の注意点

### メダルの排他制御
同じメダルは1人のみ。選択時に他プレイヤーの同一メダルを除去してから割り当てる（再タップで解除）。

### ダイヤとメダルの連動
ダイヤ ON 時：
1. 自プレイヤーのメダルを消去
2. 使用可能メダル数が1減るため、**範囲外になったメダルを他プレイヤーからも除去**
   - 例）4人→1人ダイヤ：鉄が範囲外 → 鉄を持つプレイヤーのメダルをリセット

### ニアピンは1ホール1人
再タップで解除。別プレイヤーをタップすると自動的に移動。

### 竿イチ権のみは無得点
竿イチ権があっても、メダルを取得していなければボーナス点はつかない。

### スコア修正フロー
結果画面 → 「スコアを修正する」→ currentHole = 18 で HoleInputView に戻る。
← 戻るで 17, 16... と遡れる。修正後「次のホールへ」で進み、18H で「結果を見る」。

### ゲーム中止フロー
HoleInputView 下部の「✕ ゲームを中止する」→ 確認アラート → Firebase ルームを削除して StartView へ。

---

## 未実装（バックログ）

- [ ] ラウンド履歴の保存（SwiftData）
- [ ] 9ホール対応
- [ ] 点数配分のカスタマイズ
- [ ] 同点時のタイブレーク処理
- [ ] レート設定の保存
