// options.js - Handle settings
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const status = document.getElementById('status');

  // Load saved API key
  chrome.storage.local.get('cerebrasApiKey', (data) => {
    if (data.cerebrasApiKey) {
      apiKeyInput.value = data.cerebrasApiKey;
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
    
    chrome.storage.local.set({ cerebrasApiKey: apiKey }, () => {
      showStatus('✓ Settings saved successfully!', 'success');
    });
  });

  // Test connection
  testBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key first', 'error');
      return;
    }
    
    showStatus('Testing connection...', 'info');
    testBtn.disabled = true;
    
    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: [
            { role: 'user', content: 'Say "Connection successful!" if you can read this.' }
          ],
          max_tokens: 50
        })
      });

      if (response.ok) {
        const data = await response.json();
        showStatus('✓ Connection successful! API is working.', 'success');
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
