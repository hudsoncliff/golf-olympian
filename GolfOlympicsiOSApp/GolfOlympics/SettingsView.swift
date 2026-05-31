import SwiftUI

struct SettingsView: View {
    var onBack: () -> Void

    @State private var userName      = AppSettings.userName
    @State private var defaultRate   = AppSettings.defaultRate
    @State private var currencyUnit  = AppSettings.currencyUnit
    @State private var config        = AppSettings.pointConfig

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ScreenHeader(title: "設定") {
                    AppSettings.userName     = userName
                    AppSettings.defaultRate  = defaultRate
                    AppSettings.currencyUnit = currencyUnit.isEmpty ? "円" : currencyUnit
                    AppSettings.pointConfig  = config
                    onBack()
                }

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
                        Text("デフォルトレート（\(currencyUnit) / pt）")
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

                    VStack(alignment: .leading, spacing: 6) {
                        Text("通貨単位")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.white.opacity(0.55))
                        AppTextField(
                            placeholder: "例：ペリカ、ドル、石",
                            text: $currencyUnit
                        )
                        Text("レート計算画面の精算額に表示されます（例：ペリカ、ドル、石）")
                            .font(.system(size: 10))
                            .foregroundStyle(Color.white.opacity(0.35))
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
                    PointStepperRow(label: "🪨 鉄",  value: $config.iron)
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

                // ルール説明
                VStack(alignment: .leading, spacing: 12) {
                    Text("ルール説明")
                        .sectionTitleStyle()

                    RuleRow(icon: "🥇🥈🥉🪨", title: "メダル", desc: "グリーンオン後、ピンから遠い順に金〜鉄を割り当て。1パットで沈めたプレイヤーのみ点数を獲得。")
                    RuleRow(icon: "💎", title: "ダイヤモンド", desc: "グリーン外からチップインした場合にポイント獲得。メダルは獲得しない。")
                    RuleRow(icon: "🚩", title: "竿イチ権", desc: "ボールとカップの距離が旗竿より長い場合に獲得。1パット成功時にボーナスポイント加算。")
                    RuleRow(icon: "📍", title: "ニアピン", desc: "グリーンオン後、カップに最も近いプレイヤーが獲得。1ホールにつき1人のみ。")
                }
                .cardStyle()

            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }
}

struct RuleRow: View {
    let icon: String
    let title: String
    let desc: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 6) {
                Text(icon).font(.system(size: 14))
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color.appGold)
            }
            Text(desc)
                .font(.system(size: 12))
                .foregroundStyle(Color.white.opacity(0.55))
                .fixedSize(horizontal: false, vertical: true)
        }
        Divider().opacity(0.1)
    }
}

struct PointStepperRow: View {
    let label: String
    @Binding var value: Int

    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .foregroundStyle(Color.white)
                .frame(maxWidth: .infinity, alignment: .leading)
            Stepper("\(value)pt", value: $value, in: 0...20)
                .fixedSize()
                .foregroundStyle(Color.appGold)
        }
        Divider().opacity(0.12)
    }
}
