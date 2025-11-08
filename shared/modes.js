// shared/modes.js - Smart optimization modes with different strategies

const OPTIMIZATION_MODES = {
  PRECISE: {
    id: 'precise',
    name: '🎯 Precise Mode',
    shortName: 'Precise',
    description: 'Clarifies intent and adds specific details (default)',
    icon: '🎯',
    systemPromptModifier: `Focus on clarity and precision. Add specific details and remove ambiguity. Keep the core intent but make it crystal clear.`,
    default: true
  },
  QUICK: {
    id: 'quick',
    name: '⚡ Quick Mode',
    shortName: 'Quick',
    description: 'Minimal changes, faster processing',
    icon: '⚡',
    systemPromptModifier: `Make minimal but effective improvements. Focus only on the most critical clarifications. Keep changes light and fast.`
  },
  DETAILED: {
    id: 'detailed',
    name: '📝 Detailed Mode',
    shortName: 'Detailed',
    description: 'Expands with context and examples',
    icon: '📝',
    systemPromptModifier: `Expand significantly with relevant context, examples, and detailed specifications. Make the prompt comprehensive and thorough.`
  },
  CREATIVE: {
    id: 'creative',
    name: '🎨 Creative Mode',
    shortName: 'Creative',
    description: 'Optimizes for storytelling and creative prompts',
    icon: '🎨',
    systemPromptModifier: `Optimize for creative and storytelling tasks. Enhance narrative elements, add vivid descriptions, and preserve artistic intent.`
  },
  PROFESSIONAL: {
    id: 'professional',
    name: '💼 Professional Mode',
    shortName: 'Professional',
    description: 'Formal tone for business use',
    icon: '💼',
    systemPromptModifier: `Transform to a professional, formal tone suitable for business contexts. Ensure clarity, professionalism, and proper structure.`
  }
};

// Default mode
const DEFAULT_MODE_ID = 'precise';
const MODE_STORAGE_KEY = 'upoLastMode';

/**
 * Get mode configuration by ID
 */
function getModeById(modeId) {
  const mode = Object.values(OPTIMIZATION_MODES).find(m => m.id === modeId);
  return mode || OPTIMIZATION_MODES.PRECISE;
}

/**
 * Get all available modes as array
 */
function getAllModes() {
  return Object.values(OPTIMIZATION_MODES);
}

/**
 * Save last used mode
 */
async function saveLastMode(modeId) {
  await chrome.storage.local.set({ [MODE_STORAGE_KEY]: modeId });
}

/**
 * Get last used mode
 */
async function getLastMode() {
  const { [MODE_STORAGE_KEY]: modeId } = await chrome.storage.local.get([MODE_STORAGE_KEY]);
  return modeId || DEFAULT_MODE_ID;
}

/**
 * Get mode-specific system prompt
 */
function getModeSystemPrompt(basePrompt, modeId) {
  const mode = getModeById(modeId);
  return `${basePrompt}\n\n<MODE_SPECIFIC_INSTRUCTION>\n${mode.systemPromptModifier}\n</MODE_SPECIFIC_INSTRUCTION>`;
}

// Export for ES6 module usage
export {
  OPTIMIZATION_MODES,
  DEFAULT_MODE_ID,
  getModeById,
  getAllModes,
  saveLastMode,
  getLastMode,
  getModeSystemPrompt
};
