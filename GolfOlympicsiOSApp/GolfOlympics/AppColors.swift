import SwiftUI

// MARK: - Colors

extension Color {
    static let appGold    = Color(red: 0.96, green: 0.65, blue: 0.14)
    static let appDiamond = Color(red: 0.39, green: 0.83, blue: 0.97)
    static let appSaoichi = Color(red: 0.65, green: 0.55, blue: 0.98)
    static let appNeapin  = Color(red: 0.20, green: 0.83, blue: 0.60)
}

// MARK: - Background

struct AppBackground: View {
    var body: some View {
        LinearGradient(
            colors: [
                Color(red: 0.35, green: 0.70, blue: 0.88),  // 晴天の青空
                Color(red: 0.13, green: 0.48, blue: 0.72),  // 深みのある青空
                Color(red: 0.10, green: 0.50, blue: 0.28),  // フェアウェイグリーン
                Color(red: 0.04, green: 0.28, blue: 0.12),  // ディープグリーン
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
    }
}

// MARK: - Screen Header（戻る矢印 + タイトル）

struct ScreenHeader: View {
    let title: String
    var onBack: (() -> Void)? = nil

    var body: some View {
        HStack {
            if let onBack {
                Button { onBack() } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(Color.white)
                }
                .frame(width: 28)
            } else {
                Color.clear.frame(width: 28, height: 1)
            }
            Spacer()
            Text(title)
                .font(.system(size: 16, weight: .bold))
                .foregroundStyle(Color.white)
            Spacer()
            Color.clear.frame(width: 28, height: 1)
        }
        .padding(.top, 16)
        .padding(.bottom, 4)
    }
}

// MARK: - App Header（ホーム・結果画面のタイトル）

struct AppHeader: View {
    var body: some View {
        VStack(spacing: 4) {
            Text("⛳️ ONIGIRI")
                .font(.system(size: 22, weight: .bold))
                .tracking(4)
                .foregroundStyle(Color.appGold)
                .shadow(color: Color.black.opacity(0.5), radius: 4, x: 0, y: 2)
                .shadow(color: Color.appGold.opacity(0.3), radius: 10)
            Text("SCORE TRACKER")
                .font(.system(size: 10))
                .tracking(6)
                .foregroundStyle(Color.white.opacity(0.85))
                .shadow(color: Color.black.opacity(0.5), radius: 3, x: 0, y: 1)
        }
        .padding(.vertical, 20)
    }
}

// MARK: - TextField

struct AppTextField: View {
    var placeholder: String
    @Binding var text: String
    var keyboard: UIKeyboardType = .default

    var body: some View {
        TextField("", text: $text, prompt:
            Text(placeholder).foregroundColor(.white.opacity(0.55))
        )
            .keyboardType(keyboard)
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(Color.white.opacity(0.06))
            .foregroundStyle(Color.white.opacity(0.85))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.appGold.opacity(0.3), lineWidth: 1)
            )
    }
}

// MARK: - ViewModifiers

extension View {
    func cardStyle() -> some View {
        self
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color(red: 0.02, green: 0.07, blue: 0.12).opacity(0.82))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Color.white.opacity(0.14), lineWidth: 1)
            )
    }

    func sectionTitleStyle() -> some View {
        self
            .font(.system(size: 11, weight: .semibold))
            .tracking(2)
            .foregroundStyle(Color.appGold)
            .textCase(.uppercase)
    }
}

// MARK: - Button Styles

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .bold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(
                LinearGradient(
                    colors: [Color.appGold, Color(red: 0.91, green: 0.58, blue: 0.11)],
                    startPoint: .topLeading, endPoint: .bottomTrailing
                )
            )
            .foregroundStyle(Color(red: 0.04, green: 0.09, blue: 0.16))
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .bold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.white.opacity(0.07))
            .foregroundStyle(Color.white.opacity(0.85))
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct DangerButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .bold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.red.opacity(0.15))
            .foregroundStyle(Color(red: 1, green: 0.54, blue: 0.54))
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.red.opacity(0.3), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct CountButtonStyle: ButtonStyle {
    var selected: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(selected ? Color.appGold.opacity(0.2) : Color.clear)
            .foregroundStyle(selected ? Color.appGold : Color.white.opacity(0.7))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(selected ? Color.appGold : Color.appGold.opacity(0.3), lineWidth: 1)
            )
    }
}

struct SpecialToggleStyle: ButtonStyle {
    var isSelected: Bool
    var color: Color

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 13, weight: isSelected ? .bold : .regular))
            .padding(.horizontal, 13)
            .padding(.vertical, 9)
            .background(isSelected ? color : Color.white.opacity(0.05))
            .foregroundStyle(isSelected ? Color.white : Color.white.opacity(0.4))
            .clipShape(RoundedRectangle(cornerRadius: 9))
            .overlay(
                RoundedRectangle(cornerRadius: 9)
                    .stroke(isSelected ? color : Color.white.opacity(0.12), lineWidth: isSelected ? 2 : 1)
            )
            .shadow(color: isSelected ? color.opacity(0.55) : .clear, radius: 8, x: 0, y: 2)
            .scaleEffect(configuration.isPressed ? 0.95 : 1)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct MedalButtonStyle: ButtonStyle {
    var selected: Bool
    var color: Color

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 13, weight: selected ? .bold : .regular))
            .padding(.horizontal, 13)
            .padding(.vertical, 9)
            .background(selected ? color : Color.white.opacity(0.05))
            .foregroundStyle(selected ? Color.white : Color.white.opacity(0.5))
            .clipShape(RoundedRectangle(cornerRadius: 9))
            .overlay(
                RoundedRectangle(cornerRadius: 9)
                    .stroke(selected ? color : Color.white.opacity(0.12), lineWidth: selected ? 2 : 1)
            )
            .shadow(color: selected ? color.opacity(0.55) : .clear, radius: 8, x: 0, y: 2)
            .scaleEffect(configuration.isPressed ? 0.95 : 1)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}
