import SwiftUI

struct ObserverView: View {
    let roomId: String
    let snapshot: RoomSnapshot?
    var onLeave: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                AppHeader()

                if let snap = snapshot {
                    VStack(alignment: .leading, spacing: 12) {
                        Text(snap.isFinished ? "🏆 最終結果" : "⛳ \(snap.currentHole)H 進行中")
                            .sectionTitleStyle()
                            .frame(maxWidth: .infinity, alignment: .center)

                        ForEach(ranked(snap), id: \.player.id) { item in
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

                    Text("ルーム: \(roomId) · リアルタイム更新中")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.white.opacity(0.25))

                } else {
                    VStack(spacing: 16) {
                        ProgressView()
                            .tint(Color.appGold)
                        Text("接続中...")
                            .foregroundStyle(Color.white.opacity(0.5))
                        Text("ルーム: \(roomId)")
                            .font(.system(size: 11))
                            .foregroundStyle(Color.white.opacity(0.3))
                    }
                    .frame(maxWidth: .infinity)
                    .cardStyle()
                }

                Button("退出する") { onLeave() }
                    .buttonStyle(SecondaryButtonStyle())
                    .padding(.horizontal, 20)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }

    private func ranked(_ snap: RoomSnapshot) -> [(player: Player, score: Int, rank: Int)] {
        let scored = snap.players.map { p in
            (p, snap.holeResults.reduce(0) { $0 + $1.points(for: p.id) })
        }.sorted { $0.1 > $1.1 }
        var rank = 1
        return scored.enumerated().map { i, pair in
            if i > 0 && pair.1 < scored[i - 1].1 { rank = i + 1 }
            return (pair.0, pair.1, rank)
        }
    }

    private func rankEmoji(_ rank: Int) -> String {
        switch rank {
        case 1: return "🥇"
        case 2: return "🥈"
        case 3: return "🥉"
        default: return "\(rank)位"
        }
    }
}
