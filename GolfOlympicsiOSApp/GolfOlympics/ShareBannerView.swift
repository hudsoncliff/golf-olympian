import SwiftUI

struct ShareBannerView: View {
    let roomId: String
    @State private var collapsed = false

    private var shareURL: URL {
        URL(string: "https://hudsoncliff.github.io/golf-olympian/#\(roomId)")!
    }

    var body: some View {
        if collapsed {
            // 折りたたみ状態：ルームコード + 共有ボタン
            HStack(spacing: 10) {
                Spacer()
                Text(roomId)
                    .font(.system(size: 13, weight: .bold, design: .monospaced))
                    .tracking(2)
                    .foregroundStyle(Color.appGold.opacity(0.8))
                ShareLink(item: shareURL, subject: Text("Golf Olympics")) {
                    VStack(spacing: 3) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 20, weight: .semibold))
                        Text("共有")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundStyle(Color(red: 0.04, green: 0.09, blue: 0.16))
                    .frame(width: 56, height: 44)
                    .background(Color.appGold)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .shadow(color: Color.appGold.opacity(0.4), radius: 6)
                }
            }
            .padding(.horizontal, 20)
        } else {
            // 展開状態：バナー表示
            VStack(spacing: 12) {
                Text("📱 参加者に共有する")
                    .sectionTitleStyle()
                    .frame(maxWidth: .infinity, alignment: .center)

                Text(roomId)
                    .font(.system(size: 28, weight: .bold, design: .monospaced))
                    .tracking(8)
                    .foregroundStyle(Color.appGold)

                ShareLink(item: shareURL, subject: Text("Golf Olympics")) {
                    Label("このゲームを共有", systemImage: "square.and.arrow.up")
                        .font(.system(size: 15, weight: .bold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.appGold)
                        .foregroundStyle(Color(red: 0.04, green: 0.09, blue: 0.16))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }

                Button("閉じる") { withAnimation { collapsed = true } }
                    .font(.system(size: 12))
                    .foregroundStyle(Color.white.opacity(0.4))
            }
            .cardStyle()
            .padding(.horizontal, 20)
        }
    }
}
