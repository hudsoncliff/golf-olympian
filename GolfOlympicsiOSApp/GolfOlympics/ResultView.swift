import SwiftUI

struct ResultView: View {
    var session: GameSession
    var onShowRate: () -> Void
    var onEdit: () -> Void
    var onNewGame: () -> Void

    @ViewBuilder
    private func rankBadge(_ rank: Int) -> some View {
        switch rank {
        case 1: Text("🥇").font(.title3)
        case 2: Text("🥈").font(.title3)
        case 3: Text("🥉").font(.title3)
        default:
            Image(systemName: "circle.fill")
                .font(.title3)
                .foregroundStyle(Medal.iron.color)
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
                            rankBadge(item.rank)
                                .frame(width: 32)
                            Text(item.player.name)
                                .font(.system(size: 15))
                                .foregroundStyle(Color.white)
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
                            Text(player.name)
                                .font(.system(size: 14))
                                .foregroundStyle(Color.white)
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
                    Button("💴 レート計算・集計") { onShowRate() }
                        .buttonStyle(PrimaryButtonStyle())
                    Button("✏️ スコアを修正する") { onEdit() }
                        .buttonStyle(SecondaryButtonStyle())
                }
                .cardStyle()
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }
}
