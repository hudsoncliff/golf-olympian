import SwiftUI

struct RateSheet: View {
    var session: GameSession
    @Environment(\.dismiss) private var dismiss
    @State private var rateText = ""

    private var rate: Int { Int(rateText.filter(\.isNumber)) ?? 0 }

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackground()
                ScrollView {
                    VStack(spacing: 16) {
                        // レート入力
                        VStack(alignment: .leading, spacing: 8) {
                            Text("1ポイントあたりのレート（円）")
                                .font(.system(size: 12))
                                .foregroundStyle(Color.white.opacity(0.6))
                            AppTextField(
                                placeholder: "例: 100",
                                text: $rateText,
                                keyboard: .numberPad
                            )
                        }
                        .cardStyle()

                        // ポイント集計
                        VStack(alignment: .leading, spacing: 10) {
                            Text("ポイント集計")
                                .sectionTitleStyle()

                            ForEach(
                                session.players.sorted { session.totalScore(for: $0.id) > session.totalScore(for: $1.id) },
                                id: \.id
                            ) { player in
                                HStack {
                                    Text(player.name).font(.system(size: 14))
                                    Spacer()
                                    Text("\(session.totalScore(for: player.id))pt")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundStyle(Color.appGold)
                                }
                                .padding(.vertical, 6)
                                Divider().opacity(0.15)
                            }
                        }
                        .cardStyle()

                        // 精算金額（レート入力後に表示）
                        if rate > 0 {
                            VStack(alignment: .leading, spacing: 10) {
                                Text("精算金額")
                                    .sectionTitleStyle()

                                ForEach(
                                    session.players.sorted { session.finalScore(for: $0.id) > session.finalScore(for: $1.id) },
                                    id: \.id
                                ) { player in
                                    let payment = session.finalScore(for: player.id) * rate
                                    HStack {
                                        Text(player.name).font(.system(size: 14))
                                        Spacer()
                                        Text(paymentLabel(payment))
                                            .font(.system(size: 16, weight: .bold))
                                            .foregroundStyle(paymentColor(payment))
                                    }
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(paymentBg(payment))
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                }
                            }
                            .cardStyle()
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("💴 レート計算")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("閉じる") { dismiss() }
                        .foregroundStyle(Color.appGold)
                }
            }
        }
    }

    private func paymentLabel(_ p: Int) -> String {
        if p > 0 { return "+\(p.formatted())円" }
        if p < 0 { return "\(p.formatted())円" }
        return "±0円"
    }

    private func paymentColor(_ p: Int) -> Color {
        p > 0 ? .green : p < 0 ? Color(red: 1, green: 0.54, blue: 0.54) : Color.white.opacity(0.4)
    }

    private func paymentBg(_ p: Int) -> Color {
        p > 0 ? Color.green.opacity(0.1) : p < 0 ? Color.red.opacity(0.1) : Color.white.opacity(0.04)
    }
}
