import SwiftUI

enum Medal: Int, CaseIterable, Codable, Identifiable {
    case gold   = 4
    case silver = 3
    case bronze = 2
    case iron   = 1

    var id: Int { rawValue }

    var label: String {
        switch self {
        case .gold:   return "🥇 金"
        case .silver: return "🥈 銀"
        case .bronze: return "🥉 銅"
        case .iron:   return "🪨 鉄"
        }
    }

    var emoji: String {
        switch self {
        case .gold:   return "🥇"
        case .silver: return "🥈"
        case .bronze: return "🥉"
        case .iron:   return "🪨"
        }
    }

    var color: Color {
        switch self {
        case .gold:   return Color(red: 0.96, green: 0.65, blue: 0.14)
        case .silver: return Color(red: 0.61, green: 0.61, blue: 0.61)
        case .bronze: return Color(red: 0.77, green: 0.48, blue: 0.17)
        case .iron:   return Color(red: 0.38, green: 0.49, blue: 0.55)
        }
    }

    // 上位 count 個のメダルを返す（gold→silver→bronze→iron の順）
    static func keys(for count: Int) -> [Medal] {
        Array([.gold, .silver, .bronze, .iron].prefix(max(0, count)))
    }

    // Firebase 用のキー文字列
    var key: String {
        switch self {
        case .gold:   return "gold"
        case .silver: return "silver"
        case .bronze: return "bronze"
        case .iron:   return "iron"
        }
    }

    static func from(key: String) -> Medal? {
        switch key {
        case "gold":   return .gold
        case "silver": return .silver
        case "bronze": return .bronze
        case "iron":   return .iron
        default:       return nil
        }
    }
}
