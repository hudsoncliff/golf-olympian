import SwiftUI
import GoogleMobileAds

/// 画面下部に表示する AdMob バナー広告。
/// SwiftUI から UIKit の `BannerView` をラップして使う。
///
/// Google Mobile Ads SDK v12 以降の API 名（GADプレフィックスなし）に準拠。
struct BannerAdView: UIViewRepresentable {

    func makeUIView(context: Context) -> BannerView {
        let banner = BannerView(adSize: AdSizeBanner) // 標準バナー 320x50
        banner.adUnitID = AdConfig.bannerUnitID
        banner.rootViewController = Self.rootViewController
        banner.load(Request())
        return banner
    }

    func updateUIView(_ uiView: BannerView, context: Context) {}

    /// 広告表示に必要なルートビューコントローラを取得する。
    private static var rootViewController: UIViewController? {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first { $0.activationState == .foregroundActive }?
            .keyWindow?
            .rootViewController
    }
}
