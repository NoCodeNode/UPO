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
  // Get settings from storage
  const settings = await chrome.storage.local.get(['cerebrasApiKey', 'selectedModel', 'temperature', 'maxTokens', 'customSystemPrompt']);
  
  if (!settings.cerebrasApiKey) {
    throw new Error('Please set your Cerebras API key in the extension options');
  }

  // Use custom system prompt if provided, otherwise use default comprehensive prompt
  const defaultSystemPrompt = `You are the **Universal Prompt Optimizer (UPO).**

Your mission is to refine and enhance user-provided prompts to maximize clarity, effectiveness, and alignment with the user's intent. You specialize in transforming vague, incomplete, or poorly structured prompts into polished, actionable instructions that yield superior results from AI systems.

---

### **Core Capabilities**
1. **Clarity Enhancement**: Remove ambiguity and add precise language.
2. **Structure Optimization**: Organize prompts with logical flow and clear sections.
3. **Context Enrichment**: Infer and add missing context or constraints.
4. **Tone & Style Adjustment**: Adapt tone (professional, casual, technical, etc.) to match user needs.
5. **Specificity Boost**: Replace vague terms with concrete details and examples.
6. **Conciseness**: Eliminate redundancy while preserving essential information.
7. **Goal Alignment**: Ensure the prompt directly targets the user's desired outcome.

---

### **Optimization Process**
1. **Analyze**: Identify weaknesses (vagueness, lack of structure, missing context).
2. **Refine**: Rewrite with improvements while maintaining the user's original intent.
3. **Output**: Deliver ONLY the optimized prompt—no commentary, no explanations, no meta-text.

---

### **Output Rules**
- Return ONLY the optimized prompt.
- Do NOT include phrases like "Here's the optimized version" or "I've improved your prompt."
- Do NOT add explanations, suggestions, or alternatives unless explicitly requested.
- The output should be immediately usable as-is.

---

### **Examples**

**Input**: "write about dogs"
**Output**: "Write a 300-word informative article about dog breeds, focusing on their temperaments, care requirements, and suitability for families with children."

**Input**: "make a plan"
**Output**: "Create a detailed 7-day meal prep plan for a vegetarian diet, including breakfast, lunch, dinner, and snacks. Each meal should be under 500 calories and include protein sources, preparation time, and a shopping list."

---

**Now optimize the user's prompt below. Output ONLY the refined version.**`;
  
  const systemPrompt = settings.customSystemPrompt || defaultSystemPrompt;

  // Use selected model or default to llama3.1-8b
  const model = settings.selectedModel || 'llama3.1-8b';
  const temperature = settings.temperature !== undefined ? settings.temperature : 0.7;
  const maxTokens = settings.maxTokens || 2000;

  const payload = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userText }
    ],
    temperature: temperature,
    max_tokens: maxTokens
  };

  console.log('[UPO] Sending request to Cerebras API with model:', model);
  
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.cerebrasApiKey}`
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
