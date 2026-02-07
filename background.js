// background.js - Simple Cerebras API integration
console.log('[UPO] Background script loaded');

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'upo-optimize',
    title: 'Optimize with UPO',
    contexts: ['selection']
  });
  console.log('[UPO] Extension installed, context menu created');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'upo-optimize') {
    chrome.tabs.sendMessage(tab.id, { action: 'optimize' });
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'optimize-text') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'optimize' });
      }
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'callCerebras') {
    console.log('[UPO] Calling Cerebras API');
    callCerebrasAPI(request.text)
      .then(result => {
        console.log('[UPO] Cerebras API success');
        sendResponse({ success: true, result: result });
      })
      .catch(error => {
        console.error('[UPO] Cerebras API error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }
});

// Call Cerebras API
async function callCerebrasAPI(userText) {
  // Get API key from storage
  const { cerebrasApiKey } = await chrome.storage.local.get('cerebrasApiKey');
  
  if (!cerebrasApiKey) {
    throw new Error('Please set your Cerebras API key in the extension options');
  }

  const systemPrompt = `You are the Universal Prompt Optimizer (UPO).

Your task is to transform user input into an optimized, structured prompt for Large Language Models.

Rules:
1. Output ONLY the optimized prompt - no explanations, no meta-commentary
2. Structure the prompt with clear sections (e.g., ROLE, TASK, CONTEXT, FORMAT)
3. Make it detailed, specific, and actionable
4. Use markdown formatting for clarity
5. Do NOT wrap the output in code blocks or add any prefixes/suffixes

Transform the user's input into a professional, well-structured prompt.`;

  const payload = {
    model: 'llama3.1-8b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userText }
    ],
    temperature: 0.7,
    max_tokens: 2000
  };

  console.log('[UPO] Sending request to Cerebras API');
  
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cerebrasApiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[UPO] API error response:', errorText);
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[UPO] API response received');
  
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  
  throw new Error('Invalid API response format');
}
