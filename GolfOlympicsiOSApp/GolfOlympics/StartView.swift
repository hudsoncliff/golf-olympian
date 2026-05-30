import SwiftUI

struct StartView: View {
    var onStart: ([Player]) -> Void

    @State private var playerCount = 4
    @State private var names = Array(repeating: "", count: 4)

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                AppHeader()

                VStack(alignment: .leading, spacing: 16) {
                    Text("プレイヤー人数")
                        .sectionTitleStyle()

                    HStack(spacing: 8) {
                        ForEach([2, 3, 4], id: \.self) { n in
                            Button("\(n)人") { playerCount = n }
                                .buttonStyle(CountButtonStyle(selected: playerCount == n))
                        }
                    }

                    Text("プレイヤー名")
                        .sectionTitleStyle()
                        .padding(.top, 4)

                    ForEach(0..<playerCount, id: \.self) { i in
                        AppTextField(placeholder: "Player \(i + 1)", text: $names[i])
                    }

                    Button("ゲーム開始 ⛳") {
                        let players = (0..<playerCount).map { i -> Player in
                            let raw = names[i].trimmingCharacters(in: .whitespaces)
                            return Player(name: raw.isEmpty ? "Player \(i + 1)" : raw)
                        }
                        onStart(players)
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .padding(.top, 8)
                }
                .cardStyle()
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }
}

#Preview {
    ZStack {
        AppBackground()
        StartView { _ in }
    }
}
