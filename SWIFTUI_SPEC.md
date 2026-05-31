# ONIGIRI — SwiftUI 実装仕様書

アプリ名：**ONIGIRI**（旧：Golf Olympics）  
実装の正はコードとする。本ドキュメントは設計意図と注意点を補足するもの。

---

## ゲームルール

### 基本ルール

- **形式**：マイホール（ホールごとに独立した勝負）
- **人数**：2〜4人
- **ホール数**：18ホール固定

### メダル

グリーンオン後、ピンから遠い順に金〜鉄を割り当てる。
**1パットで沈めたプレイヤーのみ**そのホールの点数を獲得。

| メダル | デフォルト点数 | 人数制限 |
|--------|------|----------|
| 🥇 金  | 4pt  | 常に使用 |
| 🥈 銀  | 3pt  | 常に使用 |
| 🥉 銅  | 2pt  | 3人以上  |
| 🪨 鉄  | 1pt  | 4人のみ  |

使用メダル数 ＝ プレイヤー数 − ダイヤ取得者数。  
各メダルの点数は設定画面でカスタマイズ可能（`PointConfig`）。

### スペシャルオプション

| オプション | デフォルト点数 | 条件 | 排他 |
|-----------|------|------|------|
| 💎 ダイヤ  | 5pt  | グリーン外からチップイン | メダルと排他（ダイヤ選択者はメダル対象外） |
| 🚩 竿イチ権 | +3pt | ボールとカップの距離が旗竿より長い | メダルに加算。メダルなしの場合は無効 |
| 📍 ニアピン | 2pt  | グリーンオン後、最もカップに近い | 1ホールにつき1人のみ選択可 |

各オプションの点数も設定画面でカスタマイズ可能。

### 得点計算（1ホール・1プレイヤー）

```
points = 0

if ダイヤ選択:
    points += PointConfig.diamond
else if メダル取得:
    points += PointConfig.medalPoints(medal)
    if 竿イチ権あり:
        points += PointConfig.saoichiBonus

if ニアピン選択:
    points += PointConfig.neapin
```

---

## 画面仕様

### AppScreen enum

```swift
enum AppScreen: Equatable {
    case home, roundSetup, hole, result, rate, observe, settings
}
```

---

### 1. HomeView（ホーム画面）

アプリ起動時の初期画面。

**UI要素**
- ユーザー名があれば「こんにちは、〇〇さん」を表示
- 「ラウンド開始」ボタン → `.roundSetup`
- 「設定」ボタン → `.settings`
- ルームコード入力 + 「👁 観戦モードで参加」→ `.observe`

---

### 2. RoundSetupView（ラウンド設定画面）

**状態**
- `playerCount: Int` — 2〜4（初期値: 4）
- `names: [String]` — playerCount分の名前（空欄時は "Player N" で補完）
- Player 1 の初期値は `AppSettings.userName`

**UI要素**
- 人数選択ボタン（2 / 3 / 4 の3択）
- 名前入力フィールド × playerCount
- 「ゲーム開始 ⛳」ボタン → Firebase ルーム作成 → `.hole`
- 「← 戻る」ボタン → `.home`

---

### 3. HoleInputView（ホール入力画面）

**状態**
- `draft: HoleResult` — 現ホールの入力内容
- `showHolePopup: Bool` — ホール遷移ポップアップ表示フラグ

**UI要素（上から順）**

1. **コンパクトヘッダー**（AppHeader なし）
   - ホール番号（大きく） + プログレスバー（1行に収める）
   - 右上に共有ボタン（固定オーバーレイ、スクロールに追従しない）
2. **プレイヤーごとのブロック**（全プレイヤー分、区切り線あり）
   - プレイヤー名
   - **メダルボタン行**（ダイヤ未選択時のみ）
     - 表示するメダル種類 = `getMedalKeys(totalPlayers - diamondCount)`
     - 同じメダルは1人のみ（排他制御）、再タップで解除
     - ダイヤ選択中は「💎 ダイヤモンド（メダル対象外）」ラベルを表示
   - **特殊オプション行**（3ボタン、常に表示）
     - `💎 ダイヤ` — トグル。ONにするとそのプレイヤーのメダルを消去し、範囲外になった他プレイヤーのメダルも除去
     - `🚩 竿イチ権` — トグル。点数反映は1パット成功時のみ
     - `📍 ニアピン` — ラジオ（1ホール1人のみ）。再タップで解除
3. **ミニスコアボード** — 現在ホール含む累計点をリアルタイム表示
4. **ナビゲーションボタン**
   - 「← 戻る」（hole > 1 のみ）
   - 「次のホールへ →」/ 「結果を見る 🏆」（hole 18）
5. **「✕ ゲームを中止する」** — 確認アラート後にホーム画面へ

**ホール遷移アニメーション（B エフェクト）**
- 「次のホールへ」「← 戻る」タップ時に「HOLE X」が画面中央にポップアップ
- スケールアニメーションで出現し、0.5秒後に消える

**右上共有ボタン（ShareButton）**
- ScrollView の外側オーバーレイとして固定表示（スクロール追従しない）
- タップ → ShareModalView を `.large` シートで表示
  - ルームコード（大きく表示）
  - QR コード（CoreImage で生成、Web観戦 URL をエンコード）
  - 「このゲームを共有」ボタン（ShareLink）
  - Web 観戦 URL: `https://hudsoncliff.github.io/golf-olympian/#{roomId}`

**Firebase リアルタイム同期**
- `draft` が変わるたびに `.onChange(of: draft)` → `onDraftChanged` → `pushWithDraft()` を呼び即時同期
- ホール移動時（`onHoleSaved`）にも `push()` を呼ぶ

---

### 4. ResultView（結果画面）

**表示内容**

1. **最終順位** — 合計点の高い順。同点は同順位
   - 1位：🥇、2位：🥈、3位：🥉、4位以降：`medal.fill` SF Symbol（鉄カラー）
2. **ホール別点数（折りたたみ）**
   - セル形式: `{点数}pt {アイコン}` / 0点は「ー」
3. **精算点** — `自分のpt × (人数-1) - 他全員のptの合計`
4. **アクションボタン**
   - 「💴 レート計算・集計」→ `.rate`（画面遷移）
   - 「✏️ スコアを修正する」→ currentHole = 18 に設定して `.hole` に戻る

---

### 5. RateView（レート計算画面）

モーダルシートではなく通常の画面遷移。`ScreenHeader` を使用。

**状態**
- `rateText: String` — レート入力（初期値: `AppSettings.defaultRate`）
- `currencyUnit: String` — `AppSettings.currencyUnit` を読み込み

**UI要素**
- `ScreenHeader(title: "💴 レート計算", onBack:)` — 左に戻る矢印
- レート入力フィールド（ラベルに通貨単位を反映: 「1ポイントあたりのレート（ペリカ）」）
- 統合テーブル（レート未入力時は2列、入力後は3列に展開）

```
        獲得pt   精算pt   精算額(ペリカ)
Alice    8pt  →  +3pt  →  +800ペリカ
Bob      5pt  →  ±0pt  →  ±0ペリカ
```

- 行の背景色：精算pt のプラス/マイナスで緑/赤に色分け
- 「ゲームを終了する」ボタン（DangerButtonStyle）
  - タップ → 確認アラート「スコアデータは保存されません。」
  - 確定 → Firebase ルーム削除 → `.home`

---

### 6. SettingsView（設定画面）

`ScreenHeader` + 「保存して戻る」ボタン。

**セクション：ユーザー情報**
- 名前（自由入力）→ `AppSettings.userName`
- デフォルトレート（数値）→ `AppSettings.defaultRate`（初期値: 100）
- 通貨単位（自由入力）→ `AppSettings.currencyUnit`（初期値: 「円」）
  - プレースホルダー: 「例：ペリカ、ドル、石」
  - 補足: 「レート計算画面の精算額に表示されます（例：ペリカ、ドル、石）」

**セクション：メダルポイント**
- 🥇 金 / 🥈 銀 / 🥉 銅 / 🪨 鉄 の各点数を Stepper で設定（0〜20）

**セクション：オプション**
- 💎 ダイヤ / 🚩 竿イチボーナス / 📍 ニアピン の各点数を Stepper で設定

**セクション：ルール説明**
- 各メダル・オプションのルールを参照できる折りたたみなしのリスト

**保存タイミング**
- 「保存して戻る」ボタンタップ時に `AppSettings` に書き込み
- 設定した点数は次のラウンド開始時に `GameSession.setup(config:)` で反映

---

### 7. ObserverView（観戦画面）

Firebase からリアルタイムでデータを受信して表示。

**表示内容**
- 進行中ホール番号 or 「🏆 最終結果」
- 全プレイヤーのリアルタイムスコア（順位順）
- 「退出する」ボタン → `.home`

---

## データモデル

```swift
// ユーザー設定（UserDefaults 永続化）
enum AppSettings {
    static var userName:     String      // デフォルト: ""
    static var defaultRate:  Int         // デフォルト: 100
    static var currencyUnit: String      // デフォルト: "円"
    static var pointConfig:  PointConfig // JSON エンコードして保存
}

// ポイント設定
struct PointConfig: Codable {
    var gold         = 4   // 🥇
    var silver       = 3   // 🥈
    var bronze       = 2   // 🥉
    var iron         = 1   // 🪨
    var diamond      = 5   // 💎
    var saoichiBonus = 3   // 🚩
    var neapin       = 2   // 📍

    func medalPoints(_ medal: Medal) -> Int
}

struct Player: Identifiable, Hashable, Codable {
    let id: UUID
    var name: String
}

enum Medal: Int, CaseIterable, Codable, Identifiable {
    case gold = 4, silver = 3, bronze = 2, iron = 1

    var label: String  // 例: "🪨 鉄"
    var emoji: String  // 例: "🪨"
    var color: Color
    var key:   String  // Firebase エンコード用: "gold" / "silver" / "bronze" / "iron"
    static func from(key: String) -> Medal?
    static func keys(for count: Int) -> [Medal]
}

struct HoleResult: Codable, Equatable {
    let holeNumber: Int
    var medals:   [UUID: Medal]
    var diamonds: Set<UUID>
    var saoichi:  Set<UUID>
    var neapin:   UUID?

    func points(for playerID: UUID, config: PointConfig = PointConfig()) -> Int
    func availableMedals(playerCount: Int) -> [Medal]
    mutating func toggleDiamond(for playerID: UUID, playerCount: Int)
    mutating func toggleSaoichi(for playerID: UUID)
    mutating func selectMedal(_ medal: Medal, for playerID: UUID)
    mutating func selectNeapin(for playerID: UUID)
}

@Observable
class GameSession {
    var players:     [Player]
    var holeResults: [HoleResult]
    var currentHole: Int
    var pointConfig: PointConfig  // ゲーム開始時に AppSettings から取得

    func setup(players: [Player], config: PointConfig)
    func totalScore(for playerID: UUID) -> Int
    func finalScore(for playerID: UUID) -> Int
    func rankedPlayers() -> [(player: Player, score: Int, rank: Int)]
}
```

---

## Firebase リアルタイム共有

### FirebaseSync（`@Observable` class）

```swift
class FirebaseSync {
    var roomId:    String?
    var snapshot:  RoomSnapshot?
    var isObserver: Bool

    func startHosting(session: GameSession) -> String
    func push(session: GameSession, finished: Bool)
    func pushWithDraft(_ draft: HoleResult, session: GameSession)  // ← リアルタイム同期用
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
      "diamonds": {"uuid": true},
      "saoichi":  {"uuid": true},
      "neapin":   "uuid"
    }
  ],
  "currentHole": 5,
  "status": "playing" | "finished"
}
```

**⚠️ 重要：`diamonds`・`saoichi` はオブジェクト形式**  
Firebase は配列を `{"0": "uuid"}` に変換する。JS SDK はこれを元の配列に戻さないため、
React 側で `saoichi["uuid"]` が `undefined` になる。オブジェクト形式 `{"uuid": true}` で
書くことで両 SDK が正しく読める。

### 同期タイミング（ホスト側）
- ゲーム開始時
- `draft` が変わるたびに即時同期（`pushWithDraft`）
- ホール移動時（`push`）
- 最終ホール完了時（`push(finished: true)`）

---

## ファイル構成（実装済み）

```
GolfOlympicsiOSApp/GolfOlympics/
├── GolfOlympicsApp.swift      ← @main / FirebaseApp.configure()
├── ContentView.swift          ← 画面ルーター（AppScreen enum）
├── AppColors.swift            ← Color定数・ButtonStyle・ViewModifier
│                                 ScreenHeader / AppHeader / AppTextField 等
├── AppSettings.swift          ← UserDefaults 永続化（PointConfig 含む）
├── Player.swift
├── Medal.swift                ← 鉄アイコン: 🪨
├── HoleResult.swift           ← Equatable 準拠
├── GameSession.swift          ← @Observable / PointConfig 保持
├── FirebaseSync.swift         ← pushWithDraft() でリアルタイム同期
├── HomeView.swift             ← 初期画面（挨拶・ラウンド開始・設定・観戦）
├── RoundSetupView.swift       ← 人数・名前設定
├── HoleInputView.swift        ← ホール入力（コンパクトヘッダー・遷移ポップアップ）
├── PlayerHoleRow.swift        ← 1プレイヤー分のメダル+特殊ボタン
├── ShareBannerView.swift      ← ShareButton + ShareModalView（QR コード付き）
├── ObserverView.swift         ← 観戦画面
├── ResultView.swift           ← rankBadge（4位以降: medal.fill SF Symbol）
├── HoleDetailTable.swift      ← 折りたたみ式ホール別点数表
├── RateSheet.swift            ← RateView（全画面・ScreenHeader・終了ボタン）
└── SettingsView.swift         ← 設定画面（ScreenHeader・保存して戻る）
```

---

## 状態管理の方針

- `GameSession`・`FirebaseSync` は `ContentView` が `@State` で所有
- 画面切り替えは `AppScreen` enum のスイッチ（NavigationStack は不使用）
- `HoleResult` は `draft` として HoleInputView がローカル保持し、ナビゲーション時と draft 変更時に同期
- 「← 戻る」は pop ではなく `currentHole -= 1`

---

## 実装上の注意点

### メダルの排他制御
同じメダルは1人のみ。選択時に他プレイヤーの同一メダルを除去してから割り当て（再タップで解除）。

### ダイヤとメダルの連動
ダイヤ ON 時：自プレイヤーのメダル消去 ＋ 使用可能範囲外のメダルを全プレイヤーから除去。  
例）4人→1人ダイヤ：鉄が範囲外 → 鉄を持つプレイヤーのメダルをリセット。

### Firebase 配列問題
`diamonds`・`saoichi` を配列でエンコードすると Firebase が `{"0": "uuid"}` に変換し、
JS SDK で正しく読めない（`saoichi["uuid"]` が `undefined`）。オブジェクト形式で書くこと。

### ニアピンは1ホール1人
再タップで解除。別プレイヤーをタップすると自動的に移動。

### 竿イチ権のみは無得点
竿イチ権があっても、メダルを取得していなければボーナス点はつかない。

### スコア修正フロー
結果画面 → 「スコアを修正する」→ currentHole = 18 で HoleInputView に戻る。
← 戻るで 17, 16... と遡れる。修正後「次のホールへ」→ 18H で「結果を見る」。

### ゲーム終了フロー
RateView 下部の「ゲームを終了する」→ 確認アラート → Firebase ルーム削除 → HomeView へ。

---

## 未実装（バックログ）

- [ ] ラウンド履歴の保存（SwiftData）
- [ ] 9ホール対応
- [ ] 同点時のタイブレーク処理
