import SwiftUI

struct HoleDetailTable: View {
    var session: GameSession
    @State private var expanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                withAnimation(.easeInOut(duration: 0.2)) { expanded.toggle() }
            } label: {
                HStack {
                    Text("ホール別点数を見る")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.white.opacity(0.5))
                    Spacer()
                    Image(systemName: expanded ? "chevron.up" : "chevron.down")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.white.opacity(0.3))
                }
            }

            if expanded {
                ScrollView(.horizontal, showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 0) {
                        // ヘッダー行
                        HStack(spacing: 0) {
                            Text("H")
                                .frame(width: 28, alignment: .leading)
                                .foregroundStyle(Color.appGold)
                            ForEach(session.players) { player in
                                Text(player.name)
                                    .frame(minWidth: 80)
                                    .multilineTextAlignment(.center)
                                    .foregroundStyle(Color.appGold)
                            }
                        }
                        .font(.system(size: 11, weight: .semibold))
                        .padding(.top, 12)
                        .padding(.bottom, 4)

                        Divider().opacity(0.2)

                        // データ行
                        ForEach(session.holeResults, id: \.holeNumber) { hole in
                            HStack(spacing: 0) {
                                Text("\(hole.holeNumber)")
                                    .frame(width: 28, alignment: .leading)
                                    .foregroundStyle(Color.white.opacity(0.4))

                                ForEach(session.players) { player in
                                    let pts = hole.points(for: player.id)
                                    let cell = holeCell(hole: hole, playerID: player.id)
                                    Group {
                                        if pts == 0 {
                                            Text("ー")
                                                .foregroundStyle(Color.white.opacity(0.2))
                                        } else {
                                            Text("\(pts)pt \(cell.icons)")
                                                .foregroundStyle(cell.color)
                                        }
                                    }
                                    .frame(minWidth: 80)
                                    .multilineTextAlignment(.center)
                                }
                            }
                            .font(.system(size: 11))
                            .padding(.vertical, 3)
                        }
                    }
                }
                .padding(.top, 4)
            }
        }
    }

    private func holeCell(hole: HoleResult, playerID: UUID) -> (icons: String, color: Color) {
        var icons = ""
        var color = Color.white.opacity(0.5)

        if hole.diamonds.contains(playerID) {
            icons = "💎"
            color = .appDiamond
        } else if let medal = hole.medals[playerID] {
            icons = medal.emoji + (hole.saoichi.contains(playerID) ? "🚩" : "")
            color = medal.color
        }

        if hole.neapin == playerID { icons += "📍" }

        return (icons, color)
    }
}
