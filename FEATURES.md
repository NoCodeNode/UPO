# UPO Features & Configuration Guide

## ✨ New Features Added

### 🎯 Model Selection
Choose from three powerful Cerebras AI models:

- **Llama 3.1 8B** - Fast and efficient, great for quick optimizations
- **Llama 3.1 70B** - More capable, better understanding and longer responses
- **Llama 3.3 70B** - Latest model, best quality and reasoning

### 🎚️ Temperature Control
Adjust creativity vs. focus:
- **0.0-0.5**: More focused and deterministic
- **0.5-1.0**: Balanced (recommended: 0.7)
- **1.0-2.0**: More creative and varied

### 📏 Max Tokens Control
Set the maximum length of optimized prompts:
- **Default**: 2000 tokens
- **Range**: 100-8000 tokens
- Higher values allow longer, more detailed prompts

### 📝 Custom System Prompt
Advanced users can customize the AI's behavior:
- **Default**: "You are the Universal Prompt Optimizer (UPO)."
- Leave blank to use the simple, effective default
- Customize for specific use cases or output styles

## 🚀 How to Use

### Initial Setup
1. Click the UPO icon in your browser toolbar
2. Click "Open Settings"
3. Enter your Cerebras API key (get one at https://cloud.cerebras.ai)
4. Choose your preferred model
5. Adjust temperature and max tokens if desired
6. Click "Save Settings"
7. Click "Test Connection" to verify everything works

### Using the Extension
**Method 1: Keyboard Shortcut (Fastest)**
1. Select any text on a webpage
2. Press `Ctrl+Q` (or `Cmd+Q` on Mac)
3. Text is instantly optimized and replaced!

**Method 2: Context Menu**
1. Select any text on a webpage
2. Right-click
3. Choose "Optimize with UPO"
4. Text is optimized and replaced!

## 📊 Visual Feedback

### Character Count Display
- When optimizing, you'll see the character count: "⏳ Optimizing 245 characters with AI..."
- After completion: "✓ Optimized! 245 → 512 chars (+267)"
- Shows exactly how much your prompt expanded/changed

### Status in Popup
The popup shows:
- ✓ Configuration status
- Current model being used
- Current temperature setting
- Current max tokens setting

### Toast Notifications
- **Blue toast**: Processing/Loading
- **Green background**: Success with stats
- **Red background**: Error with message

## 🔧 Settings Explained

### Model Selection
| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| Llama 3.1 8B | ⚡⚡⚡ | ⭐⭐⭐ | Quick optimizations, fast responses |
| Llama 3.1 70B | ⚡⚡ | ⭐⭐⭐⭐ | Complex prompts, better understanding |
| Llama 3.3 70B | ⚡⚡ | ⭐⭐⭐⭐⭐ | Best quality, latest capabilities |

### Temperature Guide
- **0.2**: Very focused, deterministic - good for technical/precise prompts
- **0.5**: Balanced with focus - good for most use cases
- **0.7**: Default - balanced creativity and focus
- **1.0**: More creative - good for brainstorming
- **1.5+**: Very creative - experimental outputs

### Max Tokens
- **500-1000**: Short, concise prompts
- **1000-2000**: Standard prompts (default)
- **2000-4000**: Long, detailed prompts
- **4000+**: Very comprehensive prompts

## 💡 Tips & Best Practices

### For Best Results
1. **Select clear, complete text**: The AI works best with full thoughts/sentences
2. **Start with default settings**: Temperature 0.7, max_tokens 2000 works great
3. **Try different models**: 8B for speed, 70B for quality
4. **Keep it focused**: Select the specific part you want optimized
5. **Use simple default prompt**: The built-in "You are the Universal Prompt Optimizer (UPO)." works excellently

### When to Adjust Settings
- **Increase temperature** if outputs are too similar or boring
- **Decrease temperature** if outputs are too random or off-topic
- **Increase max_tokens** if prompts are getting cut off
- **Try larger model** if quality isn't good enough
- **Try smaller model** if you need faster responses

### Common Use Cases

**Technical Prompts**
- Model: Llama 3.3 70B
- Temperature: 0.3-0.5
- Max Tokens: 2000

**Creative Writing Prompts**
- Model: Llama 3.3 70B
- Temperature: 0.8-1.2
- Max Tokens: 3000

**Quick Daily Optimizations**
- Model: Llama 3.1 8B
- Temperature: 0.7
- Max Tokens: 1500

**Complex Research Prompts**
- Model: Llama 3.3 70B
- Temperature: 0.5-0.7
- Max Tokens: 4000

## ⚡ Keyboard Shortcuts

- `Ctrl+Q` (Windows/Linux) - Optimize selected text
- `Cmd+Q` (Mac) - Optimize selected text

## 🔐 Privacy & Security

- API key stored locally in your browser (chrome.storage.local)
- No data sent anywhere except to Cerebras AI API
- No tracking or analytics
- Open source - verify the code yourself!

## 🐛 Troubleshooting

### "Please set your Cerebras API key"
- Go to Settings and enter your API key
- Make sure it starts with "csk-"
- Click "Save Settings"

### "Connection failed"
- Click "Test Connection" in settings to diagnose
- Check your API key is correct
- Verify you have internet connection
- Check Cerebras API status

### Text not replacing
- Make sure text is actually selected before pressing Ctrl+Q
- Check browser console for error messages (F12 → Console)
- Verify extension has permissions for the page

### Model not working
- Some models may not be available to all accounts
- Try switching to Llama 3.1 8B (always available)
- Test connection with your selected model

## 📖 Example Workflow

1. **Find text to optimize**
   ```
   Original: "write a story about a dog"
   ```

2. **Select the text and press Ctrl+Q**

3. **Get optimized prompt**
   ```
   Optimized: "You are a creative fiction writer. Write an engaging short story 
   about a dog. Include vivid descriptions of the dog's personality, appearance, 
   and a meaningful adventure or experience. Make the story emotionally resonant 
   and suitable for all ages. Length: 500-800 words. Use descriptive language 
   and show, don't tell."
   ```

4. **Use the optimized prompt in ChatGPT, Claude, etc.**

## 🎉 What's New in This Update

✅ **Model Selection** - Choose from 3 Cerebras models
✅ **Temperature Control** - Slider for creativity adjustment
✅ **Max Tokens Control** - Set output length limits
✅ **Custom System Prompt** - Advanced customization
✅ **Character Count** - See before/after lengths
✅ **Improved Feedback** - Better toast notifications
✅ **Model Display** - See current model in popup
✅ **Simplified Default Prompt** - Clean, effective: "You are the Universal Prompt Optimizer (UPO)."

## 🔗 Links

- Get API Key: https://cloud.cerebras.ai
- GitHub Repository: https://github.com/ArnabXM/UPO
- Report Issues: https://github.com/ArnabXM/UPO/issues

---

**Enjoy optimizing your prompts! 🚀**
