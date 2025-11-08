# Service Worker Registration Fix

## Issue
Service worker registration failed with **Status code: 15** when trying to load the extension.

## Root Cause
The shared modules (`history.js`, `modes.js`, `theme.js`, `quality-score.js`) were using CommonJS-style exports:

```javascript
// Old (CommonJS style)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ... };
}
```

Chrome extension service workers with `"type": "module"` in manifest.json require proper ES6 module syntax and don't support the conditional CommonJS pattern.

## Solution
Converted all shared modules to use ES6 export syntax:

```javascript
// New (ES6 style)
export {
  functionName1,
  functionName2,
  ...
};
```

## Files Modified
- `shared/history.js` - Changed to ES6 exports
- `shared/modes.js` - Changed to ES6 exports
- `shared/theme.js` - Changed to ES6 exports
- `shared/quality-score.js` - Changed to ES6 exports

## Commit
Commit hash: `7ce6629` - "Fix ES6 module exports for Chrome service worker compatibility"

## Testing
After this fix, the extension should load successfully:
1. Open `chrome://extensions/`
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select the UPO directory
5. Service worker should register without errors

## Background
Chrome Manifest V3 service workers run in a different context than traditional web pages. When `"type": "module"` is specified in the background service worker configuration, Chrome expects:
- Proper ES6 `export` statements (not conditional CommonJS)
- ES6 `import` statements (which we were already using correctly in background.js)
- All imported modules to be valid ES6 modules

The conditional check `if (typeof module !== 'undefined' && module.exports)` was causing the module loader to fail because service workers don't have the `module` object in the same way Node.js does, and the conditional pattern doesn't work with static ES6 module resolution.
