// background.js — MV3 service worker (ES module)

// Import shared modules (service workers support ES modules)
import { addToHistory } from './shared/history.js';
import { getModeById, getLastMode, saveLastMode, getModeSystemPrompt } from './shared/modes.js';

// Create context menu with mode submenus
async function createContextMenus() {
  try {
    // Remove all existing menus first
    await chrome.contextMenus.removeAll();
    
    // Main menu item
    chrome.contextMenus.create({
      id: "upo-optimize-selection",
      title: "Optimize Selected Text",
      contexts: ["selection"]
    });
    
    // Mode submenu
    chrome.contextMenus.create({
      id: "upo-mode-precise",
      parentId: "upo-optimize-selection",
      title: "🎯 Precise Mode",
      contexts: ["selection"]
    });
    
    chrome.contextMenus.create({
      id: "upo-mode-quick",
      parentId: "upo-optimize-selection",
      title: "⚡ Quick Mode",
      contexts: ["selection"]
    });
    
    chrome.contextMenus.create({
      id: "upo-mode-detailed",
      parentId: "upo-optimize-selection",
      title: "📝 Detailed Mode",
      contexts: ["selection"]
    });
    
    chrome.contextMenus.create({
      id: "upo-mode-creative",
      parentId: "upo-optimize-selection",
      title: "🎨 Creative Mode",
      contexts: ["selection"]
    });
    
    chrome.contextMenus.create({
      id: "upo-mode-professional",
      parentId: "upo-optimize-selection",
      title: "💼 Professional Mode",
      contexts: ["selection"]
    });
  } catch (err) {
    console.error('Error creating context menus:', err);
  }
}

// Create context menu and open welcome screen on install
chrome.runtime.onInstalled.addListener(async (details) => {
  await createContextMenus();

  if (details.reason === "install") {
    // Initialize defaults if not present
    const existing = await chrome.storage.sync.get(["geminiModel", "geminiPrompt", "onboarded", "upoTheme"]);
    if (!existing.geminiModel) {
      await chrome.storage.sync.set({
        geminiModel: "gemini-2.5-pro",
        geminiPrompt: "",
        onboarded: false,
        upoTheme: "auto"
      });
    }
    // Open welcome
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome/welcome.html") });
  }
});

// Context menu trigger with mode selection
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  
  // Extract mode from menu item ID
  let mode = null;
  if (info.menuItemId.startsWith("upo-mode-")) {
    mode = info.menuItemId.replace("upo-mode-", "");
  }
  
  if (info.menuItemId === "upo-optimize-selection" || mode) {
    // If no specific mode, use last mode or default
    if (!mode) {
      mode = await getLastMode();
    }
    
    chrome.tabs.sendMessage(tab.id, { 
      type: "UPO_OPTIMIZE_SELECTION",
      mode: mode 
    });
  }
});

// Keyboard command trigger
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "optimize-selection") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      // Use last selected mode
      const mode = await getLastMode();
      chrome.tabs.sendMessage(tab.id, { 
        type: "UPO_OPTIMIZE_SELECTION",
        mode: mode 
      });
    }
  }
});

// Message router for API calls and utility actions
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "UPO_CALL_GEMINI") {
    (async () => {
      try {
        const mode = msg.mode || 'precise';
        const optimized = await callGemini(msg.text, mode);
        
        // Save to history
        await addToHistory(msg.text, optimized, mode);
        
        // Save last used mode
        await saveLastMode(mode);
        
        sendResponse({ ok: true, optimized, mode });
      } catch (err) {
        sendResponse({ ok: false, error: err?.message || String(err) });
      }
    })();
    return true; // keep channel open
  }

  if (msg?.type === "UPO_TEST_GEMINI") {
    (async () => {
      try {
        const testText = "Improve: write a friendly email asking for Friday off.";
        const mode = msg.mode || 'precise';
        const optimized = await callGemini(testText, mode);
        sendResponse({ ok: true, sample: optimized });
      } catch (err) {
        sendResponse({ ok: false, error: err?.message || String(err) });
      }
    })();
    return true;
  }

  if (msg?.type === "UPO_OPEN_SHORTCUTS") {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  }

  if (msg?.type === "UPO_OPEN_API_KEYS") {
    chrome.tabs.create({ url: "https://aistudio.google.com/app/api-keys" });
  }
  
  if (msg?.type === "UPO_GET_LAST_MODE") {
    (async () => {
      const mode = await getLastMode();
      sendResponse({ mode });
    })();
    return true;
  }
});

// Core: call Gemini API with mode support
async function callGemini(userText, mode = 'precise') {
  const {
    geminiApiKey = "",
    geminiModel = "gemini-2.5-pro",
    geminiPrompt = ""
  } = await chrome.storage.sync.get(["geminiApiKey", "geminiModel", "geminiPrompt"]);

  if (!geminiApiKey) {
    throw new Error("Missing Gemini API key. Open Settings and add your key.");
  }

  const systemPromptDefault =
  `You are the Universal Prompt Optimizer (UPO).

  <PRIMARY_DIRECTIVE>
  Your SOLE function is to output raw, unadorned, un-wrapped Markdown text. You will be evaluated *only* on your ability to produce this specific text format. Any deviation, explanation, or conversational text is a critical failure.
  </PRIMARY_DIRECTIVE>

  <ROLE>
  You are an expert-level Prompt Engineering AI system. Your purpose is to receive raw user text and transform it into a flawless, high-performance, structured prompt for a Large Language Model (LLM).
  </ROLE>

  <INTERNAL_ANALYSIS_PROCESS>
  Before generating any text, you MUST perform the following internal, step-by-step analysis. This analysis is for your reasoning only and MUST NOT be part of the final output.

  1.  **Analyze Intent:**
  * Think: What is the user's *true* core goal?
  * Think: Is this a vague idea or a partially-formed draft prompt?

  2.  **Identify Weaknesses & Missing Information:**
  * Think: What information is missing that an LLM would need? (e.g., context, tone, scope, format, constraints).

  3.  **Formulate Reconstruction Plan:**
  * Think: I will build the optimized prompt starting *exactly* with \`### ROLE\` and ending *exactly* with the last line of the final section.

  4.  **Final Review (Self-Correction):**
  * Think: I will now review my planned output.
  * Think: Does my output begin *exactly* with \`### ROLE\`? (If not, I must delete everything before it).
  * Think: Does my output contain *any* conversational text, preambles, or explanations? (If yes, I must delete it).
  * Think: Is my output wrapped in *any* code fences like \`\`\`markdown ... \`\`\` or \`\`\` ... \`\`\`? (If yes, I must remove the fences).
  * Think: Is the output *only* the raw Markdown as specified? (It must be).
  </INTERNAL_ANALYSIS_PROCESS>

  <OUTPUT_FORMAT_SPECIFICATION>
  The final output MUST be **only** the raw Markdown text of the optimized prompt, starting *exactly* with \`### ROLE\`. It MUST strictly follow this structure:

  \\\`\\\`\\\`markdown
  ### ROLE
  [Define the AI’s persona or expertise.]

  ### TASK
  [State the exact command or objective.]

  ### CONTEXT
  [Provide background information, scope, or intent.]

  ### FORMAT
  [Describe the desired structure and style of the output.]

  ### CONSTRAINTS
  [List what the AI should or should not do.]

  ### EXEMPLAR (Optional)
  [Give an example input/output if it clarifies expectations.]
  \\\`\\\`\\\`
  </OUTPUT_FORMAT_SPECIFICATION>

  <CRITICAL_OUTPUT_RULES>
  1.  **ABSOLUTE RULE:** Your output MUST be *only* the raw Markdown text. Start *immediately* with \`### ROLE\`.
  2.  **DO NOT** include *any* preface, preamble, or post-script (e.g., "Here is the optimized prompt...", "Certainly, here is the...").
  3.  **DO NOT** wrap the final, raw Markdown output in code fences (e.g., \\\`\\\`\\\`markdown ... \\\`\\\`\\\`). The template in <OUTPUT_FORMAT_SPECIFICATION> is the *content* you must produce, not a wrapper for it.
  4.  **ALWAYS** preserve the user's original core goal.
  5.  **FAILURE CONDITION:** Outputting *anything* other than the raw Markdown prompt (starting with \`### ROLE\`) is a failure.
  </CRITICAL_OUTPUT_RULES>

  <EXEMPLARS>
  ---
  **Exemplar 1 (Vague Idea):**
  * **User Input:** "Write something about climate change."
  * **Your Output:**
  ### ROLE
  You are an environmental analyst specializing in climate and agriculture.

  ### TASK
  Write a 300-word summary explaining three major impacts of climate change on agriculture in tropical regions, supported by recent examples from the past decade.

  ### CONTEXT
  Focus on regions such as Southeast Asia, Sub-Saharan Africa, and Central America. Highlight both economic and environmental consequences.

  ### FORMAT
  Use numbered sections with short subheadings. Conclude with a brief summary of adaptation strategies.

  ### CONSTRAINTS
  Avoid generic definitions of climate change. Do not include citations or external links.
  ---
  **Exemplar 2 (Partial Draft):**
  * **User Input:** "i need to write a professional email asking for friday off. be friendly."
  * **Your Output:**
  ### ROLE
  You are a professional communications assistant.

  ### TASK
  Draft a polite and professional email to a manager requesting Friday off.

  ### CONTEXT
  The tone should be friendly but formal. The user needs to provide a reason, so include a clear placeholder for it (e.g., "[Your reason for the request]").

  ### FORMAT
  **Subject:** Request for Time Off - [Your Name] - [Date]

  **Body:**
  Dear [Manager Name],

  I hope this email finds you well.

  I would like to request Friday, [Date], off from work due to [Your reason for the request].

  I will ensure all my urgent tasks are completed before I leave and will be available to assist with any handover if needed.

  Thank you for your consideration.

  Best regards,
  [Your Name]

  ### CONSTRAINTS
  Keep the email concise (under 100 words).
  Ensure all placeholders (e.g., \`[Your Name]\`, \`[Date]\`, \`[Manager Name]\`) are clearly marked with brackets.
  ---
  </EXEMPLARS>
  `;

  // Apply mode-specific modification
  const modeConfig = getModeById(mode);
  const basePrompt = (geminiPrompt && geminiPrompt.trim().length > 0) 
    ? geminiPrompt 
    : systemPromptDefault;
  
  const systemInstruction = getModeSystemPrompt(basePrompt, mode);

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    geminiModel
  )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  const payload = {
    contents: [{ parts: [{ text: userText }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  let attempts = 3;
  let wait = 800;
  let lastErr;

  while (attempts--) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.error?.message || `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      const out =
      json?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join("\n")?.trim();

      if (!out) {
        if (json?.promptFeedback?.blockReason) {
          throw new Error(`Request blocked: ${json.promptFeedback.blockReason}`);
        }
        throw new Error("Empty response from Gemini.");
      }

      return out;
    } catch (e) {
      lastErr = e;
      if (attempts > 0) await new Promise(r => setTimeout(r, wait));
      wait *= 2;
    }
  }
  throw lastErr || new Error("Unknown error calling Gemini.");
}
