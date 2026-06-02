import SwiftUI
import FirebaseCore
import GoogleMobileAds

@main
struct GolfOlympicsApp: App {
    init() {
        FirebaseApp.configure()
        MobileAds.shared.start(completionHandler: nil)
    }
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
