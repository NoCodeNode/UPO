// options/options.js
import { obfuscateKey, deobfuscateKey } from '../shared/crypto.js';
import { loadCustomModels, addCustomModel, removeCustomModel } from '../shared/models.js';

// ===== DOM Element References =====
const el = (id) => document.getElementById(id);

// Provider and sections
const provider = el("provider");
const geminiSettings = el("geminiSettings");
const cerebrasSettings = el("cerebrasSettings");

// Gemini elements
const geminiApiKey = el("geminiApiKey");
const geminiModel = el("geminiModel");
const toggleGeminiKey = el("toggleGeminiKey");

// Cerebras elements
const cerebrasApiKey = el("cerebrasApiKey");
const cerebrasModel = el("cerebrasModel");
const toggleCerebrasKey = el("toggleCerebrasKey");
const temperature = el("temperature");
const temperatureValue = el("temperatureValue");
const topP = el("topP");
const topPValue = el("topPValue");
const maxTokens = el("maxTokens");
const streamToggle = el("streamToggle");

// Custom models
const customModelsList = el("customModelsList");
const customModelId = el("customModelId");
const customModelTokens = el("customModelTokens");
const btnAddCustomModel = el("btnAddCustomModel");

// Shared elements
const systemPrompt = el("systemPrompt");
const form = el("settingsForm");
const statusEl = el("status");
const btnClear = el("btnClear");
const btnTest = el("btnTest");
const sampleOut = el("sampleOut");

// Buttons
const btnShortcuts = el("btnShortcuts");
const btnAPIKeys = el("btnAPIKeys");
const btnAPIKeys2 = el("btnAPIKeys2");
const btnCerebrasKeys = el("btnCerebrasKeys");
const btnCerebrasKeys2 = el("btnCerebrasKeys2");

// ===== Utility Functions =====
function status(msg, ok = true) {
  statusEl.textContent = msg;
  statusEl.style.color = ok ? "#bbf7d0" : "#fecaca";
  clearTimeout(status._t);
  status._t = setTimeout(() => (statusEl.textContent = ""), 2800);
}

function showProviderSection(selectedProvider) {
  if (selectedProvider === "gemini") {
    geminiSettings.classList.remove("hidden");
    cerebrasSettings.classList.add("hidden");
  } else if (selectedProvider === "cerebras") {
    geminiSettings.classList.add("hidden");
    cerebrasSettings.classList.remove("hidden");
  }
}

// ===== Custom Models Management =====
async function renderCustomModels() {
  try {
    const models = await loadCustomModels();
    customModelsList.innerHTML = '';
    
    models.forEach(model => {
      const modelDiv = document.createElement('div');
      modelDiv.className = 'custom-model-item';
      modelDiv.innerHTML = `
        <span class="model-info">
          <strong>${model.id}</strong>
          <small>${model.maxTokens.toLocaleString()} tokens</small>
        </span>
        <button type="button" class="btn-remove" data-model-id="${model.id}" aria-label="Remove ${model.id}">
          <span class="ico">❌</span>
        </button>
      `;
      customModelsList.appendChild(modelDiv);
      
      // Add to cerebras model dropdown
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = `${model.id} (${model.maxTokens.toLocaleString()} tokens) [Custom]`;
      cerebrasModel.appendChild(option);
    });
    
    // Attach remove handlers
    customModelsList.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const modelId = e.currentTarget.getAttribute('data-model-id');
        try {
          await removeCustomModel(modelId);
          status("Custom model removed.");
          await renderCustomModels();
          // Remove from dropdown
          const option = cerebrasModel.querySelector(`option[value="${modelId}"]`);
          if (option) option.remove();
        } catch (err) {
          status(`Failed to remove model: ${err.message}`, false);
        }
      });
    });
  } catch (err) {
    console.error('Failed to render custom models:', err);
  }
}

// ===== Load Settings =====
async function loadSettings() {
  try {
    // Load provider selection
    const { selectedProvider = "gemini" } = await chrome.storage.local.get("selectedProvider");
    provider.value = selectedProvider;
    showProviderSection(selectedProvider);
    
    // Load Gemini settings from sync storage
    const {
      geminiApiKey: savedGeminiKey = "",
      geminiModel: savedGeminiModel = "gemini-2.5-pro",
      geminiPrompt = ""
    } = await chrome.storage.sync.get(["geminiApiKey", "geminiModel", "geminiPrompt"]);
    
    geminiApiKey.value = savedGeminiKey;
    geminiModel.value = savedGeminiModel;
    
    // Load Cerebras settings from local storage
    const {
      cerebrasApiKey: savedCerebrasKey = "",
      cerebrasModel: savedCerebrasModel = "zai-glm-4.7",
      cerebrasTemperature = 0.7,
      cerebrasTopP = 0.9,
      cerebrasMaxTokens = "",
      cerebrasStream = true
    } = await chrome.storage.local.get([
      "cerebrasApiKey",
      "cerebrasModel",
      "cerebrasTemperature",
      "cerebrasTopP",
      "cerebrasMaxTokens",
      "cerebrasStream"
    ]);
    
    // Deobfuscate Cerebras API key
    cerebrasApiKey.value = deobfuscateKey(savedCerebrasKey);
    cerebrasModel.value = savedCerebrasModel;
    temperature.value = cerebrasTemperature;
    temperatureValue.textContent = cerebrasTemperature;
    topP.value = cerebrasTopP;
    topPValue.textContent = cerebrasTopP;
    maxTokens.value = cerebrasMaxTokens;
    streamToggle.checked = cerebrasStream;
    
    // Load shared system prompt
    systemPrompt.value = geminiPrompt;
    
    // Load and render custom models
    await renderCustomModels();
  } catch (err) {
    console.error('Failed to load settings:', err);
    status('Failed to load settings.', false);
  }
}

// ===== Event Handlers =====

// Provider selector change
provider.addEventListener("change", (e) => {
  showProviderSection(e.target.value);
});

// Toggle Gemini API key visibility
toggleGeminiKey.addEventListener("click", () => {
  const isPassword = geminiApiKey.type === "password";
  geminiApiKey.type = isPassword ? "text" : "password";
  toggleGeminiKey.querySelector('.ico').textContent = isPassword ? "🙈" : "👁️";
});

// Toggle Cerebras API key visibility
toggleCerebrasKey.addEventListener("click", () => {
  const isPassword = cerebrasApiKey.type === "password";
  cerebrasApiKey.type = isPassword ? "text" : "password";
  toggleCerebrasKey.querySelector('.ico').textContent = isPassword ? "🙈" : "👁️";
});

// Temperature slider
temperature.addEventListener("input", (e) => {
  temperatureValue.textContent = e.target.value;
});

// Top-P slider
topP.addEventListener("input", (e) => {
  topPValue.textContent = e.target.value;
});

// Add custom model
btnAddCustomModel.addEventListener("click", async () => {
  const modelId = customModelId.value.trim();
  const tokens = parseInt(customModelTokens.value, 10);
  
  if (!modelId) {
    status("Please enter a model ID.", false);
    return;
  }
  
  if (!tokens || tokens <= 0) {
    status("Please enter a valid max tokens value.", false);
    return;
  }
  
  try {
    await addCustomModel(modelId, tokens);
    status("Custom model added.");
    customModelId.value = "";
    customModelTokens.value = "";
    await renderCustomModels();
  } catch (err) {
    status(`Failed to add model: ${err.message}`, false);
  }
});

// Form submit - Save settings
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  try {
    const selectedProvider = provider.value;
    const sp = systemPrompt.value;
    
    // Save provider selection
    await chrome.storage.local.set({ selectedProvider });
    
    if (selectedProvider === "gemini") {
      // Save Gemini settings to sync storage
      const key = geminiApiKey.value.trim();
      const mdl = geminiModel.value;
      
      if (!key) {
        status("Please add your Gemini API key.", false);
        return;
      }
      
      await chrome.storage.sync.set({
        geminiApiKey: key,
        geminiModel: mdl,
        geminiPrompt: sp
      });
    } else if (selectedProvider === "cerebras") {
      // Save Cerebras settings to local storage with obfuscation
      const key = cerebrasApiKey.value.trim();
      const mdl = cerebrasModel.value;
      const temp = parseFloat(temperature.value);
      const tp = parseFloat(topP.value);
      const mt = maxTokens.value.trim();
      const stream = streamToggle.checked;
      
      if (!key) {
        status("Please add your Cerebras API key.", false);
        return;
      }
      
      // Obfuscate the API key before storing
      const obfuscatedKey = obfuscateKey(key);
      
      await chrome.storage.local.set({
        cerebrasApiKey: obfuscatedKey,
        cerebrasModel: mdl,
        cerebrasTemperature: temp,
        cerebrasTopP: tp,
        cerebrasMaxTokens: mt,
        cerebrasStream: stream
      });
      
      // Also save system prompt to sync for consistency
      await chrome.storage.sync.set({ geminiPrompt: sp });
    }
    
    status("Settings saved.");
  } catch (err) {
    console.error('Failed to save settings:', err);
    status('Failed to save settings.', false);
  }
});

// Clear button
btnClear.addEventListener("click", async () => {
  try {
    // Clear all settings
    await chrome.storage.sync.remove(["geminiApiKey", "geminiModel", "geminiPrompt"]);
    await chrome.storage.local.remove([
      "selectedProvider",
      "cerebrasApiKey",
      "cerebrasModel",
      "cerebrasTemperature",
      "cerebrasTopP",
      "cerebrasMaxTokens",
      "cerebrasStream",
      "customCerebrasModels"
    ]);
    
    // Reset form
    provider.value = "gemini";
    geminiApiKey.value = "";
    geminiModel.value = "gemini-2.5-pro";
    cerebrasApiKey.value = "";
    cerebrasModel.value = "zai-glm-4.7";
    temperature.value = 0.7;
    temperatureValue.textContent = "0.7";
    topP.value = 0.9;
    topPValue.textContent = "0.9";
    maxTokens.value = "";
    streamToggle.checked = true;
    systemPrompt.value = "";
    
    showProviderSection("gemini");
    await renderCustomModels();
    
    status("All settings cleared.");
    sampleOut.classList.add("hidden");
    sampleOut.textContent = "";
  } catch (err) {
    console.error('Failed to clear settings:', err);
    status('Failed to clear settings.', false);
  }
});

// Test connection button
btnTest.addEventListener("click", async () => {
  const selectedProvider = provider.value;
  
  status("Testing connection…");
  sampleOut.classList.add("hidden");
  sampleOut.textContent = "";
  
  try {
    const messageType = selectedProvider === "gemini" ? "UPO_TEST_GEMINI" : "UPO_TEST_CEREBRAS";
    const resp = await chrome.runtime.sendMessage({ type: messageType });
    
    if (!resp?.ok) {
      status(`Test failed: ${resp?.error || "Unknown error"}`, false);
      return;
    }
    
    status("Test succeeded.");
    sampleOut.textContent = resp.sample || resp.text || "Connection successful!";
    sampleOut.classList.remove("hidden");
  } catch (err) {
    console.error('Test failed:', err);
    status(`Test failed: ${err.message}`, false);
  }
});

// Shortcuts button
btnShortcuts.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_SHORTCUTS" });
});

// Gemini API keys buttons
btnAPIKeys.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_API_KEYS" });
});
btnAPIKeys2.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_API_KEYS" });
});

// Cerebras API keys buttons
btnCerebrasKeys.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_CEREBRAS_KEYS" });
});
btnCerebrasKeys2.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_CEREBRAS_KEYS" });
});

// ===== Initialize =====
loadSettings();
