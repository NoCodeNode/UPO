// content/content.js — selection capture, UX overlay, and in-place replacement

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
  const s = getSelectionData();
  if (!s) {
    toast("Select text to optimize.");
    return;
  }

  // Get current provider from storage
  const { provider = "gemini" } = await chrome.storage.sync.get("provider");

  setCursorLoading(true);
  statusStart();
  toast(`Optimizing with ${provider === 'cerebras' ? 'Cerebras' : 'Gemini'}…`);

  try {
    // Choose API call based on provider
    const messageType = provider === "cerebras" ? "UPO_CALL_CEREBRAS" : "UPO_CALL_GEMINI";
    
    const resp = await chrome.runtime.sendMessage({
      type: messageType,
      text: s.text
    });

    if (!resp?.ok) {
      throw new Error(resp?.error || "Unknown error");
    }

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
    
    // Show token usage if available (Cerebras only)
    if (resp.usage) {
      showTokenUsage(resp.usage);
    }
  } catch (e) {
    statusDone();
    toast(`Error: ${e.message}`, 2600);
  } finally {
    setCursorLoading(false);
  }
}

// Listen for triggers from background/popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "UPO_OPTIMIZE_SELECTION") {
    optimizeNow();
  }
});
