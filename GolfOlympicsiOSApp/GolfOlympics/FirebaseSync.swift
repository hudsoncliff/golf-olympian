import FirebaseDatabase
import Observation

private let dbURL = "https://golfonigiri-46bfa-default-rtdb.asia-southeast1.firebasedatabase.app"

struct RoomSnapshot {
    let players: [Player]
    let holeResults: [HoleResult]
    let currentHole: Int
    let isFinished: Bool
}

@Observable
class FirebaseSync {
    var roomId: String?
    var snapshot: RoomSnapshot?
    var isObserver = false

    private var ref: DatabaseReference?
    private var handle: DatabaseHandle?

    // MARK: - Host

    func startHosting(session: GameSession) -> String {
        let id = Self.generateId()
        roomId = id
        ref = Database.database(url: dbURL).reference().child("rooms").child(id)
        return id
    }

    func push(session: GameSession, finished: Bool = false) {
        guard let ref else { return }
        ref.setValue(encode(session: session, holeResults: session.holeResults, finished: finished))
    }

    // draft を含む現在の入力状態をリアルタイムで同期する
    func pushWithDraft(_ draft: HoleResult, session: GameSession) {
        guard let ref else { return }
        var results = session.holeResults
        results[session.currentHole - 1] = draft
        ref.setValue(encode(session: session, holeResults: results, finished: false))
    }

    func stopHosting() {
        ref?.removeValue()
        ref = nil
        roomId = nil
    }

    // MARK: - Observer

    func startObserving(roomId: String) {
        self.roomId = roomId
        self.isObserver = true
        let r = Database.database(url: dbURL).reference().child("rooms").child(roomId)
        ref = r
        handle = r.observe(.value) { [weak self] snap in
            self?.snapshot = self?.decode(snap)
        }
    }

    func stopObserving() {
        if let h = handle { ref?.removeObserver(withHandle: h) }
        handle = nil
        ref = nil
        roomId = nil
        isObserver = false
        snapshot = nil
    }

    // MARK: - Room ID

    static func generateId() -> String {
        let chars = Array("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
        return String((0..<6).map { _ in chars.randomElement()! })
    }

    // MARK: - Encoding

    private func encode(session: GameSession, holeResults: [HoleResult], finished: Bool) -> [String: Any] {
        [
            "players":     session.players.map { ["id": $0.id.uuidString, "name": $0.name] },
            "holeResults": holeResults.map { encodeHole($0) },
            "currentHole": session.currentHole,
            "status":      finished ? "finished" : "playing"
        ]
    }

    private func encodeHole(_ hole: HoleResult) -> [String: Any] {
        // diamonds・saoichi はオブジェクト形式 {"uuid": true} で送る
        // 配列形式だと Firebase が {"0": "uuid"} に変換し、JS 側で正しく読めない
        var d: [String: Any] = [
            "holeNumber": hole.holeNumber,
            "medals":   Dictionary(uniqueKeysWithValues: hole.medals.map { ($0.key.uuidString, $0.value.key) }),
            "diamonds": Dictionary(uniqueKeysWithValues: hole.diamonds.map { ($0.uuidString, true) }),
            "saoichi":  Dictionary(uniqueKeysWithValues: hole.saoichi.map { ($0.uuidString, true) })
        ]
        if let n = hole.neapin { d["neapin"] = n.uuidString }
        return d
    }

    // MARK: - Decoding

    private func decode(_ snap: DataSnapshot) -> RoomSnapshot? {
        guard let d = snap.value as? [String: Any] else { return nil }

        guard let playersRaw = d["players"] as? [[String: Any]] else { return nil }
        let players: [Player] = playersRaw.compactMap {
            guard let idStr = $0["id"] as? String,
                  let id   = UUID(uuidString: idStr),
                  let name = $0["name"] as? String else { return nil }
            return Player(id: id, name: name)
        }

        let rawHoles = d["holeResults"] as? [Any] ?? []
        let holeResults: [HoleResult] = rawHoles.enumerated().map { idx, raw in
            decodeHole(raw as? [String: Any] ?? [:], number: idx + 1)
        }

        return RoomSnapshot(
            players: players,
            holeResults: holeResults,
            currentHole: d["currentHole"] as? Int ?? 1,
            isFinished: (d["status"] as? String) == "finished"
        )
    }

    private func decodeHole(_ d: [String: Any], number: Int) -> HoleResult {
        var hole = HoleResult(holeNumber: number)

        if let medalsDict = d["medals"] as? [String: String] {
            for (idStr, key) in medalsDict {
                if let id = UUID(uuidString: idStr), let medal = Medal.from(key: key) {
                    hole.medals[id] = medal
                }
            }
        }
        // オブジェクト形式 {"uuid": true} を優先、旧配列形式も後方互換で対応
        if let dict = d["diamonds"] as? [String: Any] {
            hole.diamonds = Set(dict.keys.compactMap { UUID(uuidString: $0) })
        } else if let arr = d["diamonds"] as? [String] {
            hole.diamonds = Set(arr.compactMap { UUID(uuidString: $0) })
        }
        if let dict = d["saoichi"] as? [String: Any] {
            hole.saoichi = Set(dict.keys.compactMap { UUID(uuidString: $0) })
        } else if let arr = d["saoichi"] as? [String] {
            hole.saoichi = Set(arr.compactMap { UUID(uuidString: $0) })
        }
        if let s = d["neapin"] as? String {
            hole.neapin = UUID(uuidString: s)
        }
        return hole
    }
}
