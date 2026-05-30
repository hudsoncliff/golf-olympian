import SwiftUI

struct HomeView: View {
    var onStartRound: () -> Void
    var onSettings:   () -> Void
    var onJoin:       (String) -> Void

    @State private var joinCode = ""
    private var userName: String { AppSettings.userName }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                AppHeader()

                // あいさつ
                if !userName.isEmpty {
                    Text("こんにちは、\(userName)さん")
                        .font(.system(size: 18))
                        .foregroundStyle(Color.white.opacity(0.75))
                        .padding(.top, 4)
                }

                // メインアクション
                VStack(spacing: 12) {
                    Button {
                        onStartRound()
                    } label: {
                        Label("ラウンド開始", systemImage: "flag.fill")
                    }
                    .buttonStyle(PrimaryButtonStyle())

                    Button {
                        onSettings()
                    } label: {
                        Label("設定", systemImage: "gearshape.fill")
                    }
                    .buttonStyle(SecondaryButtonStyle())
                }
                .cardStyle()

                // 観戦モード参加
                VStack(alignment: .leading, spacing: 10) {
                    Text("観戦モードで参加")
                        .sectionTitleStyle()

                    AppTextField(
                        placeholder: "ルームコード（例: ABC123）",
                        text: Binding(
                            get: { joinCode },
                            set: {
                                joinCode = $0.uppercased()
                                    .filter { $0.isLetter || $0.isNumber }
                                    .prefix(6)
                                    .map(String.init).joined()
                            }
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
        HomeView(onStartRound: {}, onSettings: {}, onJoin: { _ in })
    }
}
