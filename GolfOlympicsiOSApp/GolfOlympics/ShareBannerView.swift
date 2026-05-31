import SwiftUI
import CoreImage.CIFilterBuiltins

// MARK: - QR Code

struct QRCodeView: View {
    let url: URL

    private var qrImage: UIImage {
        let context = CIContext()
        let filter  = CIFilter.qrCodeGenerator()
        filter.message         = Data(url.absoluteString.utf8)
        filter.correctionLevel = "M"
        guard let output = filter.outputImage else { return UIImage() }
        let scaled = output.transformed(by: CGAffineTransform(scaleX: 10, y: 10))
        guard let cgImage = context.createCGImage(scaled, from: scaled.extent) else { return UIImage() }
        return UIImage(cgImage: cgImage)
    }

    var body: some View {
        Image(uiImage: qrImage)
            .interpolation(.none)
            .resizable()
            .scaledToFit()
            .frame(width: 140, height: 140)
            .padding(10)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Share Button（ホール画面右上）

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

// MARK: - Share Modal

struct ShareModalView: View {
    let roomId: String
    @Environment(\.dismiss) private var dismiss

    private var shareURL: URL {
        URL(string: "https://hudsoncliff.github.io/golf-olympian/#\(roomId)")!
    }

    var body: some View {
        ZStack {
            Color(red: 0.04, green: 0.09, blue: 0.15)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                Text("📱 参加者に共有する")
                    .sectionTitleStyle()

                // ルームコード
                VStack(spacing: 6) {
                    Text("ルームコード")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.white.opacity(0.5))
                    Text(roomId)
                        .font(.system(size: 36, weight: .bold, design: .monospaced))
                        .tracking(8)
                        .foregroundStyle(Color.appGold)
                }

                // QR コード
                VStack(spacing: 8) {
                    QRCodeView(url: shareURL)
                    Text("カメラで読み取るとWebで観戦できます")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.white.opacity(0.45))
                }

                // 共有ボタン
                ShareLink(item: shareURL, subject: Text("ONIGIRI")) {
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
