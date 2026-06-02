import SwiftUI
import FirebaseCore
import GoogleMobileAds
import AppTrackingTransparency

@main
struct GolfOlympicsApp: App {
    @Environment(\.scenePhase) private var scenePhase
    @State private var didInitializeAds = false

    init() {
        // Debug/Releaseで異なるGoogleService-Info.plistを読み込む
        #if DEBUG
        let plistName = "GoogleService-Info-Debug"
        #else
        let plistName = "GoogleService-Info"
        #endif
        if let filePath = Bundle.main.path(forResource: plistName, ofType: "plist"),
           let options = FirebaseOptions(contentsOfFile: filePath) {
            FirebaseApp.configure(options: options)
        } else {
            FirebaseApp.configure()
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onChange(of: scenePhase) { _, phase in
                    guard phase == .active, !didInitializeAds else { return }
                    didInitializeAds = true
                    Task { await requestTrackingThenStartAds() }
                }
        }
    }

    /// ATT（App Tracking Transparency）の許可ダイアログを表示してから AdMob を初期化する。
    /// ダイアログはアプリがアクティブな時しか表示されないため、初回アクティブ時にのみ実行する。
    /// 許可・拒否いずれの場合も広告は表示する（拒否時は非パーソナライズ広告となる）。
    private func requestTrackingThenStartAds() async {
        _ = await ATTrackingManager.requestTrackingAuthorization()
        MobileAds.shared.start(completionHandler: nil)
    }
}
