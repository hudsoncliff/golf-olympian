import SwiftUI

struct StartView: View {
    var onStart: ([Player]) -> Void
    var onJoin:  (String) -> Void

    @State private var playerCount = 4
    @State private var names = Array(repeating: "", count: 4)
    @State private var joinCode = ""

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                AppHeader()

                // ゲーム開始カード
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

                // 観戦参加カード
                VStack(alignment: .leading, spacing: 12) {
                    Text("ルームコードで参加")
                        .sectionTitleStyle()

                    AppTextField(
                        placeholder: "例: ABC123",
                        text: Binding(
                            get: { joinCode },
                            set: { joinCode = $0.uppercased().filter { $0.isLetter || $0.isNumber }.prefix(6).map(String.init).joined() }
                        )
                    )

                    Button("👁 観戦モードで参加") { onJoin(joinCode) }
                        .buttonStyle(SecondaryButtonStyle())
                        .disabled(joinCode.count != 6)
                        .opacity(joinCode.count == 6 ? 1 : 0.4)
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
        StartView(onStart: { _ in }, onJoin: { _ in })
    }
}
