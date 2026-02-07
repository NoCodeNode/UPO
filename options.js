// options.js - Handle settings
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('modelSelect');
  const temperatureInput = document.getElementById('temperature');
  const tempValue = document.getElementById('tempValue');
  const maxTokensInput = document.getElementById('maxTokens');
  const systemPromptInput = document.getElementById('systemPrompt');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const status = document.getElementById('status');

  // Update temperature display
  temperatureInput.addEventListener('input', () => {
    tempValue.textContent = temperatureInput.value;
  });

  // Load saved settings
  chrome.storage.local.get(['cerebrasApiKey', 'selectedModel', 'temperature', 'maxTokens', 'customSystemPrompt'], (data) => {
    if (data.cerebrasApiKey) {
      apiKeyInput.value = data.cerebrasApiKey;
    }
    if (data.selectedModel) {
      modelSelect.value = data.selectedModel;
    }
    if (data.temperature !== undefined) {
      temperatureInput.value = data.temperature;
      tempValue.textContent = data.temperature;
    }
    if (data.maxTokens) {
      maxTokensInput.value = data.maxTokens;
    }
    if (data.customSystemPrompt) {
      systemPromptInput.value = data.customSystemPrompt;
    }
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }
    
    if (!apiKey.startsWith('csk-')) {
      showStatus('Invalid API key format. Should start with "csk-"', 'error');
      return;
    }
    
    const settings = {
      cerebrasApiKey: apiKey,
      selectedModel: modelSelect.value,
      temperature: parseFloat(temperatureInput.value),
      maxTokens: parseInt(maxTokensInput.value),
      customSystemPrompt: systemPromptInput.value.trim() || null
    };
    
    chrome.storage.local.set(settings, () => {
      showStatus('✓ Settings saved successfully!', 'success');
    });
  });

  // Test connection
  testBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;
    
    if (!apiKey) {
      showStatus('Please enter an API key first', 'error');
      return;
    }
    
    showStatus(`Testing connection with ${model}...`, 'info');
    testBtn.disabled = true;
    
    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'user', content: 'Say "Connection successful!" if you can read this.' }
          ],
          max_tokens: 50
        })
      });

      if (response.ok) {
        const data = await response.json();
        showStatus(`✓ Connection successful with ${model}! API is working.`, 'success');
      } else {
        const errorText = await response.text();
        showStatus(`Connection failed: ${response.status} ${response.statusText}`, 'error');
      }
    } catch (error) {
      showStatus(`Connection error: ${error.message}`, 'error');
    } finally {
      testBtn.disabled = false;
    }
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
  }
});
