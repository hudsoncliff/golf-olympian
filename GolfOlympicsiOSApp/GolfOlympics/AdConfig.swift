import Foundation

/// AdMob のバナー広告ユニットIDを提供する。
///
/// - DEBUG ビルド   : Google 公式のテストIDを使用（公開定数なのでハードコードして問題ない）
/// - Release ビルド : Info.plist 経由で注入された本番IDを使用
///                    （Config.xcconfig のデフォルト → Secrets.xcconfig で上書き）
///
/// 本番IDはリポジトリにコミットせず、`Secrets.xcconfig`（.gitignore 済み）で管理する。
/// アプリID（GADApplicationIdentifier）も同様に Info.plist へ `$(ADMOB_APP_ID)` で注入され、
/// SDK が起動時に直接読み取るため、ここでは扱わない。
enum AdConfig {

    /// バナー広告ユニットID
    static var bannerUnitID: String {
        #if DEBUG
        // Google 公式テスト用バナー（常にテスト広告が表示される）
        return "ca-app-pub-3940256099942544/2934735716"
        #else
        // Info.plist の GADBannerAdUnitID（= ADMOB_BANNER_UNIT_ID）から読み取る
        return Bundle.main.object(forInfoDictionaryKey: "GADBannerAdUnitID") as? String ?? ""
        #endif
    }
}
