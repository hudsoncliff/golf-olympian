import SwiftUI

struct ShareBannerView: View {
    let roomId: String
    @State private var collapsed = false

    private var shareURL: URL {
        URL(string: "https://hudsoncliff.github.io/golf-olympian/#\(roomId)")!
    }

    var body: some View {
        if collapsed {
            HStack {
                Spacer()
                ShareLink(item: shareURL,
                          subject: Text("Golf Olympics"),
                          message: Text("ルームコード: \(roomId)")) {
                    Image(systemName: "link.circle.fill")
                        .font(.system(size: 36))
                        .foregroundStyle(Color.appGold)
                        .shadow(color: Color.appGold.opacity(0.4), radius: 8)
                }
            }
            .padding(.horizontal, 20)
        } else {
            VStack(spacing: 12) {
                Text("📱 参加者に共有する")
                    .sectionTitleStyle()
                    .frame(maxWidth: .infinity, alignment: .center)

                Text(roomId)
                    .font(.system(size: 28, weight: .bold, design: .monospaced))
                    .tracking(8)
                    .foregroundStyle(Color.appGold)

                ShareLink(item: shareURL,
                          subject: Text("Golf Olympics"),
                          message: Text("ルームコード: \(roomId)")) {
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
