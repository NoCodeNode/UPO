# UPO Extension - Setup Guide for Cerebras API

## Quick Start

### 1. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the UPO folder
5. The extension icon should appear in your toolbar

### 2. Configure Cerebras API
1. Click the UPO icon in toolbar → Click **Go to Settings**
2. In the **AI Provider** dropdown, select **Cerebras Cloud**
   - Provider will auto-save immediately
3. Enter your Cerebras API key: `csk-2d3xhh8rnn9ekc5pekmwwfm3fev5w4wwncpmd422dj6c53wt`
4. Configure settings (or use defaults):
   - **Model**: Zai GLM 4.7B (65K tokens) - default
   - **Temperature**: 0.7 (0.0 = focused, 2.0 = creative)
   - **Top-P**: 0.9 (0.0 = narrow, 1.0 = broad)
   - **Max Tokens**: 65000 (or leave empty for default)
   - **Stream Responses**: On (real-time text generation)
5. Click **Save Settings**
6. Click **Test Connection** to verify API works

### 3. Use the Extension
1. Go to any website (e.g., ChatGPT, Claude, Google Docs)
2. Type or select some text you want to optimize
3. Press **Ctrl+Q** (or **Cmd+Q** on Mac)
4. Watch as UPO optimizes your prompt in-place!

## Features

### Multi-Provider Support
- **Google Gemini**: Google's cutting-edge AI
- **Cerebras Cloud**: Ultra-fast inference with competitive pricing

### Premium UI
- Glass morphism design with 3D effects
- Smooth animations and microinteractions
- Provider status badge in popup
- Token usage display (Cerebras only)

### Advanced Controls (Cerebras)
- **Temperature**: Control randomness (0.0-2.0)
- **Top-P**: Control diversity (0.0-1.0)
- **Max Tokens**: Limit response length
- **Stream Toggle**: Enable/disable real-time streaming
- **Custom Models**: Add your own Cerebras models

### Security
- API keys stored locally with obfuscation
- No data sent to third parties
- Chrome's built-in encryption for Gemini keys
- Device-specific obfuscation for Cerebras keys

## Troubleshooting

### Extension Not Working
1. **Check provider is selected**: Open settings and ensure "Cerebras Cloud" is selected
2. **Verify API key**: Make sure you saved your API key correctly
3. **Test connection**: Click "Test Connection" button in settings
4. **Check permissions**: Extension needs access to the current page

### Provider Not Showing in Popup
1. Open **Settings**
2. Select a provider from the **AI Provider** dropdown
3. Provider auto-saves immediately
4. Check popup again - should show provider badge

### API Key Errors
- Error says "Missing API key": You haven't added your key yet
- Error says "Invalid API key": Check your key is correct
- Error 429 (Rate limit): You've hit API rate limits, wait and retry

### Keyboard Shortcut Not Working
1. Go to `chrome://extensions/shortcuts`
2. Find "UPO — Universal Prompt Optimizer"
3. Click the pencil icon next to "Optimize selected text"
4. Set a custom shortcut (e.g., `Ctrl+Shift+Q`)
5. **Mac Users**: Change from `Cmd+Q` to avoid quitting Chrome

## Technical Details

### Cerebras Models
- **zai-glm-4.7**: 65,000 max tokens (default)
- **gpt-oss-120b**: 32,768 max tokens
- **qwen-3-235b-a22b-instruct-2507**: 20,000 max tokens

### API Endpoint
```
POST https://api.cerebras.ai/v1/chat/completions
Authorization: Bearer {your-api-key}
Content-Type: application/json
```

### Request Format
```json
{
  "model": "zai-glm-4.7",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "stream": true,
  "temperature": 0.7,
  "top_p": 0.9,
  "max_tokens": 65000
}
```

### Storage Locations
- **Cerebras Settings**: `chrome.storage.local` (device-specific, obfuscated)
- **Gemini Settings**: `chrome.storage.sync` (Chrome-encrypted, synced)
- **Provider Selection**: `chrome.storage.local`

## Support

### Getting API Keys
- **Cerebras**: Visit https://cloud.cerebras.ai/api-keys
- **Gemini**: Visit https://aistudio.google.com/app/apikey

### Common Issues
1. **"Not configured" in popup**: Select a provider in settings first
2. **"Select text to optimize" toast**: You need to select text before pressing Ctrl+Q
3. **Network errors**: Check your internet connection
4. **Extension disabled**: Check chrome://extensions/ and enable it

## Version Info
- **Version**: 3.0.0
- **Manifest**: V3
- **Provider Support**: Gemini + Cerebras
- **Tested**: Chrome 120+, Edge 120+

---

Built with ❤️ by Arnab Mandal (hello@arnabmandal.com)
