// options/options.js - Enhanced options with tabs and theme support

import { ThemeManager, THEMES } from '../shared/theme.js';
import { getUsageStats, clearHistory, exportLibrary } from '../shared/history.js';

// Initialize theme
const themeManager = new ThemeManager();
themeManager.init();

// DOM Elements
const tabs = document.querySelectorAll('.sidebar-tab');
const panels = document.querySelectorAll('.tab-panel');
const settingsForm = document.getElementById('settingsForm');
const apiKeyInput = document.getElementById('apiKey');
const modelSelect = document.getElementById('model');
const systemPromptTextarea = document.getElementById('systemPrompt');
const toggleApiKeyBtn = document.getElementById('toggleApiKey');
const statusEl = document.getElementById('status');
const sampleOut = document.getElementById('sampleOut');
const themeToggle = document.getElementById('themeToggle');
const themeOptions = document.querySelectorAll('.theme-option');

// Buttons
const btnTest = document.getElementById('btnTest');
const btnClear = document.getElementById('btnClear');
const btnOpenShortcuts = document.getElementById('btnOpenShortcuts');
const getApiKeyLink = document.getElementById('getApiKeyLink');
const btnViewHistory = document.getElementById('btnViewHistory');
const btnClearHistory = document.getElementById('btnClearHistory');
const btnExportData = document.getElementById('btnExportData');
const saveCustomPrompt = document.getElementById('saveCustomPrompt');

// State
let currentTab = 'general';

// Initialize
async function init() {
  await loadSettings();
  await loadStats();
  await loadTheme();
  setupEventListeners();
}

// Load Settings
async function loadSettings() {
  const { 
    geminiApiKey = '', 
    geminiModel = 'gemini-2.5-pro', 
    geminiPrompt = '' 
  } = await chrome.storage.sync.get(['geminiApiKey', 'geminiModel', 'geminiPrompt']);
  
  apiKeyInput.value = geminiApiKey;
  modelSelect.value = geminiModel;
  systemPromptTextarea.value = geminiPrompt;
}

// Load Stats
async function loadStats() {
  const stats = await getUsageStats();
  document.getElementById('totalOptimizations').textContent = stats.totalOptimizations;
  document.getElementById('avgCharChange').textContent = stats.avgCharChange;
  document.getElementById('librarySize').textContent = stats.librarySize;
}

// Load Theme
async function loadTheme() {
  const currentTheme = themeManager.getTheme();
  themeOptions.forEach(option => {
    const isActive = option.dataset.theme === currentTheme;
    option.classList.toggle('active', isActive);
  });
  updateThemeIcon();
}

// Setup Event Listeners
function setupEventListeners() {
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });
  
  // Form submission
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveSettings();
  });
  
  // Toggle API key visibility
  toggleApiKeyBtn.addEventListener('click', () => {
    const type = apiKeyInput.type === 'password' ? 'text' : 'password';
    apiKeyInput.type = type;
  });
  
  // Test API
  btnTest.addEventListener('click', async () => {
    await testApiConnection();
  });
  
  // Clear all data
  btnClear.addEventListener('click', async () => {
    if (confirm('Clear all settings and data? This cannot be undone.')) {
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      await loadSettings();
      await loadStats();
      showStatus('All data cleared.', 'success');
    }
  });
  
  // Theme toggle
  themeToggle.addEventListener('click', async () => {
    await themeManager.toggle();
    await loadTheme();
  });
  
  // Theme options
  themeOptions.forEach(option => {
    option.addEventListener('click', async () => {
      const theme = option.dataset.theme;
      await themeManager.setTheme(theme);
      await loadTheme();
    });
  });
  
  // Shortcuts
  btnOpenShortcuts.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'UPO_OPEN_SHORTCUTS' });
  });
  
  // API key link
  getApiKeyLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: 'UPO_OPEN_API_KEYS' });
  });
  
  // Save custom prompt
  saveCustomPrompt.addEventListener('click', async () => {
    await saveSettings();
  });
  
  // View history (open popup)
  btnViewHistory.addEventListener('click', () => {
    chrome.action.openPopup();
  });
  
  // Clear history
  btnClearHistory.addEventListener('click', async () => {
    if (confirm('Clear all optimization history?')) {
      await clearHistory();
      await loadStats();
      showStatus('History cleared.', 'success');
    }
  });
  
  // Export data
  btnExportData.addEventListener('click', async () => {
    try {
      const data = await exportLibrary();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `upo-library-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showStatus('Library exported successfully.', 'success');
    } catch (error) {
      showStatus('Export failed: ' + error.message, 'error');
    }
  });
}

// Switch Tab
function switchTab(tabName) {
  currentTab = tabName;
  
  // Update tabs
  tabs.forEach(tab => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
  });
  
  // Update panels
  panels.forEach(panel => {
    const isActive = panel.id === `panel-${tabName}`;
    panel.classList.toggle('active', isActive);
  });
  
  // Reload stats if on usage tab
  if (tabName === 'usage') {
    loadStats();
  }
}

// Save Settings
async function saveSettings() {
  const apiKey = apiKeyInput.value.trim();
  const model = modelSelect.value;
  const prompt = systemPromptTextarea.value.trim();
  
  if (!apiKey) {
    showStatus('Please enter your Gemini API key.', 'error');
    apiKeyInput.focus();
    return;
  }
  
  try {
    await chrome.storage.sync.set({
      geminiApiKey: apiKey,
      geminiModel: model,
      geminiPrompt: prompt
    });
    
    showStatus('✓ Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Failed to save settings: ' + error.message, 'error');
  }
}

// Test API Connection
async function testApiConnection() {
  showStatus('Testing API connection...', 'success');
  sampleOut.classList.add('hidden');
  sampleOut.textContent = '';
  
  try {
    const response = await chrome.runtime.sendMessage({ type: 'UPO_TEST_GEMINI' });
    
    if (!response?.ok) {
      throw new Error(response?.error || 'Test failed');
    }
    
    showStatus('✓ API connection successful!', 'success');
    sampleOut.textContent = response.sample;
    sampleOut.classList.remove('hidden');
  } catch (error) {
    let errorMsg = error.message;
    if (errorMsg.includes('API key')) {
      errorMsg = 'API Key is invalid or missing. Please check your settings.';
    } else if (errorMsg.includes('quota')) {
      errorMsg = 'API quota exceeded. Try again later or check your usage.';
    }
    showStatus('✗ Test failed: ' + errorMsg, 'error');
  }
}

// Show Status Message
function showStatus(message, type = 'success') {
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  
  // Clear after 3 seconds
  clearTimeout(showStatus._timeout);
  showStatus._timeout = setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'status-message';
  }, 3000);
}

// Update Theme Icon
function updateThemeIcon() {
  const effectiveTheme = themeManager.getEffectiveTheme();
  const icon = themeToggle.querySelector('svg path');
  
  if (effectiveTheme === 'dark') {
    // Show sun icon for switching to light
    icon.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
  } else {
    // Show moon icon for switching to dark
    icon.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
  }
}

// Initialize
init();
