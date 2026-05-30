import SwiftUI

struct SettingsView: View {
    var onBack: () -> Void

    @State private var userName    = AppSettings.userName
    @State private var defaultRate = AppSettings.defaultRate
    @State private var config      = AppSettings.pointConfig

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                AppHeader()

                // ユーザー情報
                VStack(alignment: .leading, spacing: 14) {
                    Text("ユーザー情報")
                        .sectionTitleStyle()

                    VStack(alignment: .leading, spacing: 6) {
                        Text("名前")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.white.opacity(0.55))
                        AppTextField(placeholder: "あなたの名前", text: $userName)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("デフォルトレート（円 / pt）")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.white.opacity(0.55))
                        AppTextField(
                            placeholder: "例: 100",
                            text: Binding(
                                get: { defaultRate == 0 ? "" : "\(defaultRate)" },
                                set: { defaultRate = Int($0.filter(\.isNumber)) ?? 0 }
                            ),
                            keyboard: .numberPad
                        )
                    }
                }
                .cardStyle()

                // メダルポイント設定
                VStack(alignment: .leading, spacing: 12) {
                    Text("メダルポイント")
                        .sectionTitleStyle()

                    PointStepperRow(label: "🥇 金",  value: $config.gold)
                    PointStepperRow(label: "🥈 銀",  value: $config.silver)
                    PointStepperRow(label: "🥉 銅",  value: $config.bronze)
                    PointStepperRow(label: "🔩 鉄",  value: $config.iron)
                }
                .cardStyle()

                // スペシャルオプション設定
                VStack(alignment: .leading, spacing: 12) {
                    Text("オプション")
                        .sectionTitleStyle()

                    PointStepperRow(label: "💎 ダイヤ",      value: $config.diamond)
                    PointStepperRow(label: "🚩 竿イチボーナス", value: $config.saoichiBonus)
                    PointStepperRow(label: "📍 ニアピン",     value: $config.neapin)
                }
                .cardStyle()

                // 保存ボタン
                Button("保存して戻る") {
                    AppSettings.userName    = userName
                    AppSettings.defaultRate = defaultRate
                    AppSettings.pointConfig = config
                    onBack()
                }
                .buttonStyle(PrimaryButtonStyle())
                .padding(.horizontal, 0)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }
}

struct PointStepperRow: View {
    let label: String
    @Binding var value: Int

    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .frame(maxWidth: .infinity, alignment: .leading)
            Stepper("\(value)pt", value: $value, in: 0...20)
                .fixedSize()
                .foregroundStyle(Color.appGold)
        }
        Divider().opacity(0.12)
    }
}
