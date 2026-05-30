import SwiftUI

enum AppScreen {
    case start, hole, result
}

struct ContentView: View {
    @State private var screen: AppScreen = .start
    @State private var session = GameSession()

    var body: some View {
        ZStack {
            AppBackground()
                .ignoresSafeArea()

            switch screen {
            case .start:
                StartView { players in
                    session = GameSession()
                    session.setup(players: players)
                    screen = .hole
                }
            case .hole:
                HoleInputView(session: session) {
                    screen = .result
                }
            case .result:
                ResultView(session: session) {
                    session.currentHole = 18
                    screen = .hole
                } onNewGame: {
                    screen = .start
                }
            }
        }
        .animation(.easeInOut(duration: 0.25), value: screen)
    }
}
