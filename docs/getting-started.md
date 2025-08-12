# Getting Started with Yiiva Development

## 🚀 Quick Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** or **Android Emulator** (or physical device)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yiiva-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your platform**
   - **iOS**: Press `i` or scan QR code with Expo Go app
   - **Android**: Press `a` or scan QR code with Expo Go app
   - **Web**: Press `w` for web preview

## 🛠️ Development Commands

```bash
# Start development server
npm run start

# Platform-specific runs
npm run ios      # iOS simulator
npm run android  # Android emulator  
npm run web      # Web browser

# Code quality
npm run lint     # Run ESLint checks

# Project management
npm run reset-project  # Reset to blank template
```

## 📱 Platform Setup

### iOS Development
1. Install Xcode from App Store
2. Open Xcode and install iOS Simulator
3. Run `npx expo start` and press `i`

### Android Development
1. Install Android Studio
2. Set up Android Virtual Device (AVD)
3. Run `npx expo start` and press `a`

### Physical Device Testing
1. Install Expo Go app from App Store/Play Store
2. Scan QR code from development server
3. Shake device to access developer menu

## 🏗️ Project Structure

```
yiiva-app/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab navigation screens
│   ├── artist/            # Artist profile pages
│   └── video-player.tsx   # Full-screen video
├── components/            # Reusable UI components
├── constants/             # App constants and colors
├── hooks/                 # Custom React hooks
├── assets/               # Images, fonts, icons
└── docs/                 # Documentation (you are here!)
```

## 🔧 Environment Setup

### VS Code Extensions (Recommended)
- **ES7+ React/Redux Snippets**
- **TypeScript Importer**
- **Expo Tools**
- **ESLint**
- **Prettier**

### Development Workflow
1. Create feature branch from `main`
2. Make changes and test on multiple platforms
3. Run `npm run lint` to check code quality
4. Submit pull request with clear description
5. Code review and merge

## 🐛 Common Issues & Solutions

### Metro bundler issues
```bash
npx expo start --clear
```

### iOS simulator not opening
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### Android emulator connection
```bash
adb reverse tcp:8081 tcp:8081
```

### Node modules issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Helpful Resources

- **[Expo Documentation](https://docs.expo.dev/)**
- **[React Native Documentation](https://reactnative.dev/docs/getting-started)**
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**
- **[Expo Router Guide](https://docs.expo.dev/router/introduction/)**

## 🤝 Getting Help

- **Technical Issues**: Check [Known Issues](./known-issues.md)
- **Feature Questions**: See feature-specific documentation in `features/`
- **Contributing**: Read [Contributing Guidelines](./contributing.md)
- **Code Standards**: Follow [Code Standards](./code-standards.md)

---

*Next: Learn about the [Technical Architecture](./technical-architecture.md)*