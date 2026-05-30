import SwiftUI
import FirebaseCore

@main
struct GolfOlympicsApp: App {
    init() {
        FirebaseApp.configure()
    }
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
