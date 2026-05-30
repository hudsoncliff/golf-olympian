import Foundation

struct HoleResult: Codable {
    let holeNumber: Int
    var medals:   [UUID: Medal]
    var diamonds: Set<UUID>
    var saoichi:  Set<UUID>
    var neapin:   UUID?

    init(holeNumber: Int) {
        self.holeNumber = holeNumber
        self.medals   = [:]
        self.diamonds = []
        self.saoichi  = []
        self.neapin   = nil
    }

    // MARK: - Score

    func points(for playerID: UUID, config: PointConfig = PointConfig()) -> Int {
        var pts = 0
        if diamonds.contains(playerID) {
            pts += config.diamond
        } else if let medal = medals[playerID] {
            pts += config.medalPoints(medal)
            if saoichi.contains(playerID) { pts += config.saoichiBonus }
        }
        if neapin == playerID { pts += config.neapin }
        return pts
    }

    // ダイヤ取得者を除いた残りプレイヤー数に応じて使用可能メダルを決定
    func availableMedals(playerCount: Int) -> [Medal] {
        Medal.keys(for: playerCount - diamonds.count)
    }

    // MARK: - Mutations

    mutating func selectMedal(_ medal: Medal, for playerID: UUID) {
        let hadThis = medals[playerID] == medal
        // 同じメダルを持つ全プレイヤーから除去（排他制御）
        medals = medals.filter { $0.value != medal }
        if !hadThis {
            medals[playerID] = medal  // 再タップで解除、そうでなければ付与（既存メダルを上書き）
        }
    }

    mutating func toggleDiamond(for playerID: UUID, playerCount: Int) {
        if diamonds.contains(playerID) {
            diamonds.remove(playerID)
        } else {
            diamonds.insert(playerID)
            medals.removeValue(forKey: playerID)
            // ダイヤ追加で使用可能メダルが1つ減るため、範囲外になったメダルを他プレイヤーからも除去
            let valid = Set(availableMedals(playerCount: playerCount))
            medals = medals.filter { valid.contains($0.value) }
        }
    }

    mutating func toggleSaoichi(for playerID: UUID) {
        if saoichi.contains(playerID) {
            saoichi.remove(playerID)
        } else {
            saoichi.insert(playerID)
        }
    }

    mutating func selectNeapin(for playerID: UUID) {
        neapin = (neapin == playerID) ? nil : playerID  // ラジオ選択（1人のみ）
    }
}
