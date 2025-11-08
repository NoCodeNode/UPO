// popup/popup.js - Enhanced popup with tabs, modes, and history

// Import shared modules
import { getHistory, deleteHistoryItem, clearHistory, getUsageStats } from '../shared/history.js';
import { getAllModes, getLastMode, saveLastMode } from '../shared/modes.js';
import { ThemeManager } from '../shared/theme.js';

// Initialize theme
const themeManager = new ThemeManager();
themeManager.init();

// DOM Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const modeCards = document.querySelectorAll('.mode-card');
const optimizeBtn = document.getElementById('optimizeNow');
const openSettingsBtn = document.getElementById('openFullSettings');
const openShortcutsBtn = document.getElementById('openShortcuts');
const openApiKeysBtn = document.getElementById('openApiKeys');
const clearHistoryBtn = document.getElementById('clearHistory');
const historyList = document.getElementById('historyList');
const themeToggle = document.getElementById('themeToggle');

// State
let currentMode = 'precise';
let currentTab = 'optimize';

// Initialize
async function init() {
  // Load last used mode
  currentMode = await getLastMode();
  updateModeSelection();
  
  // Load history
  await loadHistory();
  
  // Load stats
  await loadStats();
  
  // Set up event listeners
  setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
  
  // Mode selection
  modeCards.forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.mode;
      selectMode(mode);
    });
  });
  
  // Optimize button
  optimizeBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { 
        type: "UPO_OPTIMIZE_SELECTION",
        mode: currentMode 
      });
      window.close();
    }
  });
  
  // Settings buttons
  openSettingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  openShortcutsBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: "UPO_OPEN_SHORTCUTS" });
  });
  
  openApiKeysBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: "UPO_OPEN_API_KEYS" });
  });
  
  // Clear history
  clearHistoryBtn.addEventListener('click', async () => {
    if (confirm('Clear all optimization history?')) {
      await clearHistory();
      await loadHistory();
      await loadStats();
    }
  });
  
  // Theme toggle
  themeToggle.addEventListener('click', async () => {
    await themeManager.toggle();
    updateThemeIcon();
  });
}

// Switch Tab
function switchTab(tabName) {
  currentTab = tabName;
  
  // Update tabs
  tabs.forEach(tab => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });
  
  // Update content
  tabContents.forEach(content => {
    const isActive = content.id === `tab-${tabName}`;
    content.classList.toggle('active', isActive);
    
    // Add animation
    if (isActive) {
      content.classList.add('tab-content-enter');
      setTimeout(() => content.classList.remove('tab-content-enter'), 300);
    }
  });
  
  // Reload data if needed
  if (tabName === 'history') {
    loadHistory();
  } else if (tabName === 'settings') {
    loadStats();
  }
}

// Select Mode
async function selectMode(mode) {
  currentMode = mode;
  await saveLastMode(mode);
  updateModeSelection();
}

// Update Mode Selection UI
function updateModeSelection() {
  modeCards.forEach(card => {
    const isActive = card.dataset.mode === currentMode;
    card.classList.toggle('active', isActive);
  });
}

// Load History
async function loadHistory() {
  const history = await getHistory();
  
  if (history.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📚</span>
        <p>No history yet</p>
        <p class="empty-hint">Optimize some text to see it here</p>
      </div>
    `;
    return;
  }
  
  // Display first 10 items
  const items = history.slice(0, 10);
  historyList.innerHTML = items.map(item => createHistoryItemHTML(item)).join('');
  
  // Add event listeners to history items
  historyList.querySelectorAll('.history-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.id;
      const item = history.find(h => h.id === itemId);
      if (item) {
        copyToClipboard(item.optimized);
        btn.textContent = '✓ Copied';
        setTimeout(() => btn.textContent = 'Copy', 1000);
      }
    });
  });
  
  historyList.querySelectorAll('.history-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId = btn.dataset.id;
      await deleteHistoryItem(itemId);
      await loadHistory();
      await loadStats();
    });
  });
}

// Create History Item HTML
function createHistoryItemHTML(item) {
  const timeAgo = formatTimeAgo(item.timestamp);
  const modeIcon = getModeIcon(item.mode);
  const charDiff = item.charCountChange > 0 ? `+${item.charCountChange}` : `${item.charCountChange}`;
  
  return `
    <div class="history-item fade-in">
      <div class="history-meta">
        <span class="history-mode">${modeIcon} ${item.mode}</span>
        <span class="history-time">${timeAgo}</span>
      </div>
      <p class="history-text">${escapeHtml(item.original)}</p>
      <div class="history-actions">
        <button class="history-btn history-copy" data-id="${item.id}">Copy</button>
        <button class="history-btn history-delete" data-id="${item.id}">Delete</button>
        <span class="history-btn" style="cursor: default;">${charDiff} chars</span>
      </div>
    </div>
  `;
}

// Load Stats
async function loadStats() {
  const stats = await getUsageStats();
  document.getElementById('statTotal').textContent = stats.totalOptimizations;
  document.getElementById('statLibrary').textContent = stats.librarySize;
}

// Helper: Get mode icon
function getModeIcon(mode) {
  const icons = {
    'precise': '🎯',
    'quick': '⚡',
    'detailed': '📝',
    'creative': '🎨',
    'professional': '💼'
  };
  return icons[mode] || '🎯';
}

// Helper: Format time ago
function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Helper: Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// Helper: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Helper: Update theme icon
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

// Initialize on load
init();
updateThemeIcon();
