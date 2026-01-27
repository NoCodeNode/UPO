// options/options.js
const el = (id) => document.getElementById(id);

const provider = el("provider");
const apiKey = el("apiKey");
const model = el("model");
const cerebrasApiKey = el("cerebrasApiKey");
const cerebrasModel = el("cerebrasModel");
const systemPrompt = el("systemPrompt");
const form = el("settingsForm");
const statusEl = el("status");
const btnClear = el("btnClear");
const btnTest = el("btnTest");
const sampleOut = el("sampleOut");
const btnShortcuts = el("btnShortcuts");
const btnAPIKeys = el("btnAPIKeys");
const btnAPIKeys2 = el("btnAPIKeys2");
const btnAPIKeysText = el("btnAPIKeysText");

const geminiConfig = el("geminiConfig");
const cerebrasConfig = el("cerebrasConfig");

// Toggle provider configuration sections
function toggleProviderConfig() {
  const selectedProvider = provider.value;
  
  if (selectedProvider === "cerebras") {
    geminiConfig.style.display = "none";
    cerebrasConfig.style.display = "block";
    btnAPIKeysText.textContent = "Get Cerebras API Key";
  } else {
    geminiConfig.style.display = "block";
    cerebrasConfig.style.display = "none";
    btnAPIKeysText.textContent = "Get Gemini API Key";
  }
}

provider.addEventListener("change", toggleProviderConfig);

async function load() {
  const { 
    aiProvider = "gemini",
    geminiApiKey = "", 
    geminiModel = "gemini-2.5-pro", 
    cerebrasApiKey: cerebrasKey = "",
    cerebrasModel: cerebrasmdl = "llama-3.3-70b",
    geminiPrompt = "" 
  } = await chrome.storage.sync.get([
    "aiProvider",
    "geminiApiKey", 
    "geminiModel", 
    "cerebrasApiKey",
    "cerebrasModel",
    "geminiPrompt"
  ]);
  
  provider.value = aiProvider;
  apiKey.value = geminiApiKey;
  model.value = geminiModel;
  cerebrasApiKey.value = cerebrasKey || "";
  cerebrasModel.value = cerebrasmdl;
  systemPrompt.value = geminiPrompt;
  
  toggleProviderConfig();
}
load();

function status(msg, ok = true) {
  statusEl.textContent = msg;
  statusEl.style.color = ok ? "#bbf7d0" : "#fecaca";
  clearTimeout(status._t);
  status._t = setTimeout(() => (statusEl.textContent = ""), 2800);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const selectedProvider = provider.value;
  const geminiKey = apiKey.value.trim();
  const cerebrasKey = cerebrasApiKey.value.trim();
  const mdl = model.value;
  const cerebrasmdl = cerebrasModel.value;
  const sp = systemPrompt.value;

  // Validate based on selected provider
  if (selectedProvider === "gemini" && !geminiKey) {
    status("Please add your Gemini API key.", false);
    return;
  }
  
  if (selectedProvider === "cerebras" && !cerebrasKey) {
    status("Please add your Cerebras API key.", false);
    return;
  }

  await chrome.storage.sync.set({ 
    aiProvider: selectedProvider,
    geminiApiKey: geminiKey, 
    geminiModel: mdl, 
    cerebrasApiKey: cerebrasKey,
    cerebrasModel: cerebrasmdl,
    geminiPrompt: sp 
  });
  
  status("Settings saved.");
});

btnClear.addEventListener("click", async () => {
  await chrome.storage.sync.remove([
    "aiProvider",
    "geminiApiKey", 
    "geminiModel", 
    "cerebrasApiKey",
    "cerebrasModel",
    "geminiPrompt"
  ]);
  provider.value = "gemini";
  apiKey.value = "";
  model.value = "gemini-2.5-pro";
  cerebrasApiKey.value = "";
  cerebrasModel.value = "llama-3.3-70b";
  systemPrompt.value = "";
  toggleProviderConfig();
  status("Cleared.");
  sampleOut.classList.add("hidden");
  sampleOut.textContent = "";
});

btnTest.addEventListener("click", async () => {
  status("Testing…");
  sampleOut.classList.add("hidden");
  sampleOut.textContent = "";
  const resp = await chrome.runtime.sendMessage({ type: "UPO_TEST_GEMINI" });
  if (!resp?.ok) {
    status(`Test failed: ${resp?.error || "Unknown error"}`, false);
    return;
  }
  status("Test succeeded.");
  sampleOut.textContent = resp.sample;
  sampleOut.classList.remove("hidden");
});

btnShortcuts.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_SHORTCUTS" });
});

btnAPIKeys.addEventListener("click", () => {
  const selectedProvider = provider.value;
  if (selectedProvider === "cerebras") {
    chrome.tabs.create({ url: "https://cloud.cerebras.ai" });
  } else {
    chrome.runtime.sendMessage({ type: "UPO_OPEN_API_KEYS" });
  }
});

btnAPIKeys2.addEventListener("click", () => {
  const selectedProvider = provider.value;
  if (selectedProvider === "cerebras") {
    chrome.tabs.create({ url: "https://cloud.cerebras.ai" });
  } else {
    chrome.runtime.sendMessage({ type: "UPO_OPEN_API_KEYS" });
  }
});
