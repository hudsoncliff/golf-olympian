import SwiftUI

enum AppScreen: Equatable {
    case start, hole, result, observe
}

struct ContentView: View {
    @State private var screen: AppScreen = .start
    @State private var session = GameSession()
    @State private var sync = FirebaseSync()

    var body: some View {
        ZStack {
            AppBackground()
                .ignoresSafeArea()

            switch screen {
            case .start:
                StartView(
                    onStart: { players in
                        session = GameSession()
                        session.setup(players: players)
                        let roomId = sync.startHosting(session: session)
                        sync.push(session: session)
                        _ = roomId
                        screen = .hole
                    },
                    onJoin: { roomId in
                        sync.startObserving(roomId: roomId)
                        screen = .observe
                    }
                )

            case .hole:
                ScrollView {
                    VStack(spacing: 12) {
                        if let roomId = sync.roomId {
                            ShareBannerView(roomId: roomId)
                        }
                        HoleInputView(
                            session: session,
                            onFinish: {
                                sync.push(session: session, finished: true)
                                screen = .result
                            },
                            onHoleSaved: {
                                sync.push(session: session)
                            },
                            onQuit: {
                                sync.stopHosting()
                                screen = .start
                            }
                        )
                    }
                }

            case .result:
                ResultView(session: session) {
                    session.currentHole = 18
                    screen = .hole
                } onNewGame: {
                    sync.stopHosting()
                    screen = .start
                }

            case .observe:
                ObserverView(
                    roomId: sync.roomId ?? "",
                    snapshot: sync.snapshot,
                    onLeave: {
                        sync.stopObserving()
                        screen = .start
                    }
                )
            }
        }
        .animation(.easeInOut(duration: 0.25), value: screen)
    }
}
