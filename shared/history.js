// shared/history.js - Optimization history and prompt library management

const HISTORY_KEY = 'upoHistory';
const LIBRARY_KEY = 'upoLibrary';
const MAX_HISTORY_ITEMS = 50;

/**
 * History item structure:
 * {
 *   id: string (timestamp-based),
 *   original: string,
 *   optimized: string,
 *   mode: string,
 *   timestamp: number,
 *   charCountChange: number
 * }
 */

/**
 * Library item structure:
 * {
 *   id: string,
 *   title: string,
 *   prompt: string,
 *   tags: string[],
 *   createdAt: number,
 *   usageCount: number
 * }
 */

/**
 * Add item to history
 */
async function addToHistory(original, optimized, mode) {
  const history = await getHistory();
  
  const item = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    original: original.trim(),
    optimized: optimized.trim(),
    mode: mode || 'precise',
    timestamp: Date.now(),
    charCountChange: optimized.length - original.length
  };
  
  // Add to beginning of array
  history.unshift(item);
  
  // Keep only last MAX_HISTORY_ITEMS
  const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
  
  await chrome.storage.local.set({ [HISTORY_KEY]: trimmed });
  return item;
}

/**
 * Get all history items
 */
async function getHistory() {
  const { [HISTORY_KEY]: history } = await chrome.storage.local.get([HISTORY_KEY]);
  return history || [];
}

/**
 * Get history item by ID
 */
async function getHistoryItem(id) {
  const history = await getHistory();
  return history.find(item => item.id === id);
}

/**
 * Delete history item
 */
async function deleteHistoryItem(id) {
  const history = await getHistory();
  const filtered = history.filter(item => item.id !== id);
  await chrome.storage.local.set({ [HISTORY_KEY]: filtered });
}

/**
 * Clear all history
 */
async function clearHistory() {
  await chrome.storage.local.remove([HISTORY_KEY]);
}

/**
 * Search history
 */
async function searchHistory(query) {
  const history = await getHistory();
  const lowerQuery = query.toLowerCase();
  
  return history.filter(item => 
    item.original.toLowerCase().includes(lowerQuery) ||
    item.optimized.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get library items
 */
async function getLibrary() {
  const { [LIBRARY_KEY]: library } = await chrome.storage.local.get([LIBRARY_KEY]);
  return library || [];
}

/**
 * Add item to library
 */
async function addToLibrary(title, prompt, tags = []) {
  const library = await getLibrary();
  
  const item = {
    id: `lib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: title.trim(),
    prompt: prompt.trim(),
    tags: tags.filter(t => t && t.trim()),
    createdAt: Date.now(),
    usageCount: 0
  };
  
  library.unshift(item);
  await chrome.storage.local.set({ [LIBRARY_KEY]: library });
  return item;
}

/**
 * Update library item
 */
async function updateLibraryItem(id, updates) {
  const library = await getLibrary();
  const index = library.findIndex(item => item.id === id);
  
  if (index !== -1) {
    library[index] = { ...library[index], ...updates };
    await chrome.storage.local.set({ [LIBRARY_KEY]: library });
    return library[index];
  }
  return null;
}

/**
 * Increment usage count for library item
 */
async function incrementLibraryUsage(id) {
  const library = await getLibrary();
  const index = library.findIndex(item => item.id === id);
  
  if (index !== -1) {
    library[index].usageCount = (library[index].usageCount || 0) + 1;
    await chrome.storage.local.set({ [LIBRARY_KEY]: library });
  }
}

/**
 * Delete library item
 */
async function deleteLibraryItem(id) {
  const library = await getLibrary();
  const filtered = library.filter(item => item.id !== id);
  await chrome.storage.local.set({ [LIBRARY_KEY]: filtered });
}

/**
 * Search library
 */
async function searchLibrary(query) {
  const library = await getLibrary();
  const lowerQuery = query.toLowerCase();
  
  return library.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.prompt.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Export library as JSON
 */
async function exportLibrary() {
  const library = await getLibrary();
  return JSON.stringify(library, null, 2);
}

/**
 * Import library from JSON
 */
async function importLibrary(jsonString, merge = false) {
  try {
    const imported = JSON.parse(jsonString);
    
    if (!Array.isArray(imported)) {
      throw new Error('Invalid library format');
    }
    
    if (merge) {
      const existing = await getLibrary();
      const combined = [...existing, ...imported];
      await chrome.storage.local.set({ [LIBRARY_KEY]: combined });
    } else {
      await chrome.storage.local.set({ [LIBRARY_KEY]: imported });
    }
    
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}

/**
 * Get usage statistics
 */
async function getUsageStats() {
  const history = await getHistory();
  const library = await getLibrary();
  
  // Count by mode
  const modeCount = {};
  history.forEach(item => {
    modeCount[item.mode] = (modeCount[item.mode] || 0) + 1;
  });
  
  // Total character changes
  const totalCharChange = history.reduce((sum, item) => sum + Math.abs(item.charCountChange), 0);
  
  // Average char change
  const avgCharChange = history.length > 0 ? totalCharChange / history.length : 0;
  
  return {
    totalOptimizations: history.length,
    librarySize: library.length,
    modeUsage: modeCount,
    totalCharChange,
    avgCharChange: Math.round(avgCharChange),
    lastOptimization: history[0]?.timestamp || null
  };
}

// Export for ES6 module usage
export {
  addToHistory,
  getHistory,
  getHistoryItem,
  deleteHistoryItem,
  clearHistory,
  searchHistory,
  getLibrary,
  addToLibrary,
  updateLibraryItem,
  incrementLibraryUsage,
  deleteLibraryItem,
  searchLibrary,
  exportLibrary,
  importLibrary,
  getUsageStats
};
