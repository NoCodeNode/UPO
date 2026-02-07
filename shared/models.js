// shared/models.js — Model registry with defaults for Cerebras and Gemini

/**
 * Pre-configured Cerebras models with their specific max_tokens
 */
export const CEREBRAS_MODELS = {
  'zai-glm-4.7': {
    id: 'zai-glm-4.7',
    name: 'Zai GLM 4.7B',
    maxTokens: 65000,
    provider: 'cerebras'
  },
  'gpt-oss-120b': {
    id: 'gpt-oss-120b',
    name: 'GPT-OSS 120B',
    maxTokens: 32768,
    provider: 'cerebras'
  },
  'qwen-3-235b-a22b-instruct-2507': {
    id: 'qwen-3-235b-a22b-instruct-2507',
    name: 'Qwen 3 235B Instruct',
    maxTokens: 20000,
    provider: 'cerebras'
  }
};

/**
 * Gemini models registry
 */
export const GEMINI_MODELS = {
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini'
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini'
  }
};

/**
 * Default configuration for Cerebras API
 * Values match official Cerebras curl examples
 */
export const CEREBRAS_DEFAULTS = {
  temperature: 1,      // Official example for zai-glm-4.7
  topP: 0.95,          // Official example for zai-glm-4.7
  stream: true,
  timeout: 30000,      // 30 seconds
  maxRetries: 3
};

/**
 * Get model info by ID
 * @param {string} modelId - Model ID
 * @param {string} provider - Provider ('cerebras' or 'gemini')
 * @returns {object|null} Model info or null if not found
 */
export function getModelInfo(modelId, provider = 'cerebras') {
  if (provider === 'cerebras') {
    return CEREBRAS_MODELS[modelId] || null;
  }
  if (provider === 'gemini') {
    return GEMINI_MODELS[modelId] || null;
  }
  return null;
}

/**
 * Get all models for a provider
 * @param {string} provider - Provider ('cerebras' or 'gemini')
 * @returns {Array} Array of model objects
 */
export function getModelsForProvider(provider) {
  if (provider === 'cerebras') {
    return Object.values(CEREBRAS_MODELS);
  }
  if (provider === 'gemini') {
    return Object.values(GEMINI_MODELS);
  }
  return [];
}

/**
 * Load custom Cerebras models from storage
 * @returns {Promise<Array>} Array of custom model objects
 */
export async function loadCustomModels() {
  try {
    const { customCerebrasModels = [] } = await chrome.storage.local.get('customCerebrasModels');
    return customCerebrasModels;
  } catch (err) {
    console.error('Failed to load custom models:', err);
    return [];
  }
}

/**
 * Save custom Cerebras models to storage
 * @param {Array} models - Array of custom model objects
 * @returns {Promise<void>}
 */
export async function saveCustomModels(models) {
  try {
    await chrome.storage.local.set({ customCerebrasModels: models });
  } catch (err) {
    console.error('Failed to save custom models:', err);
    throw err;
  }
}

/**
 * Add a custom model
 * @param {string} modelId - Model ID
 * @param {number} maxTokens - Max tokens for the model
 * @returns {Promise<void>}
 */
export async function addCustomModel(modelId, maxTokens) {
  const models = await loadCustomModels();
  
  // Check if model already exists
  if (models.some(m => m.id === modelId)) {
    throw new Error('Model already exists');
  }
  
  models.push({
    id: modelId,
    name: modelId,
    maxTokens: maxTokens,
    provider: 'cerebras',
    custom: true
  });
  
  await saveCustomModels(models);
}

/**
 * Remove a custom model
 * @param {string} modelId - Model ID to remove
 * @returns {Promise<void>}
 */
export async function removeCustomModel(modelId) {
  const models = await loadCustomModels();
  const filtered = models.filter(m => m.id !== modelId);
  await saveCustomModels(filtered);
}

/**
 * Get all Cerebras models (built-in + custom)
 * @returns {Promise<Array>} Array of all Cerebras model objects
 */
export async function getAllCerebrasModels() {
  const builtIn = Object.values(CEREBRAS_MODELS);
  const custom = await loadCustomModels();
  return [...builtIn, ...custom];
}
