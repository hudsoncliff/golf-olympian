import SwiftUI

struct ResultView: View {
    var session: GameSession
    var onEdit: () -> Void
    var onNewGame: () -> Void

    @State private var showRateSheet = false

    private func rankEmoji(_ rank: Int) -> String {
        switch rank {
        case 1: return "🥇"
        case 2: return "🥈"
        case 3: return "🥉"
        default: return "\(rank)位"
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                AppHeader()

                // 最終順位
                VStack(alignment: .leading, spacing: 12) {
                    Text("🏆 最終結果")
                        .sectionTitleStyle()
                        .frame(maxWidth: .infinity, alignment: .center)

                    ForEach(session.rankedPlayers(), id: \.player.id) { item in
                        HStack(spacing: 8) {
                            Text(rankEmoji(item.rank))
                                .font(.title3)
                                .frame(width: 32)
                            Text(item.player.name)
                                .font(.system(size: 15))
                            Spacer()
                            Text("\(item.score)pt")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundStyle(Color.appGold)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(item.rank == 1 ? Color.appGold.opacity(0.12) : Color.white.opacity(0.04))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(item.rank == 1 ? Color.appGold.opacity(0.35) : Color.clear, lineWidth: 1)
                        )
                    }
                }
                .cardStyle()

                // ホール別点数（折りたたみ）
                HoleDetailTable(session: session)
                    .cardStyle()

                // 精算点
                VStack(alignment: .leading, spacing: 10) {
                    Text("精算点")
                        .sectionTitleStyle()
                    Text("本人pt × (人数-1) − 他全員のpt合計")
                        .font(.system(size: 10))
                        .foregroundStyle(Color.white.opacity(0.35))

                    ForEach(
                        session.players.sorted { session.finalScore(for: $0.id) > session.finalScore(for: $1.id) },
                        id: \.id
                    ) { player in
                        let score = session.finalScore(for: player.id)
                        HStack {
                            Text(player.name).font(.system(size: 14))
                            Spacer()
                            Text(score > 0 ? "+\(score)pt" : score < 0 ? "\(score)pt" : "±0pt")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(score > 0 ? .green : score < 0 ? Color(red: 1, green: 0.54, blue: 0.54) : Color.white.opacity(0.4))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(score > 0 ? Color.green.opacity(0.1) : score < 0 ? Color.red.opacity(0.1) : Color.white.opacity(0.04))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
                .cardStyle()

                // アクションボタン
                VStack(spacing: 10) {
                    Button("💴 レート計算・集計") { showRateSheet = true }
                        .buttonStyle(PrimaryButtonStyle())
                    Button("✏️ スコアを修正する") { onEdit() }
                        .buttonStyle(SecondaryButtonStyle())
                    Button("🔄 新しいゲームを始める") { onNewGame() }
                        .buttonStyle(DangerButtonStyle())
                }
                .cardStyle()
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .sheet(isPresented: $showRateSheet) {
            RateSheet(session: session)
        }
    }
}

#Preview {
    let session = GameSession()
    session.setup(players: [
        Player(name: "Alice"),
        Player(name: "Bob"),
        Player(name: "Carol"),
    ])
    // ダミーデータ
    session.holeResults[0].medals = [session.players[0].id: .gold, session.players[1].id: .silver]
    session.holeResults[0].diamonds.insert(session.players[2].id)
    session.holeResults[1].medals = [session.players[1].id: .gold]
    session.holeResults[1].saoichi.insert(session.players[1].id)
    session.holeResults[1].neapin = session.players[0].id

    return ZStack {
        AppBackground()
        ResultView(session: session) {} onNewGame: {}
    }
}
