import Foundation

// MARK: - PointConfig

struct PointConfig: Codable {
    var gold:         Int = 4
    var silver:       Int = 3
    var bronze:       Int = 2
    var iron:         Int = 1
    var diamond:      Int = 5
    var saoichiBonus: Int = 3
    var neapin:       Int = 2

    func medalPoints(_ medal: Medal) -> Int {
        switch medal {
        case .gold:   return gold
        case .silver: return silver
        case .bronze: return bronze
        case .iron:   return iron
        }
    }
}

// MARK: - AppSettings

enum AppSettings {
    private static let defaults = UserDefaults.standard

    static var userName: String {
        get { defaults.string(forKey: "userName") ?? "" }
        set { defaults.set(newValue, forKey: "userName") }
    }

    static var defaultRate: Int {
        get {
            let stored = defaults.integer(forKey: "defaultRate")
            return stored == 0 ? 100 : stored
        }
        set { defaults.set(newValue, forKey: "defaultRate") }
    }

    static var currencyUnit: String {
        get { defaults.string(forKey: "currencyUnit") ?? "円" }
        set { defaults.set(newValue, forKey: "currencyUnit") }
    }

    static var pointConfig: PointConfig {
        get {
            guard let data = defaults.data(forKey: "pointConfig"),
                  let config = try? JSONDecoder().decode(PointConfig.self, from: data)
            else { return PointConfig() }
            return config
        }
        set {
            if let data = try? JSONEncoder().encode(newValue) {
                defaults.set(data, forKey: "pointConfig")
            }
        }
    }
}
