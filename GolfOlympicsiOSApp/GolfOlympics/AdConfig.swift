import Foundation

/// AdMob の各種IDを一元管理する。
///
/// ⚠️ 本番リリース前に以下2か所を実際のIDへ差し替えること:
///   1. `appID`         … Info.plist の `GADApplicationIdentifier` と一致させる
///   2. `bannerUnitID`  … `#else`（Release）側の本番バナーユニットID
///
/// DEBUG ビルドでは Google 公式のテストIDを使用する。
/// （自分のアプリで本番広告を自分でタップするとポリシー違反になるため、
///   開発・動作確認中は必ずテストIDを使う）
enum AdConfig {

    /// AdMob アプリID。Info.plist の `GADApplicationIdentifier` と必ず一致させる。
    /// TODO: 本番のアプリID（ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY）へ差し替え
    static let appID = "ca-app-pub-3940256099942544~1458002511" // ← Google公式テスト用

    /// バナー広告ユニットID
    static var bannerUnitID: String {
        #if DEBUG
        // Google 公式テスト用バナー（常にテスト広告が表示される）
        return "ca-app-pub-3940256099942544/2934735716"
        #else
        // TODO: 本番のバナー広告ユニットID（ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ）へ差し替え
        return "ca-app-pub-3940256099942544/2934735716"
        #endif
    }
}
