# Changelog

## Version 3.1.0 - Model Selection & Enhanced Controls

### 🎉 New Features

#### Model Selection
- Added dropdown to choose from 3 Cerebras AI models
- **Llama 3.1 8B**: Fast and efficient, great for quick optimizations
- **Llama 3.1 70B**: More capable, better understanding
- **Llama 3.3 70B**: Latest model, best quality

#### Temperature Control
- Interactive slider (0.0 - 2.0)
- Real-time value display
- Helper text explaining effect
- Default: 0.7 (balanced creativity and focus)

#### Max Tokens Control
- Number input field (100 - 8000)
- Control output length
- Default: 2000 tokens
- Helper text for guidance

#### Custom System Prompt
- Advanced option for power users
- Default: "You are the Universal Prompt Optimizer (UPO)."
- Optional customization for specific use cases

### ✨ Improvements

#### Better Feedback
- Character count display (before optimization)
- Character count after with delta (+/- chars)
- Improved toast notifications with emojis
- Loading state shows character count

#### Enhanced Popup
- Shows current model being used
- Displays current temperature setting
- Shows max tokens configuration
- Better status indicators

#### Simplified System Prompt
- Changed from verbose multi-line prompt to clean, simple:
  **"You are the Universal Prompt Optimizer (UPO)."**
- More effective and cleaner
- Optional custom prompt for advanced users

### 📖 Documentation
- Added comprehensive FEATURES.md guide
- Model comparison table
- Temperature usage guide
- Tips and best practices
- Common use cases
- Troubleshooting section
- Example workflows

### 🔧 Technical Changes
- Dynamic model loading from storage
- Settings persistence across all options
- Backward compatible with existing installations
- Improved error messages
- Better logging for debugging

### 🐛 Bug Fixes
- Settings now properly load all values on page open
- Test connection uses selected model
- Temperature display updates in real-time

---

## Version 3.0.0 - Initial Rebuild

### Complete Rebuild
- Simplified architecture from scratch
- Direct Cerebras API integration
- Removed unnecessary complexity
- Clean, maintainable codebase

### Core Features
- Text selection and optimization
- Ctrl+Q keyboard shortcut
- Context menu integration
- Simple API key management
- Toast notifications
- In-place text replacement

### Technical
- Manifest V3
- Pure vanilla JavaScript
- No external dependencies
- Chrome storage API
- 9 core files

---

## Future Roadmap

### Potential Features
- [ ] Streaming mode toggle
- [ ] History of optimizations
- [ ] Favorite prompts/templates
- [ ] Export/import settings
- [ ] Dark/light theme toggle
- [ ] Additional model providers
- [ ] Batch optimization
- [ ] Prompt templates library
- [ ] Usage statistics/analytics
- [ ] Collaborative prompt sharing

### Community Requests
Have a feature request? Open an issue on GitHub!

---

**Latest Version**: 3.1.0  
**Release Date**: 2026-02-07  
**Status**: Stable  
**Compatibility**: Chrome/Edge/Brave (Manifest V3)
