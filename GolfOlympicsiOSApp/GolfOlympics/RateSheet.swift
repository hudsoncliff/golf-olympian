import SwiftUI

struct RateView: View {
    var session: GameSession
    var onBack: () -> Void
    var onNewGame: () -> Void

    @State private var rateText: String = {
        let r = AppSettings.defaultRate
        return r > 0 ? "\(r)" : ""
    }()
    @State private var showQuitAlert = false

    private var rate: Int { Int(rateText.filter(\.isNumber)) ?? 0 }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // ヘッダー
                HStack {
                    Button {
                        onBack()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 14, weight: .semibold))
                            Text("計算画面に戻る")
                                .font(.system(size: 14))
                        }
                        .foregroundStyle(Color.appGold)
                    }
                    Spacer()
                    Text("💴 レート計算")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(Color.white)
                    Spacer()
                    // バランス用の透明スペーサー
                    Color.clear.frame(width: 80, height: 1)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)

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

                // 獲得pt → 精算pt → 精算額
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 0) {
                        Text("").frame(maxWidth: .infinity, alignment: .leading)
                        Text("獲得pt").frame(width: 44, alignment: .trailing)
                        Text("").frame(width: 18)
                        Text("精算pt").frame(width: 44, alignment: .trailing)
                        if rate > 0 {
                            Text("").frame(width: 18)
                            Text("精算額").frame(width: 60, alignment: .trailing)
                        }
                    }
                    .font(.system(size: 10))
                    .foregroundStyle(Color.white.opacity(0.35))
                    .padding(.horizontal, 12)

                    ForEach(
                        session.players.sorted { session.finalScore(for: $0.id) > session.finalScore(for: $1.id) },
                        id: \.id
                    ) { player in
                        let total   = session.totalScore(for: player.id)
                        let final_  = session.finalScore(for: player.id)
                        let payment = final_ * rate

                        HStack(spacing: 0) {
                            Text(player.name)
                                .font(.system(size: 13))
                                .foregroundStyle(Color.white)
                                .lineLimit(1)
                                .frame(maxWidth: .infinity, alignment: .leading)

                            Text("\(total)pt")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(Color.appGold)
                                .frame(width: 44, alignment: .trailing)

                            Text("→")
                                .font(.system(size: 10))
                                .foregroundStyle(Color.white.opacity(0.25))
                                .frame(width: 18)

                            Text(scoreLabel(final_))
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(scoreColor(final_))
                                .frame(width: 44, alignment: .trailing)

                            if rate > 0 {
                                Text("→")
                                    .font(.system(size: 10))
                                    .foregroundStyle(Color.white.opacity(0.25))
                                    .frame(width: 18)

                                Text(paymentLabel(payment))
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundStyle(scoreColor(final_))
                                    .frame(width: 60, alignment: .trailing)
                            }
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 10)
                        .background(scoreBg(final_))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
                .cardStyle()

                // ゲームを終了するボタン
                Button("ゲームを終了する") { showQuitAlert = true }
                    .buttonStyle(DangerButtonStyle())
                    .padding(.horizontal, 20)
            }
            .padding(.bottom, 40)
        }
        .alert("ゲームを終了しますか？", isPresented: $showQuitAlert) {
            Button("終了する", role: .destructive) { onNewGame() }
            Button("キャンセル", role: .cancel) {}
        } message: {
            Text("スコアデータは保存されません。")
        }
    }

    private func scoreLabel(_ s: Int) -> String {
        s > 0 ? "+\(s)pt" : s < 0 ? "\(s)pt" : "±0pt"
    }

    private func paymentLabel(_ p: Int) -> String {
        p > 0 ? "+\(p.formatted())円" : p < 0 ? "\(p.formatted())円" : "±0円"
    }

    private func scoreColor(_ s: Int) -> Color {
        s > 0 ? .green : s < 0 ? Color(red: 1, green: 0.54, blue: 0.54) : Color.white.opacity(0.4)
    }

    private func scoreBg(_ s: Int) -> Color {
        s > 0 ? Color.green.opacity(0.1) : s < 0 ? Color.red.opacity(0.1) : Color.white.opacity(0.04)
    }
}
