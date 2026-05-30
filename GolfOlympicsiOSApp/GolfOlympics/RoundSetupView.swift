import SwiftUI

struct RoundSetupView: View {
    var onStart: ([Player]) -> Void
    var onBack:  () -> Void

    @State private var playerCount = 4
    @State private var names: [String]

    init(onStart: @escaping ([Player]) -> Void, onBack: @escaping () -> Void) {
        self.onStart = onStart
        self.onBack  = onBack
        var initial = Array(repeating: "", count: 4)
        initial[0]  = AppSettings.userName  // 自分の名前を初期値に
        self._names = State(initialValue: initial)
    }

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
                    .padding(.top, 4)

                    Button("← 戻る") { onBack() }
                        .buttonStyle(SecondaryButtonStyle())
                }
                .cardStyle()
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }
}
