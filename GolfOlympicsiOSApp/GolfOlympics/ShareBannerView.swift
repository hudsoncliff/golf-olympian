import SwiftUI

// ホール画面右上の共有ボタン
struct ShareButton: View {
    let roomId: String
    @State private var showSheet = false

    var body: some View {
        Button { showSheet = true } label: {
            VStack(spacing: 2) {
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 16, weight: .semibold))
                Text("共有")
                    .font(.system(size: 9, weight: .bold))
            }
            .foregroundStyle(Color(red: 0.04, green: 0.09, blue: 0.16))
            .frame(width: 48, height: 38)
            .background(Color.appGold)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .shadow(color: Color.appGold.opacity(0.35), radius: 6)
        }
        .sheet(isPresented: $showSheet) {
            ShareModalView(roomId: roomId)
                .presentationDetents([.medium])
        }
    }
}

// 共有モーダルの内容
struct ShareModalView: View {
    let roomId: String
    @Environment(\.dismiss) private var dismiss

    private var shareURL: URL {
        URL(string: "https://hudsoncliff.github.io/golf-olympian/#\(roomId)")!
    }

    var body: some View {
        ZStack {
            AppBackground().ignoresSafeArea()

            VStack(spacing: 24) {
                Text("📱 参加者に共有する")
                    .sectionTitleStyle()

                VStack(spacing: 8) {
                    Text("ルームコード")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.white.opacity(0.5))
                    Text(roomId)
                        .font(.system(size: 36, weight: .bold, design: .monospaced))
                        .tracking(8)
                        .foregroundStyle(Color.appGold)
                }

                ShareLink(item: shareURL, subject: Text("Golf Olympics")) {
                    Label("このゲームを共有", systemImage: "square.and.arrow.up")
                        .font(.system(size: 15, weight: .bold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.appGold)
                        .foregroundStyle(Color(red: 0.04, green: 0.09, blue: 0.16))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }

                Button("閉じる") { dismiss() }
                    .font(.system(size: 14))
                    .foregroundStyle(Color.white.opacity(0.4))
            }
            .padding(.horizontal, 28)
            .padding(.top, 32)
        }
    }
}
