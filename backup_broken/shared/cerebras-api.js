// shared/cerebras-api.js — Cerebras Cloud Chat Completions API service layer

import { deobfuscateKey, clearKeyFromMemory } from './crypto.js';
import { CEREBRAS_DEFAULTS, getModelInfo } from './models.js';

/**
 * Base URL for Cerebras API
 */
const CEREBRAS_API_BASE = 'https://api.cerebras.ai/v1';

/**
 * Structured error object
 */
class CerebrasError extends Error {
  constructor(message, status, type) {
    super(message);
    this.name = 'CerebrasError';
    this.status = status;
    this.type = type;
  }
}

/**
 * Sleep utility for retry backoff
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in ms
 * @returns {number} Delay in ms
 */
function getBackoffDelay(attempt, baseDelay = 1000) {
  // Exponential backoff: 1s, 2s, 4s
  return Math.min(baseDelay * Math.pow(2, attempt), 8000);
}

/**
 * Parse retry-after header
 * @param {Headers} headers - Response headers
 * @returns {number|null} Retry after in ms, or null
 */
function parseRetryAfter(headers) {
  const retryAfter = headers.get('retry-after');
  if (!retryAfter) return null;
  
  // Can be seconds or HTTP date
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000;
  }
  
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }
  
  return null;
}

/**
 * Send a chat completion request to Cerebras API (non-streaming)
 * @param {Array} messages - Array of message objects {role, content}
 * @param {object} options - Request options
 * @param {string} options.model - Model ID
 * @param {string} options.apiKey - Obfuscated API key
 * @param {number} [options.temperature] - Temperature (0.0-2.0)
 * @param {number} [options.topP] - Top-P (0.0-1.0)
 * @param {number} [options.maxTokens] - Max tokens
 * @param {number} [options.timeout] - Request timeout in ms
 * @param {number} [options.maxRetries] - Max retry attempts
 * @returns {Promise<object>} Response object with text, usage, and model
 */
export async function sendChatCompletion(messages, options) {
  const {
    model,
    apiKey: obfuscatedKey,
    temperature = CEREBRAS_DEFAULTS.temperature,
    topP = CEREBRAS_DEFAULTS.topP,
    maxTokens,
    timeout = CEREBRAS_DEFAULTS.timeout,
    maxRetries = CEREBRAS_DEFAULTS.maxRetries
  } = options;

  if (!obfuscatedKey) {
    throw new CerebrasError('Missing Cerebras API key', 401, 'auth_error');
  }

  if (!model) {
    throw new CerebrasError('Missing model ID', 400, 'invalid_request');
  }

  if (!messages || messages.length === 0) {
    throw new CerebrasError('Messages array is required', 400, 'invalid_request');
  }

  // Deobfuscate the API key
  let apiKey = deobfuscateKey(obfuscatedKey);
  
  try {
    const endpoint = `${CEREBRAS_API_BASE}/chat/completions`;
    
    const payload = {
      model,
      messages,
      stream: false,
      temperature,
      top_p: topP
    };
    
    // Add max_tokens if provided
    if (maxTokens) {
      payload.max_tokens = maxTokens;
    }

    let lastError;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const json = await response.json().catch(() => ({}));

        if (!response.ok) {
          // Handle rate limiting
          if (response.status === 429) {
            const retryAfter = parseRetryAfter(response.headers);
            
            if (attempt < maxRetries) {
              const delay = retryAfter || getBackoffDelay(attempt);
              await sleep(delay);
              attempt++;
              continue;
            }
            
            throw new CerebrasError(
              json?.error?.message || 'Rate limit exceeded. Please try again later.',
              429,
              'rate_limit'
            );
          }

          // Handle authentication errors
          if (response.status === 401 || response.status === 403) {
            throw new CerebrasError(
              json?.error?.message || 'Invalid API key. Please check your credentials.',
              response.status,
              'auth_error'
            );
          }

          // Handle server errors with retry
          if (response.status >= 500 && attempt < maxRetries) {
            await sleep(getBackoffDelay(attempt));
            attempt++;
            continue;
          }

          // Other errors
          const message = json?.error?.message || `${response.status} ${response.statusText}`;
          throw new CerebrasError(message, response.status, 'api_error');
        }

        // Success - parse response
        const text = json?.choices?.[0]?.message?.content?.trim() || '';
        
        if (!text) {
          throw new CerebrasError('Empty response from Cerebras API', 200, 'empty_response');
        }

        return {
          text,
          usage: json.usage || {},
          model: json.model || model
        };

      } catch (err) {
        if (err.name === 'AbortError') {
          lastError = new CerebrasError('Request timeout', 408, 'timeout');
        } else if (err instanceof CerebrasError) {
          lastError = err;
        } else {
          lastError = new CerebrasError(
            err.message || 'Network error',
            0,
            'network_error'
          );
        }

        // Don't retry on auth errors or client errors
        if (lastError.status === 401 || lastError.status === 403 || 
            (lastError.status >= 400 && lastError.status < 500)) {
          throw lastError;
        }

        // Retry on network/server errors
        if (attempt < maxRetries) {
          await sleep(getBackoffDelay(attempt));
          attempt++;
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new CerebrasError('Max retries exceeded', 0, 'max_retries');

  } finally {
    // Clear API key from memory
    clearKeyFromMemory(apiKey);
    apiKey = null;
  }
}

/**
 * Send a chat completion request to Cerebras API (streaming)
 * @param {Array} messages - Array of message objects {role, content}
 * @param {object} options - Request options (same as sendChatCompletion)
 * @param {Function} onChunk - Callback for each chunk (chunk) => void
 * @param {Function} onDone - Callback when stream completes (usage, model) => void
 * @param {Function} onError - Callback on error (error) => void
 * @returns {Promise<void>}
 */
export async function sendChatCompletionStream(messages, options, onChunk, onDone, onError) {
  const {
    model,
    apiKey: obfuscatedKey,
    temperature = CEREBRAS_DEFAULTS.temperature,
    topP = CEREBRAS_DEFAULTS.topP,
    maxTokens,
    timeout = CEREBRAS_DEFAULTS.timeout
  } = options;

  if (!obfuscatedKey) {
    onError(new CerebrasError('Missing Cerebras API key', 401, 'auth_error'));
    return;
  }

  if (!model) {
    onError(new CerebrasError('Missing model ID', 400, 'invalid_request'));
    return;
  }

  if (!messages || messages.length === 0) {
    onError(new CerebrasError('Messages array is required', 400, 'invalid_request'));
    return;
  }

  // Deobfuscate the API key
  let apiKey = deobfuscateKey(obfuscatedKey);
  
  try {
    const endpoint = `${CEREBRAS_API_BASE}/chat/completions`;
    
    const payload = {
      model,
      messages,
      stream: true,
      temperature,
      top_p: topP
    };
    
    if (maxTokens) {
      payload.max_tokens = maxTokens;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      
      if (response.status === 401 || response.status === 403) {
        onError(new CerebrasError(
          json?.error?.message || 'Invalid API key',
          response.status,
          'auth_error'
        ));
        return;
      }
      
      if (response.status === 429) {
        onError(new CerebrasError(
          json?.error?.message || 'Rate limit exceeded',
          429,
          'rate_limit'
        ));
        return;
      }
      
      const message = json?.error?.message || `${response.status} ${response.statusText}`;
      onError(new CerebrasError(message, response.status, 'api_error'));
      return;
    }

    // Process SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let usage = {};
    let modelName = model;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          const trimmed = line.trim();
          
          if (!trimmed || trimmed === 'data: [DONE]') {
            continue;
          }
          
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              
              // Extract model name
              if (json.model) {
                modelName = json.model;
              }
              
              // Extract usage (usually in last chunk)
              if (json.usage) {
                usage = json.usage;
              }
              
              // Extract content delta
              const content = json?.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (parseErr) {
              console.warn('Failed to parse SSE chunk:', parseErr);
            }
          }
        }
      }
      
      // Stream complete
      onDone(usage, modelName);
      
    } catch (streamErr) {
      if (streamErr.name === 'AbortError') {
        onError(new CerebrasError('Request timeout', 408, 'timeout'));
      } else {
        onError(new CerebrasError(
          streamErr.message || 'Stream error',
          0,
          'stream_error'
        ));
      }
    }

  } catch (err) {
    if (err.name === 'AbortError') {
      onError(new CerebrasError('Request timeout', 408, 'timeout'));
    } else if (err instanceof CerebrasError) {
      onError(err);
    } else {
      onError(new CerebrasError(
        err.message || 'Network error',
        0,
        'network_error'
      ));
    }
  } finally {
    // Clear API key from memory
    clearKeyFromMemory(apiKey);
    apiKey = null;
  }
}

/**
 * Test Cerebras connection with a simple request
 * @param {string} obfuscatedKey - Obfuscated API key
 * @param {string} model - Model ID to test
 * @returns {Promise<string>} Sample response text
 */
export async function testConnection(obfuscatedKey, model) {
  const messages = [
    { role: 'user', content: 'Say "Connection successful!" if you can read this.' }
  ];
  
  const result = await sendChatCompletion(messages, {
    apiKey: obfuscatedKey,
    model,
    temperature: 0.7,
    maxTokens: 50
  });
  
  return result.text;
}
