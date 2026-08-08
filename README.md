# 📰 Readify — Broadsheet Gazette & Letterpress eReader (APK & Web)

> A vintage 19th-century broadsheet newspaper and letterpress print shop styled eBook reader & audiobook application for Android and Web.

![Readify Letterpress Icon](assets/icon.jpg)

---

## 🌟 Key Features

1. **Broadsheet Newspaper & Letterpress Print Shop Aesthetic**:
   - **Themes**: Aged Newsprint Paper (`#F6F2E8`), Warm Parchment (`#F3E5C8`), and Midnight Printing Press Night Edition (`#12100E`).
   - **Typography**: Google Fonts (*UnifrakturMaguntia* Gothic Blackletter masthead, *Playfair Display* news headlines, *Newsreader* / *Lora* body serif, and *Courier Prime* typewriter details).
   - **Tactile UI Elements**: Double ink rule borders, drop-cap first letters, mechanical pressed buttons, woodblock badges, classified ads sidebar, and ribbon bookmark progress.

2. **Multi-Format Document Parsing**:
   - **PDF Parsing**: Powered by Mozilla's open-source **PDF.js** (from GitHub). Renders crisp pages on canvas with text selection and text block extraction for Text-to-Speech.
   - **EPUB Parsing**: Powered by Futurepress **ePub.js** (from GitHub). Renders `.epub` archives, dynamic chapter pagination, table of contents, and reflowable typography.
   - **TXT / Markdown / HTML / FB2**: Native clean text processing with automatic paragraph chunking into multi-column broadsheet pages.

3. **Text-to-Speech (TTS) Audiobook Engine**:
   - Integrated Web Speech API (`SpeechSynthesis`) with support for Android system voices.
   - Vintage Phonograph Audio Deck controls: Play, Pause, Resume, Stop, Next/Prev Sentence, Speed Dial (`0.75x` – `2.0x`), Voice Selector, and live sentence highlighting on the broadsheet stage.

4. **Library & Persistence**:
   - Offline file caching using IndexedDB and LocalStorage.
   - Pre-loaded broadsheet classics (*The Sherlock Holmes Gazette*, *Alice in Wonderland*).

---

## 📱 Compiling into an Android APK

This application is built with standard web technologies and configured with **Capacitor CLI** for instant Android APK compilation.

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Add Android Platform & Build APK
```bash
# Add Android native platform
npx cap add android

# Copy web assets into Android project
npx cap copy android

# Open project in Android Studio to build APK or run via Gradle
npx cap open android
```

In Android Studio:
- Select **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
- Your Android APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🌐 Tracking Project on GitHub

To track this project on your GitHub account:

```bash
# Initialize git (already performed locally)
git init

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/readify-broadsheet.git

# Rename branch to main
git branch -M main

# Commit and push
git add .
git commit -m "feat: initial release of Readify Broadsheet Gazette eReader"
git push -u origin main
```

---

## 📁 Project Architecture

```
readify/
├── index.html                 # Broadsheet Gazette HTML Shell & Markup
├── css/
│   └── styles.css             # Broadsheet & Letterpress Design System
├── js/
│   ├── app.js                 # Main Application Controller & UI Binder
│   ├── reader.js              # Broadsheet Reader Stage & Pagination
│   ├── pdf-handler.js         # Mozilla PDF.js Parsing Engine
│   ├── epub-handler.js        # Futurepress ePub.js Parsing Engine
│   ├── tts-engine.js          # SpeechSynthesis Audiobook Engine
│   └── library.js             # IndexedDB & LocalStorage Book Persistence
├── assets/
│   ├── icon.jpg               # Woodcut Letterpress Icon
│   └── masthead.jpg           # Broadsheet Banner Decoration
├── capacitor.config.json      # Capacitor Configuration for Android APK
├── package.json               # NPM Package Manifest
├── .gitignore                 # Git ignore file
└── README.md                  # Project Documentation
```

---

## 📄 License
Licensed under the [MIT License](LICENSE).
