# UPO - Universal Prompt Optimizer

A simple Chrome extension that optimizes your prompts using Cerebras AI.

## 🚀 Quick Start

### 1. Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select this folder

### 2. Configure Your API Key

1. Click the UPO extension icon
2. Click "Open Settings"
3. Enter your Cerebras API key: `csk-2d3xhh8rnn9ekc5pekmwwfm3fev5w4wwncpmd422dj6c53wt`
4. Click "Save Settings"
5. (Optional) Click "Test Connection" to verify

### 3. Use It!

1. Go to any website (ChatGPT, Google Docs, etc.)
2. Select some text you want to optimize
3. Press `Ctrl+Q` (or `Cmd+Q` on Mac)
4. Your text will be replaced with an optimized version!

**Alternative:** Right-click selected text → "Optimize with UPO"

## ✨ Features

- **Instant Optimization**: Press Ctrl+Q to optimize selected text
- **In-Place Replacement**: Optimized text replaces your selection automatically
- **Simple & Fast**: No complicated setup, just works
- **Cerebras Powered**: Uses fast Cerebras AI inference

## 🔧 Troubleshooting

### Extension not working?

1. **Check API key**: Go to extension options and verify your API key is set
2. **Test connection**: Click "Test Connection" in options to verify API access
3. **Check selection**: Make sure text is actually selected before pressing Ctrl+Q
4. **Reload extension**: Go to `chrome://extensions/` and click the reload button

### Console logs

- Open DevTools Console (F12) on any webpage to see `[UPO]` logs
- Check the extension service worker console in `chrome://extensions/` for API logs

## 📝 How It Works

1. You select text on a webpage
2. Press Ctrl+Q to trigger optimization
3. Content script captures the selection
4. Background script calls Cerebras AI API
5. Response replaces the selected text
6. Done!

## 🔑 API Key

Get your Cerebras API key at: https://cloud.cerebras.ai

The extension stores your API key locally in Chrome's storage (never sent anywhere except to Cerebras API).

## Version

**3.0.0** - Rebuilt from scratch for simplicity and reliability

---

Built with ❤️ for better prompts
