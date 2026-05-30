import SwiftUI

enum AppScreen: Equatable {
    case home, roundSetup, hole, result, observe, settings
}

struct ContentView: View {
    @State private var screen: AppScreen = .home
    @State private var session = GameSession()
    @State private var sync    = FirebaseSync()

    var body: some View {
        ZStack {
            AppBackground()
                .ignoresSafeArea()

            switch screen {
            // ── ホーム ─────────────────────────────────────────
            case .home:
                HomeView(
                    onStartRound: { screen = .roundSetup },
                    onSettings:   { screen = .settings },
                    onJoin: { roomId in
                        sync.startObserving(roomId: roomId)
                        screen = .observe
                    }
                )

            // ── ラウンド設定 ────────────────────────────────────
            case .roundSetup:
                RoundSetupView(
                    onStart: { players in
                        session = GameSession()
                        session.setup(players: players)
                        let _ = sync.startHosting(session: session)
                        sync.push(session: session)
                        screen = .hole
                    },
                    onBack: { screen = .home }
                )

            // ── ホール入力 ──────────────────────────────────────
            case .hole:
                HoleInputView(
                    session:  session,
                    roomId:   sync.roomId,
                    onFinish: {
                        sync.push(session: session, finished: true)
                        screen = .result
                    },
                    onHoleSaved: {
                        sync.push(session: session)
                    },
                    onQuit: {
                        sync.stopHosting()
                        screen = .home
                    }
                )

            // ── 結果 ───────────────────────────────────────────
            case .result:
                ResultView(session: session) {
                    session.currentHole = 18
                    screen = .hole
                } onNewGame: {
                    sync.stopHosting()
                    screen = .home
                }

            // ── 観戦 ───────────────────────────────────────────
            case .observe:
                ObserverView(
                    roomId:   sync.roomId ?? "",
                    snapshot: sync.snapshot,
                    onLeave:  {
                        sync.stopObserving()
                        screen = .home
                    }
                )

            // ── 設定 ───────────────────────────────────────────
            case .settings:
                SettingsView(onBack: { screen = .home })
            }
        }
        .animation(.easeInOut(duration: 0.25), value: screen)
    }
}
