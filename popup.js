// popup.js - Popup functionality
document.addEventListener('DOMContentLoaded', () => {
  const optionsBtn = document.getElementById('optionsBtn');
  const statusDiv = document.getElementById('statusDiv');
  const modelInfo = document.getElementById('modelInfo');
  const currentModel = document.getElementById('currentModel');
  const currentTemp = document.getElementById('currentTemp');
  const currentMaxTokens = document.getElementById('currentMaxTokens');

  // Check if API key is configured and load settings
  chrome.storage.local.get(['cerebrasApiKey', 'selectedModel', 'temperature', 'maxTokens'], (data) => {
    if (data.cerebrasApiKey) {
      statusDiv.className = 'status configured';
      statusDiv.textContent = '✓ Configured and ready';
      
      // Show model info
      modelInfo.style.display = 'block';
      
      // Display model name
      const modelNames = {
        'llama3.1-8b': 'Llama 3.1 8B',
        'llama3.1-70b': 'Llama 3.1 70B',
        'llama3.3-70b': 'Llama 3.3 70B'
      };
      currentModel.textContent = modelNames[data.selectedModel] || data.selectedModel || 'llama3.1-8b';
      currentTemp.textContent = data.temperature !== undefined ? data.temperature : '0.7';
      currentMaxTokens.textContent = data.maxTokens || '2000';
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
