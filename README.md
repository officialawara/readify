# 📰 Readify — Broadsheet Gazette & Letterpress eReader

> A vintage 19th-century broadsheet newspaper and letterpress print shop styled eBook reader & audiobook application for Android and Web.

![Readify Letterpress Emblem](assets/icon.jpg)

---

## 🌐 Try Live Web App (Instant Browser Demo)

Click the link below to open and test the application directly in your web browser (Phone, Tablet, or PC) — no installation required!

👉 **[Launch Readify Live Web Gazette (https://officialawara.github.io/readify/)](https://officialawara.github.io/readify/)**

---

## 📱 Download Ready-to-Install Android APK

Prefer an Android App on your phone? Download the compiled APK package directly:

- **[Download Readify Gazette APK (Direct Download)](https://github.com/officialawara/readify/releases/latest)**
- **Format**: `.apk` (Android Package)
- **Compatibility**: Android 7.0 (API Level 24) and higher
- **Features**: Multi-format eBook reader (PDF, EPUB, TXT, MD), Text-to-Speech Audiobook Engine, 100% Offline Mode, Content Security Policy (CSP) security protection.

---

## 🌟 Key Features

### 1. Broadsheet Newspaper & Letterpress Print Shop Aesthetic
- **Three Newspaper Editions**:
  - 📄 **Paper Edition**: Vintage newsprint parchment (`#F6F2E8`).
  - 📜 **Warm Parchment Edition**: Aged golden manuscript tone (`#F3E5C8`).
  - 🌙 **Midnight Press Edition**: Dark mode night newsprint printing press style (`#12100E`).
- **Typography & Craftsmanship**: Google Fonts (*UnifrakturMaguntia* Gothic Blackletter masthead, *Playfair Display* news headlines, *Newsreader* / *Lora* body serif, and *Courier Prime* typewriter details).
- **Tactile UI Elements**: Double ink rule borders, drop-cap first letters, mechanical pressed buttons, woodblock seals, classified sectioning, and ribbon progress tracking.

### 2. Multi-Format Document Engine
- **PDF Parsing**: Powered by Mozilla's open-source **PDF.js**. Renders crisp pages onto canvas containers with text block extraction for broadsheet view and audiobook speech.
- **EPUB Parsing**: Powered by Futurepress **ePub.js**. Renders `.epub` archives, dynamic chapter pagination, table of contents (TOC), and reflowable typography.
- **TXT / Markdown / HTML / FB2**: Native clean text processing with automatic multi-column broadsheet formatting.

### 3. Text-to-Speech (TTS) Audiobook Engine
- Integrated Web Speech API (`SpeechSynthesis`) supporting all installed Android and desktop system TTS voices.
- Vintage Phonograph Audio Deck controls: Play, Pause, Resume, Stop, Next/Prev Sentence, Speed Dial (`0.75x` – `2.0x`), Voice Selector, and **live sentence highlighting** on the broadsheet stage.

### 4. Comprehensive Security & Anti-XSS Engine
- **Content Security Policy (CSP)** meta headers.
- **Zero CDN Dependency**: All core parsing libraries (`pdf.min.js`, `pdf.worker.min.js`, `jszip.min.js`, `epub.min.js`) are bundled locally for 100% offline security.
- **DOM Parser Anti-XSS Sanitizer**: Automatically strips `<script>`, `<iframe>`, `<object>`, `<embed>`, inline event handlers (`onload`, `onerror`, `onclick`), and `javascript:` URIs from user-imported documents.
- **Android Hardening**: Configured with `android:allowBackup="false"` and `android:usesCleartextTraffic="false"`.

---

## 📁 Repository Architecture

```
readify/
├── android/                   # Native Android Studio & Gradle Project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml   # Hardened Android Manifest
│   │   │   └── java/com/readify/broadsheet/MainActivity.java
│   │   └── build.gradle
│   └── build.gradle
├── www/                       # Bundled Web Production Assets
├── js/
│   ├── vendor/                # Bundled Offline PDF.js, ePub.js & JSZip
│   ├── pdf-handler.js
│   ├── epub-handler.js
│   ├── tts-engine.js
│   ├── reader.js
│   ├── library.js
│   └── app.js
├── assets/
│   ├── icon.jpg               # Letterpress Woodcut Icon
│   └── masthead.jpg           # Broadsheet Banner Decoration
├── index.html                 # CSP-Hardened App Shell
├── capacitor.config.json      # Capacitor Configuration
└── README.md                  # Project Documentation
```

---

## 📄 License
Licensed under the [MIT License](LICENSE).
