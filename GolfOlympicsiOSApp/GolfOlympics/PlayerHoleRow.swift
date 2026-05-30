import SwiftUI

struct PlayerHoleRow: View {
    let player: Player
    let availableMedals: [Medal]
    let isDiamond: Bool
    let isSaoichi: Bool
    let isNeapin: Bool
    let currentMedal: Medal?

    var onToggleDiamond: () -> Void
    var onToggleSaoichi: () -> Void
    var onToggleNeapin:  () -> Void
    var onSelectMedal:   (Medal) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(player.name)
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(Color.white.opacity(0.9))

            // メダルボタン行（ダイヤ選択中は代替テキスト表示）
            HStack(spacing: 6) {
                if isDiamond {
                    Text("💎 ダイヤモンド（メダル対象外）")
                        .font(.system(size: 12))
                        .italic()
                        .foregroundStyle(Color.appDiamond)
                } else {
                    ForEach(availableMedals) { medal in
                        Button(medal.label) { onSelectMedal(medal) }
                            .buttonStyle(MedalButtonStyle(
                                selected: currentMedal == medal,
                                color: medal.color
                            ))
                    }
                }
                Spacer()
            }
            .frame(minHeight: 28)

            // 特殊オプション行（常時表示）
            HStack(spacing: 6) {
                Button("💎 ダイヤ")    { onToggleDiamond() }
                    .buttonStyle(SpecialToggleStyle(isSelected: isDiamond, color: .appDiamond))
                Button("🚩 竿イチ権") { onToggleSaoichi() }
                    .buttonStyle(SpecialToggleStyle(isSelected: isSaoichi, color: .appSaoichi))
                Button("📍 ニアピン") { onToggleNeapin() }
                    .buttonStyle(SpecialToggleStyle(isSelected: isNeapin, color: .appNeapin))
                Spacer()
            }
        }
        .padding(.vertical, 8)
    }
}
