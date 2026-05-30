import SwiftUI

private extension VerticalAlignment {
    private enum ProgressBarCenter: AlignmentID {
        static func defaultValue(in d: ViewDimensions) -> CGFloat { d[VerticalAlignment.center] }
    }
    static let progressBarCenter = VerticalAlignment(ProgressBarCenter.self)
}

struct HoleInputView: View {
    var session: GameSession
    var roomId: String?
    var onFinish: () -> Void
    var onHoleSaved: (() -> Void)?
    var onQuit: (() -> Void)?

    @State private var draft: HoleResult
    @State private var showQuitAlert = false
    @State private var showHolePopup = false
    @State private var popupHoleNum  = 0

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
            return sum + pair.element.points(for: playerID, config: session.pointConfig)
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // コンパクトなホールヘッダー（ホール番号 + プログレスバー + 共有ボタン）
                HStack(alignment: .progressBarCenter, spacing: 14) {
                    VStack(alignment: .center, spacing: 1) {
                        Text("HOLE")
                            .font(.system(size: 9, weight: .semibold))
                            .tracking(3)
                            .foregroundStyle(Color.white.opacity(0.35))
                        Text("\(session.currentHole)")
                            .font(.system(size: 30, weight: .bold))
                            .foregroundStyle(Color.appGold)
                            .lineLimit(1)
                    }
                    .frame(width: 52, alignment: .center)
                    .alignmentGuide(.progressBarCenter) { d in d[VerticalAlignment.center] }

                    VStack(spacing: 5) {
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
                        .alignmentGuide(.progressBarCenter) { d in d[VerticalAlignment.center] }

                        HStack {
                            Spacer()
                            Text("\(session.currentHole) / 18")
                                .font(.system(size: 11))
                                .foregroundStyle(Color.white.opacity(0.35))
                        }
                    }

                    // 共有ボタン分のスペース確保（オーバーレイと重ならないよう）
                    if roomId != nil {
                        Spacer().frame(width: 52)
                    }

                }
                .padding(.vertical, 8)
                .cardStyle()

                // プレイヤーごとのブロック
                VStack(alignment: .leading, spacing: 0) {
                    Text("メダル割り当て")
                        .sectionTitleStyle()
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
        // B: ホール番号中央ポップアップ
        .overlay {
            if showHolePopup {
                ZStack {
                    Color.black.opacity(0.45)
                        .ignoresSafeArea()
                        .allowsHitTesting(false)
                    VStack(spacing: 4) {
                        Text("HOLE")
                            .font(.system(size: 13, weight: .semibold))
                            .tracking(8)
                            .foregroundStyle(Color.white.opacity(0.5))
                        Text("\(popupHoleNum)")
                            .font(.system(size: 88, weight: .bold))
                            .foregroundStyle(Color.appGold)
                            .shadow(color: Color.appGold.opacity(0.6), radius: 24)
                    }
                    .transition(.asymmetric(
                        insertion: .scale(scale: 0.6).combined(with: .opacity),
                        removal:   .scale(scale: 1.2).combined(with: .opacity)
                    ))
                }
            }
        }
        .overlay(alignment: .topTrailing) {
            if let roomId {
                ShareButton(roomId: roomId)
                    .padding(.top, 0)
                    .padding(.trailing, 20)
            }
        }
        .alert("ゲームを中止しますか？", isPresented: $showQuitAlert) {
            Button("中止する", role: .destructive) { onQuit?() }
            Button("キャンセル", role: .cancel) {}
        } message: {
            Text("スコアは保存されません。")
        }
    }

    private func saveAndMove(_ delta: Int) {
        let from = session.currentHole
        session.holeResults[session.currentHole - 1] = draft
        session.currentHole += delta
        draft = session.holeResults[session.currentHole - 1]
        onHoleSaved?()
        triggerHoleTransition(from: from, to: session.currentHole)
    }

    private func triggerHoleTransition(from: Int, to: Int) {
        popupHoleNum = to
        withAnimation(.spring(duration: 0.2)) { showHolePopup = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            withAnimation(.easeIn(duration: 0.2)) { showHolePopup = false }
        }
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
