import Foundation
import Observation

@Observable
class GameSession {
    var players:     [Player]     = []
    var holeResults: [HoleResult] = []
    var currentHole: Int          = 1
    var pointConfig: PointConfig  = PointConfig()

    func setup(players: [Player], config: PointConfig = AppSettings.pointConfig) {
        self.players     = players
        self.holeResults = (1...18).map { HoleResult(holeNumber: $0) }
        self.currentHole = 1
        self.pointConfig = config
    }

    // MARK: - Score

    func totalScore(for playerID: UUID) -> Int {
        holeResults.reduce(0) { $0 + $1.points(for: playerID, config: pointConfig) }
    }

    // 精算点 = 自分のpt × (人数-1) − 他全員のptの合計
    func finalScore(for playerID: UUID) -> Int {
        let myPts = totalScore(for: playerID)
        let n     = players.count
        let total = players.reduce(0) { $0 + totalScore(for: $1.id) }
        return myPts * (n - 1) - (total - myPts)
    }

    func rankedPlayers() -> [(player: Player, score: Int, rank: Int)] {
        let sorted = players
            .map { ($0, totalScore(for: $0.id)) }
            .sorted { $0.1 > $1.1 }
        var rank = 1
        return sorted.enumerated().map { i, pair in
            if i > 0 && pair.1 < sorted[i - 1].1 { rank = i + 1 }
            return (pair.0, pair.1, rank)
        }
    }
}
