import SwiftUI

struct HoleInputView: View {
    var session: GameSession
    var roomId: String?
    var onFinish: () -> Void
    var onHoleSaved: (() -> Void)?
    var onQuit: (() -> Void)?

    @State private var draft: HoleResult
    @State private var showQuitAlert = false

    init(session: GameSession, roomId: String? = nil, onFinish: @escaping () -> Void, onHoleSaved: (() -> Void)? = nil, onQuit: (() -> Void)? = nil) {
        self.session = session
        self.roomId = roomId
        self.onFinish = onFinish
        self.onHoleSaved = onHoleSaved
        self.onQuit = onQuit
        let idx = max(0, min(session.currentHole - 1, 17))
        self._draft = State(initialValue: session.holeResults[idx])
    }

    private var isLastHole: Bool { session.currentHole == 18 }

    private var availableMedals: [Medal] {
        draft.availableMedals(playerCount: session.players.count)
    }

    private func prevTotal(for playerID: UUID) -> Int {
        session.holeResults.enumerated().reduce(0) { sum, pair in
            guard pair.offset != session.currentHole - 1 else { return sum }
            return sum + pair.element.points(for: playerID)
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                AppHeader()
                    .overlay(alignment: .topTrailing) {
                        if let roomId {
                            ShareButton(roomId: roomId)
                                .padding(.top, 8)
                                .padding(.trailing, 4)
                        }
                    }

                // ホール番号・プログレスバー
                VStack(spacing: 8) {
                    Text("\(session.currentHole)")
                        .font(.system(size: 52, weight: .bold))
                        .foregroundStyle(Color.appGold)
                    Text("HOLE / 18")
                        .font(.system(size: 11))
                        .tracking(4)
                        .foregroundStyle(Color.white.opacity(0.5))

                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color.white.opacity(0.1))
                                .frame(height: 4)
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color.appGold)
                                .frame(
                                    width: geo.size.width * CGFloat(session.currentHole) / 18,
                                    height: 4
                                )
                                .animation(.easeInOut(duration: 0.4), value: session.currentHole)
                        }
                    }
                    .frame(height: 4)
                }
                .padding(.vertical, 4)
                .cardStyle()

                // プレイヤーごとのブロック
                VStack(alignment: .leading, spacing: 0) {
                    Text("メダル割り当て")
                        .sectionTitleStyle()
                        .padding(.bottom, 4)
                    Text("1パット→メダル / チップイン→💎 / 旗竿より遠い→🚩 / ニアピン→📍")
                        .font(.system(size: 10))
                        .foregroundStyle(Color.white.opacity(0.35))
                        .padding(.bottom, 12)

                    ForEach(Array(session.players.enumerated()), id: \.element.id) { idx, player in
                        PlayerHoleRow(
                            player: player,
                            availableMedals: availableMedals,
                            isDiamond:   draft.diamonds.contains(player.id),
                            isSaoichi:   draft.saoichi.contains(player.id),
                            isNeapin:    draft.neapin == player.id,
                            currentMedal: draft.medals[player.id],
                            onToggleDiamond: { draft.toggleDiamond(for: player.id, playerCount: session.players.count) },
                            onToggleSaoichi: { draft.toggleSaoichi(for: player.id) },
                            onToggleNeapin:  { draft.selectNeapin(for: player.id) },
                            onSelectMedal:   { medal in draft.selectMedal(medal, for: player.id) }
                        )

                        if idx < session.players.count - 1 {
                            Divider().opacity(0.15)
                        }
                    }
                }
                .cardStyle()

                // ミニスコアボード
                HStack(spacing: 0) {
                    ForEach(session.players) { player in
                        VStack(spacing: 2) {
                            Text(player.name)
                                .font(.system(size: 11))
                                .foregroundStyle(Color.white.opacity(0.55))
                                .lineLimit(1)
                                .minimumScaleFactor(0.7)
                            Text("\(prevTotal(for: player.id) + draft.points(for: player.id))pt")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(Color.appGold)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .padding(.vertical, 10)
                .cardStyle()

                // ナビゲーションボタン
                HStack(spacing: 10) {
                    if session.currentHole > 1 {
                        Button("← 戻る") { saveAndMove(-1) }
                            .buttonStyle(SecondaryButtonStyle())
                    }
                    Button(isLastHole ? "結果を見る 🏆" : "次のホールへ →") {
                        if isLastHole { saveAndFinish() } else { saveAndMove(1) }
                    }
                    .buttonStyle(PrimaryButtonStyle())
                }

                // 中止ボタン
                if onQuit != nil {
                    Button("✕ ゲームを中止する") { showQuitAlert = true }
                        .buttonStyle(DangerButtonStyle())
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .alert("ゲームを中止しますか？", isPresented: $showQuitAlert) {
            Button("中止する", role: .destructive) { onQuit?() }
            Button("キャンセル", role: .cancel) {}
        } message: {
            Text("スコアは保存されません。")
        }
    }

    private func saveAndMove(_ delta: Int) {
        session.holeResults[session.currentHole - 1] = draft
        session.currentHole += delta
        draft = session.holeResults[session.currentHole - 1]
        onHoleSaved?()
    }

    private func saveAndFinish() {
        session.holeResults[session.currentHole - 1] = draft
        onFinish()
    }
}

#Preview {
    let session = GameSession()
    session.setup(players: [
        Player(name: "Alice"),
        Player(name: "Bob"),
        Player(name: "Carol"),
        Player(name: "Dave"),
    ])
    return ZStack {
        AppBackground()
        HoleInputView(session: session) {}
    }
}
