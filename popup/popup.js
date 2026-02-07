// popup/popup.js
const optimizeBtn = document.getElementById("optimizeNow");
const optionsBtn = document.getElementById("openOptions");
const providerIcon = document.getElementById("providerIcon");
const providerName = document.getElementById("providerName");

// Load and display current provider
async function loadProviderInfo() {
  try {
    const { selectedProvider = "gemini" } = await chrome.storage.local.get("selectedProvider");
    
    if (selectedProvider === "cerebras") {
      providerIcon.textContent = "🧠";
      providerName.textContent = "Cerebras Cloud";
      providerName.style.color = "#22c55e";
    } else {
      providerIcon.textContent = "✨";
      providerName.textContent = "Google Gemini";
      providerName.style.color = "#7aa2ff";
    }
  } catch (err) {
    console.error("Failed to load provider info:", err);
    providerName.textContent = "Unknown";
  }
}

loadProviderInfo();

optimizeBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "UPO_OPTIMIZE_SELECTION" });
    window.close();
  }
});

optionsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
