// popup.js - Popup functionality
document.addEventListener('DOMContentLoaded', () => {
  const optionsBtn = document.getElementById('optionsBtn');
  const statusDiv = document.getElementById('statusDiv');

  // Check if API key is configured
  chrome.storage.local.get('cerebrasApiKey', (data) => {
    if (data.cerebrasApiKey) {
      statusDiv.className = 'status configured';
      statusDiv.textContent = '✓ Configured and ready';
    } else {
      statusDiv.className = 'status not-configured';
      statusDiv.textContent = '⚠ Not configured - click Settings';
    }
  });

  // Open options page
  optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
