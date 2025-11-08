<div align="center">

# ✨ UPO — Universal Prompt Optimizer

### 🚀 Stop Getting Mediocre AI Responses

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/NoCodeNode/UPO)
[![Manifest](https://img.shields.io/badge/manifest-v3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License](https://img.shields.io/badge/license-Custom-orange.svg)](https://github.com/NoCodeNode/UPO)

**Transform your basic prompts into optimized ones that get better results from any AI tool.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Setup](#️-setup) • [Contributing](#-contributing)

---

</div>

## 🎯 The Problem

Are you frustrated with mediocre responses from ChatGPT, Claude, or other AI tools? The issue isn't the AI — it's your prompts.

Most people struggle to write effective prompts that get the results they want. Poorly crafted prompts lead to:
- ❌ Vague or irrelevant responses
- ❌ Wasted time refining and re-prompting
- ❌ Frustration with AI tools
- ❌ Missing out on AI's full potential

## 💡 The Solution

**UPO (Universal Prompt Optimizer)** uses Google Gemini AI to instantly transform your basic prompts into optimized versions that get you better results from any AI tool.

Simply select your prompt text anywhere on the web, press `Ctrl+Q`, and watch as UPO rewrites it into a clear, effective prompt that AI tools understand better.

### 🌟 Why UPO?

- ⚡ **Instant Optimization** — Transform prompts in seconds with `Ctrl+Q`
- 🎯 **Better AI Results** — Get more accurate, relevant responses from any AI tool
- 🔄 **In-Place Replacement** — Optimized prompt appears right where you typed it
- 🧠 **Gemini Powered** — Leverages Google's most advanced AI for prompt engineering
- 🎨 **Works Everywhere** — ChatGPT, Claude, Copilot, or any text field on any website
- 🔒 **Private & Secure** — Your API key stays local, never shared

---

## ✨ Features

<table>
<tr>
<td width="50%">

### ⌨️ Keyboard Shortcut
Press **Ctrl+Q** (Win/Linux) or **Cmd+Q** (Mac) to instantly optimize selected prompts

> **Mac Users**: You can customize the shortcut to avoid conflicts with Cmd+Q (Quit). [Learn how](#-customizing-keyboard-shortcuts)

</td>
<td width="50%">

### 🖱️ Context Menu
Right-click any selection and choose "Optimize with UPO" from the menu

</td>
</tr>
<tr>
<td width="50%">

### 🔄 In-Place Replacement
No copy-paste needed — optimized prompt appears right where you selected it

</td>
<td width="50%">

### ⚙️ Universal Compatibility
Works on ChatGPT, Claude, Copilot, and any website with text input

</td>
</tr>
</table>

---

## 🚀 Installation

### 📦 Quick Install (From Source)

```bash
# Clone the repository
git clone https://github.com/NoCodeNode/UPO.git

# Navigate to the directory
cd UPO
```

### 🔧 Load in Browser

1. **Open Extensions Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Select the `UPO` folder

4. **You're Ready!** 🎉
   - The UPO icon appears in your toolbar

---

## ⚙️ Setup

### 🔑 Get Your Gemini API Key

<details>
<summary>Click to expand setup instructions</summary>

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your new API key
5. Open UPO extension options
6. Paste your API key
7. Save settings

**Note**: Your API key is stored locally and never shared.

</details>

### ⌨️ Customizing Keyboard Shortcuts

<details>
<summary><strong>Mac Users</strong>: Change Cmd+Q to avoid quitting apps</summary>

The default `Cmd+Q` shortcut conflicts with the "Quit Application" command on macOS. Here's how to customize it:

#### For Chrome:
1. Go to `chrome://extensions/shortcuts`
2. Find **UPO — Universal Prompt Optimizer**
3. Click the pencil icon next to "Optimize selected text with Gemini"
4. Press your preferred shortcut (e.g., `Cmd+Shift+Q` or `Cmd+E`)
5. Click "OK"

#### For Edge:
1. Go to `edge://extensions/shortcuts`
2. Find **UPO — Universal Prompt Optimizer**
3. Click in the shortcut field
4. Press your preferred shortcut (e.g., `Cmd+Shift+Q` or `Cmd+E`)
5. Changes save automatically

#### Recommended Alternatives:
- `Cmd+Shift+Q` - Similar but safer
- `Cmd+E` - Easy to reach
- `Cmd+Shift+O` - O for Optimize
- `Cmd+Option+Q` - Extra modifier for safety

</details>

---

## 📖 Usage

### Method 1️⃣: Keyboard Shortcut (Recommended)

```
1. Type or select your prompt in any text field (ChatGPT, Claude, etc.)
2. Select the text you want to optimize
3. Press Ctrl+Q (Windows/Linux) or your custom shortcut (Mac)
4. Watch as your prompt transforms into an optimized version ✨
5. Submit the optimized prompt to your AI tool
6. Get better results!
```

> **💡 Tip**: Mac users should customize the shortcut first to avoid conflicts!

### Method 2️⃣: Context Menu

```
1. Select your prompt text on any webpage
2. Right-click on the selection
3. Choose "Optimize with UPO"
4. Get your optimized prompt instantly
```

### 🎯 Example Transformation

**Before (Basic Prompt):**
> "Write about AI"

**After (Optimized by UPO):**
> "Write a comprehensive 500-word article about artificial intelligence, covering its current applications, potential future developments, and ethical considerations. Use clear, accessible language suitable for a general audience with examples to illustrate key points."

---

## 🏗️ Project Structure

```
UPO/
│
├── 📄 manifest.json          # Extension configuration
├── ⚙️ background.js          # Service worker & background tasks
│
├── 📁 content/               # Content scripts for web pages
│   ├── content.js
│   └── content.css
│
├── 📁 icons/                 # Extension icons (all sizes)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
│
├── 📁 options/               # Settings & configuration UI
├── 📁 popup/                 # Extension popup interface
├── 📁 shared/                # Shared utilities & helpers
└── 📁 welcome/               # Onboarding experience
```

---

## 🛠️ Tech Stack

<div align="center">

| Technology | Purpose |
|------------|---------|
| ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | Core functionality |
| ![Chrome](https://img.shields.io/badge/-Manifest_V3-4285F4?style=flat-square&logo=google-chrome&logoColor=white) | Extension platform |
| ![Gemini](https://img.shields.io/badge/-Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white) | AI prompt optimization engine |

</div>

---

## 🔐 Permissions Explained

| Permission | Why We Need It |
|------------|----------------|
| `storage` | Save your API key and preferences securely |
| `activeTab` | Access the current tab to replace text |
| `scripting` | Inject content scripts for text manipulation |
| `contextMenus` | Add right-click menu option |
| `tabs` | Manage active tabs and communication |
| `notifications` | Show optimization status updates |

---

## 🤝 Contributing

Contributions are **welcome** and **appreciated**! Here's how you can help:

1. 🍴 Fork the repository
2. 🔨 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🎉 Open a Pull Request

### 💡 Ideas for Contributions

- 🐛 Bug fixes
- ✨ New features (custom optimization templates, prompt history, etc.)
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🌍 Internationalization

---

## 👨‍💻 Author

<div align="center">

**Arnab Mandal**

[![Email](https://img.shields.io/badge/Email-hello%40arnabmandal.com-red?style=flat-square&logo=gmail)](mailto:hello@arnabmandal.com)
[![GitHub](https://img.shields.io/badge/GitHub-NoCodeNode-181717?style=flat-square&logo=github)](https://github.com/NoCodeNode)

</div>

---

## 📊 Version History

| Version | Release Date | Highlights |
|---------|--------------|------------|
| 2.0.0 | Current | Manifest V3, Gemini integration, Modern UI |

---

## 🔒 Privacy & Security

Your privacy matters. Here's our commitment:

- ✅ API keys stored **locally** in your browser
- ✅ No data collection or analytics
- ✅ No third-party tracking
- ✅ Only communicates with Google Gemini API for prompt optimization
- ✅ Open source — audit the code yourself

---

## 📜 License

This project is currently under custom licensing. Please contact the author for usage rights and permissions.

---

## 💖 Support

If you find UPO helpful, consider:

- ⭐ Starring this repository
- 🐛 Reporting bugs via [Issues](https://github.com/NoCodeNode/UPO/issues)
- 💡 Suggesting features
- 📢 Sharing with others who use AI tools

---

<div align="center">

### 🌟 Made with ❤️ by [NoCodeNode](https://github.com/NoCodeNode)

**Stop settling for mediocre AI responses. Start optimizing your prompts today!**

**[⬆ Back to Top](#-upo--universal-prompt-optimizer)**

</div>
