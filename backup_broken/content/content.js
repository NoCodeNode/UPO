// content/content.js — selection capture, UX overlay, and in-place replacement

// Enable debug logging
const DEBUG = true;
function debugLog(...args) {
  if (DEBUG) console.log('[UPO Content]', ...args);
}

debugLog('Content script loaded and running');

let upoToast, upoBar, upoTokenDisplay;

function ensureUI() {
  if (!upoToast) {
    upoToast = document.createElement("div");
    upoToast.className = "upo-root-toast";
    upoToast.setAttribute("role", "status");
    upoToast.setAttribute("aria-live", "polite");
    document.documentElement.appendChild(upoToast);
  }
  if (!upoBar) {
    upoBar = document.createElement("div");
    upoBar.className = "upo-status-bar";
    document.documentElement.appendChild(upoBar);
  }
  if (!upoTokenDisplay) {
    upoTokenDisplay = document.createElement("div");
    upoTokenDisplay.className = "upo-token-display hidden";
    document.documentElement.appendChild(upoTokenDisplay);
  }
}

function setCursorLoading(on) {
  try { document.documentElement.style.cursor = on ? "progress" : ""; } catch {}
}

function toast(msg, ms = 2200) {
  ensureUI();
  upoToast.textContent = msg;
  upoToast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => upoToast.classList.remove("show"), ms);
}

function statusStart() {
  ensureUI();
  upoBar.classList.remove("done");
  upoBar.classList.add("show");
}

function statusDone() {
  if (!upoBar) return;
  upoBar.classList.add("done");
  setTimeout(() => {
    upoBar.classList.remove("show", "done");
  }, 650);
}

function showTokenUsage(usage) {
  if (!usage || typeof usage !== 'object') return;
  
  ensureUI();
  const { prompt_tokens = 0, completion_tokens = 0, total_tokens = 0 } = usage;
  
  upoTokenDisplay.innerHTML = `
    <div class="token-label">Token Usage</div>
    <div class="token-stats">
      <span class="token-stat">
        <span class="token-key">Prompt:</span>
        <span class="token-value">${prompt_tokens}</span>
      </span>
      <span class="token-stat">
        <span class="token-key">Response:</span>
        <span class="token-value">${completion_tokens}</span>
      </span>
      <span class="token-stat">
        <span class="token-key">Total:</span>
        <span class="token-value token-total">${total_tokens}</span>
      </span>
    </div>
  `;
  
  upoTokenDisplay.classList.remove("hidden");
  upoTokenDisplay.classList.add("show");
  
  // Hide after 5 seconds
  clearTimeout(showTokenUsage._t);
  showTokenUsage._t = setTimeout(() => {
    upoTokenDisplay.classList.remove("show");
    setTimeout(() => upoTokenDisplay.classList.add("hidden"), 300);
  }, 5000);
}

function getSelectionData() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const text = sel.toString();
  if (!text || !text.trim()) return null;
  const range = sel.getRangeAt(0);
  return { sel, range, text };
}

async function optimizeNow() {
  debugLog('optimizeNow() called');
  
  const s = getSelectionData();
  if (!s) {
    debugLog('No text selected');
    toast("Select text to optimize.");
    return;
  }
  
  debugLog('Selected text:', s.text.substring(0, 50) + '...');

  // Get current provider from storage (local storage)
  debugLog('Fetching provider from storage...');
  const { selectedProvider } = await chrome.storage.local.get("selectedProvider");
  debugLog('Provider:', selectedProvider);
  
  // Check if provider is configured
  if (!selectedProvider) {
    debugLog('No provider configured!');
    toast("⚠️ Please select a provider in Settings first.", 3000);
    return;
  }

  setCursorLoading(true);
  statusStart();
  toast(`Optimizing with ${selectedProvider === 'cerebras' ? 'Cerebras' : 'Gemini'}…`);

  try {
    // Choose API call based on provider
    const messageType = selectedProvider === "cerebras" ? "UPO_CALL_CEREBRAS" : "UPO_CALL_GEMINI";
    debugLog('Sending message:', messageType);
    
    const resp = await chrome.runtime.sendMessage({
      type: messageType,
      text: s.text
    });
    
    debugLog('Received response:', resp);

    if (!resp?.ok) {
      // Enhanced error message with guidance
      const errorMsg = resp?.error || "Unknown error";
      debugLog('Error from background:', errorMsg);
      if (errorMsg.includes("API key")) {
        throw new Error(`${errorMsg}\n\nPlease add your ${selectedProvider === 'cerebras' ? 'Cerebras' : 'Gemini'} API key in Settings.`);
      }
      throw new Error(errorMsg);
    }
    
    debugLog('Optimization successful, replacing text...');

    const optimized = resp.optimized.trim();
    const tn = document.createTextNode(optimized);

    // Replace selected range
    s.range.deleteContents();
    s.range.insertNode(tn);

    // Place caret after insertion
    s.sel.removeAllRanges();
    const after = document.createRange();
    after.setStartAfter(tn);
    after.setEndAfter(tn);
    s.sel.addRange(after);

    statusDone();
    toast("Prompt optimization complete.", 1500);
    debugLog('Text replacement complete');
    
    // Show token usage if available (Cerebras only)
    if (resp.usage) {
      debugLog('Token usage:', resp.usage);
      showTokenUsage(resp.usage);
    }
  } catch (e) {
    debugLog('Error during optimization:', e);
    statusDone();
    toast(`Error: ${e.message}`, 2600);
  } finally {
    setCursorLoading(false);
  }
}

// Listen for triggers from background/popup
chrome.runtime.onMessage.addListener((msg) => {
  debugLog('Message received:', msg);
  if (msg?.type === "UPO_OPTIMIZE_SELECTION") {
    debugLog('Triggering optimization...');
    optimizeNow();
  }
});
