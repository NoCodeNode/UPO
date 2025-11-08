// content/content.js — selection capture, UX overlay, and in-place replacement

let upoToast, upoBar, currentOptimization = null;

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
}

function setCursorLoading(on) {
  try { document.documentElement.style.cursor = on ? "progress" : ""; } catch {}
}

function toast(msg, ms = 2200, type = 'info') {
  ensureUI();
  upoToast.textContent = msg;
  upoToast.className = `upo-root-toast show ${type}`;
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

function getSelectionData() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const text = sel.toString();
  if (!text || !text.trim()) return null;
  const range = sel.getRangeAt(0);
  return { sel, range, text };
}

async function optimizeNow(mode = null) {
  const s = getSelectionData();
  if (!s) {
    toast("Select text to optimize.", 2000, 'warning');
    return;
  }

  // If no mode specified, get last used mode
  if (!mode) {
    const response = await chrome.runtime.sendMessage({ type: "UPO_GET_LAST_MODE" });
    mode = response?.mode || 'precise';
  }

  setCursorLoading(true);
  statusStart();
  
  // Show mode-specific message
  const modeNames = {
    'precise': '🎯 Precise',
    'quick': '⚡ Quick',
    'detailed': '📝 Detailed',
    'creative': '🎨 Creative',
    'professional': '💼 Professional'
  };
  const modeName = modeNames[mode] || '🎯 Precise';
  toast(`Optimizing with ${modeName} mode…`, 10000);

  try {
    const resp = await chrome.runtime.sendMessage({
      type: "UPO_CALL_GEMINI",
      text: s.text,
      mode: mode
    });

    if (!resp?.ok) {
      throw new Error(resp?.error || "Unknown error");
    }

    const optimized = resp.optimized.trim();
    const originalText = s.text;
    const originalRange = s.range.cloneRange();
    
    // Store for potential undo
    currentOptimization = {
      original: originalText,
      optimized: optimized,
      range: originalRange,
      timestamp: Date.now()
    };
    
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
    
    // Show character count change
    const charDiff = optimized.length - originalText.length;
    const diffText = charDiff > 0 ? `+${charDiff}` : `${charDiff}`;
    toast(`✓ Optimized! ${diffText} characters`, 2500, 'success');
    
  } catch (e) {
    statusDone();
    
    // Better error messages
    let errorMsg = e.message;
    if (errorMsg.includes("API key")) {
      errorMsg = "⚠️ API Key Missing - Click to open settings";
      toast(errorMsg, 3500, 'error');
    } else if (errorMsg.includes("quota") || errorMsg.includes("429")) {
      errorMsg = "⚠️ API Quota Exceeded - Try again later";
      toast(errorMsg, 3500, 'error');
    } else {
      toast(`Error: ${errorMsg}`, 3000, 'error');
    }
  } finally {
    setCursorLoading(false);
  }
}

// Listen for triggers from background/popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "UPO_OPTIMIZE_SELECTION") {
    optimizeNow(msg.mode);
  }
});
