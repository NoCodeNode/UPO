// content/content.js — selection capture, UX overlay, and in-place replacement

let upoToast, upoBar;

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

  setCursorLoading(true);
  statusStart();
  toast("Optimizing text…");

  try {
    const resp = await chrome.runtime.sendMessage({
      type: "UPO_CALL_GEMINI",
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
