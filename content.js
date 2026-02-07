// content.js - Handle text selection and optimization
console.log('[UPO] Content script loaded');

// Listen for messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'optimize') {
    optimizeSelection();
  }
});

function optimizeSelection() {
  console.log('[UPO] Optimize triggered');
  
  // Get selected text
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (!selectedText) {
    showToast('Please select some text first');
    return;
  }
  
  console.log('[UPO] Selected text:', selectedText.substring(0, 50) + '...');
  
  // Get the range for replacement
  const range = selection.getRangeAt(0);
  
  // Show loading state
  showToast('Optimizing with Cerebras AI...', 0);
  
  // Call background script to make API call
  chrome.runtime.sendMessage(
    { action: 'callCerebras', text: selectedText },
    (response) => {
      if (response.success) {
        console.log('[UPO] Optimization successful');
        
        // Replace the selected text
        range.deleteContents();
        const textNode = document.createTextNode(response.result);
        range.insertNode(textNode);
        
        // Move cursor to end
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        showToast('✓ Prompt optimized!', 2000);
      } else {
        console.error('[UPO] Optimization failed:', response.error);
        showToast('Error: ' + response.error, 4000);
      }
    }
  );
}

function showToast(message, duration = 3000) {
  // Remove existing toast
  const existing = document.getElementById('upo-toast');
  if (existing) existing.remove();
  
  // Create toast
  const toast = document.createElement('div');
  toast.id = 'upo-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2563eb;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 500;
  `;
  
  document.body.appendChild(toast);
  
  if (duration > 0) {
    setTimeout(() => toast.remove(), duration);
  }
}
