# WytNet Android APK Build Instructions

## 🚀 Quick Start - Two Options Available

### Option 1: Install PWA Directly (IMMEDIATE - No APK needed)
1. Open https://wytnet.com on your Android device
2. In Chrome/Edge: Tap the menu (⋮) → "Add to Home screen" or "Install app"
3. The app will install like a native app with full functionality

### Option 2: Build Android APK (Full Native App)

## Prerequisites
- Node.js 16+ with npm
- Java Development Kit (JDK 17+)
- Android SDK with build-tools
- Android Studio (recommended) or command line tools

## Step 1: Clone/Setup
```bash
# All files are already configured in your project
# twa-config.json - TWA configuration
# public/.well-known/assetlinks.json - Domain verification
```

## Step 2: Install Dependencies
```bash
npm install -g @bubblewrap/cli
```

## Step 3: Generate Android Project
```bash
# From project root directory
npx @bubblewrap/cli init --manifest https://wytnet.com/manifest.json

# Or use the existing config:
npx @bubblewrap/cli init --config ./twa-config.json
```

## Step 4: Generate Signing Key
```bash
# Generate Android signing keystore
keytool -genkey -v -keystore android.keystore -alias wytnet-key -keyalg RSA -keysize 2048 -validity 10000

# Note the keystore password and key password
```

## Step 5: Update Asset Links
```bash
# Get the SHA256 fingerprint of your key
keytool -list -v -keystore android.keystore -alias wytnet-key

# Copy the SHA256 fingerprint and update:
# public/.well-known/assetlinks.json (replace PLACEHOLDER_SHA256_FINGERPRINT)
```

## Step 6: Build APK
```bash
# Build the APK
npx @bubblewrap/cli build

# The APK will be generated in the project directory
```

## Step 7: Install & Test
```bash
# Install on connected Android device via ADB
adb install app-release-signed.apk

# Or transfer the APK file to your device and install manually
```

## 📱 App Features in APK
- ✅ Full native Android app experience
- ✅ Home screen icon and splash screen
- ✅ Offline functionality via service worker
- ✅ Push notifications capability
- ✅ Android back button support
- ✅ Native sharing integration
- ✅ App shortcuts (Assessment, Dashboard)
- ✅ Full-screen immersive mode

## 🔧 Configuration Details
- **Package ID**: com.wytnet.twa
- **App Name**: WytNet
- **Version**: 1.0.0 (Code: 1)
- **Target URL**: https://wytnet.com
- **Theme Color**: #3b82f6 (Blue)
- **Background**: #ffffff (White)

## 🆔 Test Credentials
**Mobile Login:**
- Phone: +1234567890
- Password: test123

**Social Login:**
- Use "Continue with Google" or "Continue with Facebook"

## 🛠 Troubleshooting
1. **Build fails**: Ensure JAVA_HOME is set correctly
2. **Signing issues**: Verify keystore path and passwords
3. **Install fails**: Enable "Unknown sources" in Android settings
4. **App crashes**: Check Chrome WebView is updated on device

## 🌐 Alternative: PWA Installation
For immediate testing without APK build:
1. Visit https://wytnet.com on Android
2. Chrome will show "Add WytNet to Home screen" banner
3. Tap "Add" to install as PWA - works like native app!